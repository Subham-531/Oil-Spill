"""
Live AIS Ingestion & Rolling History Buffer — AISStream.io Integration
Streams real-time vessel telemetry via WebSocket and maintains a rolling 24-hour buffer
for real-time vessel tracking and retrospective last-5-hour incident attribution.
"""

import asyncio
import json
import logging
import os
import sqlite3
import ssl
import threading
import time
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, List, Optional

try:
    import certifi
    import websockets
except ImportError:
    certifi = None
    websockets = None

logger = logging.getLogger("live_ais")

DB_DIR = Path("data/ais")
DB_PATH = DB_DIR / "live_ais_buffer.db"


class LiveAISManager:
    """Manages live AISStream ingestion and rolling historical query engine."""

    _instance = None
    _lock = threading.Lock()

    def __init__(self):
        self.api_key = os.getenv("AISSTREAM_API_KEY", "")
        self.ws_url = "wss://stream.aisstream.io/v0/stream"
        self._running = False
        self._thread: Optional[threading.Thread] = None
        self._loop: Optional[asyncio.AbstractEventLoop] = None
        self._cache_lock = threading.Lock()
        # In-memory latest state: mmsi -> dict
        self._latest_vessels: Dict[int, dict] = {}
        # In-memory vessel types: mmsi -> str ("Tanker", "Cargo", etc.)
        self._vessel_types: Dict[int, str] = {}
        self._init_db()

    @classmethod
    def get_instance(cls):
        with cls._lock:
            if cls._instance is None:
                cls._instance = cls()
            return cls._instance

    def _decode_ais_type(self, type_code: Optional[int]) -> str:
        """Map AIS numerical type code to standardized human-readable category."""
        if type_code is None:
            return "Commercial Vessel"
        try:
            code = int(type_code)
            if 80 <= code <= 89:
                return "Tanker"
            elif 70 <= code <= 79:
                return "Cargo"
            elif 30 <= code <= 39:
                return "Fishing"
            elif 60 <= code <= 69:
                return "Passenger"
            elif 50 <= code <= 59:
                return "Tug / Service"
            elif 40 <= code <= 49:
                return "High Speed Craft"
            return "Commercial Vessel"
        except (ValueError, TypeError):
            return "Commercial Vessel"

    def _init_db(self):
        """Initialize SQLite rolling buffer table with WAL mode for concurrency."""
        DB_DIR.mkdir(parents=True, exist_ok=True)
        with sqlite3.connect(DB_PATH, timeout=30.0) as conn:
            # Enable WAL mode for high concurrency without locks
            conn.execute("PRAGMA journal_mode=WAL;")
            conn.execute("PRAGMA synchronous=NORMAL;")
            conn.execute(
                """
                CREATE TABLE IF NOT EXISTS vessel_pings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    mmsi INTEGER,
                    ship_name TEXT,
                    ship_type TEXT,
                    latitude REAL,
                    longitude REAL,
                    sog REAL,
                    cog REAL,
                    heading REAL,
                    timestamp TEXT,
                    received_at REAL
                )
                """
            )
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_vessel_mmsi ON vessel_pings(mmsi)"
            )
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_vessel_received ON vessel_pings(received_at)"
            )
            conn.execute(
                "CREATE INDEX IF NOT EXISTS idx_vessel_coords ON vessel_pings(latitude, longitude)"
            )
            conn.commit()

    def start_ingestion(self, bounding_boxes=None):
        """Start the background ingestion listener thread if not already running."""
        if not self.api_key:
            logger.warning("AISSTREAM_API_KEY environment variable not set; live AIS ingestion disabled.")
            return

        if self._thread and self._thread.is_alive():
            return

        if not websockets or not certifi:
            logger.warning("websockets or certifi not installed; cannot start live AIS.")
            return

        self._running = True
        self._thread = threading.Thread(
            target=self._run_event_loop, args=(bounding_boxes,), daemon=True
        )
        self._thread.start()
        logger.info("Live AIS ingestion thread launched.")

    def stop_ingestion(self):
        """Stop background ingestion."""
        self._running = False
        if self._loop and self._loop.is_running():
            self._loop.call_soon_threadsafe(self._loop.stop)

    def _run_event_loop(self, bounding_boxes):
        """Worker thread running the asyncio websocket loop."""
        self._loop = asyncio.new_event_loop()
        asyncio.set_event_loop(self._loop)
        try:
            self._loop.run_until_complete(self._listen_websocket(bounding_boxes))
        except Exception as e:
            logger.error(f"AIS worker exception: {e}")
        finally:
            self._loop.close()

    async def _listen_websocket(self, bounding_boxes=None):
        """Connect to AISStream.io and buffer incoming position reports."""
        if not bounding_boxes:
            # Default: global coverage
            bounding_boxes = [[[-90, -180], [90, 180]]]

        ssl_ctx = ssl.create_default_context(cafile=certifi.where())

        retry_delay = 3
        while self._running:
            try:
                logger.info(f"Connecting to AISStream.io ({self.ws_url})...")
                async with websockets.connect(self.ws_url, ssl=ssl_ctx) as ws:
                    sub_message = {
                        "APIKey": self.api_key,
                        "BoundingBoxes": bounding_boxes,
                        "FilterMessageTypes": ["PositionReport", "ShipStaticData"],
                    }
                    await ws.send(json.dumps(sub_message))
                    logger.info("Subscribed to AISStream position stream successfully.")

                    batch = []
                    last_flush = time.time()

                    while self._running:
                        try:
                            raw_msg = await asyncio.wait_for(ws.recv(), timeout=20.0)
                        except asyncio.TimeoutError:
                            # Send ping / continue
                            continue

                        try:
                            data = json.loads(raw_msg)
                        except (json.JSONDecodeError, TypeError):
                            continue

                        msg_type = data.get("MessageType")
                        meta = data.get("MetaData") or {}
                        msg_body = data.get("Message") or {}

                        if msg_type == "ShipStaticData":
                            static_data = msg_body.get("ShipStaticData") or {}
                            mmsi = meta.get("MMSI")
                            type_code = static_data.get("Type")
                            if mmsi and type_code is not None:
                                v_type = self._decode_ais_type(type_code)
                                with self._cache_lock:
                                    self._vessel_types[mmsi] = v_type

                        elif msg_type == "PositionReport":
                            pos = msg_body.get("PositionReport") or {}

                            mmsi = meta.get("MMSI")
                            name = (meta.get("ShipName") or "").strip() or f"VESSEL-{mmsi}"
                            lat = pos.get("Latitude")
                            lon = pos.get("Longitude")
                            sog = pos.get("Sog", 0.0)
                            cog = pos.get("Cog", 0.0)
                            heading = pos.get("TrueHeading", 0.0)
                            utc_time = meta.get("time_utc") or datetime.now(
                                timezone.utc
                            ).isoformat()
                            now = time.time()

                            if lat is not None and lon is not None and mmsi:
                                with self._cache_lock:
                                    v_type = self._vessel_types.get(mmsi, "Commercial Vessel")
                                    record = {
                                        "mmsi": mmsi,
                                        "ship_name": name,
                                        "ship_type": v_type,
                                        "latitude": lat,
                                        "longitude": lon,
                                        "sog": sog,
                                        "cog": cog,
                                        "heading": heading,
                                        "timestamp": utc_time,
                                        "received_at": now,
                                    }
                                    self._latest_vessels[mmsi] = record

                                batch.append(record)

                        # Flush batch to SQLite every 5 seconds or 50 items
                        if (
                            len(batch) >= 50 or (time.time() - last_flush) > 5.0
                        ) and batch:
                            self._flush_batch(batch)
                            batch = []
                            last_flush = time.time()

            except Exception as e:
                logger.warning(f"AISStream connection dropped ({e}), retrying in {retry_delay}s...")
                await asyncio.sleep(retry_delay)
                retry_delay = min(retry_delay * 1.5, 30)

    def _flush_batch(self, batch: List[dict]):
        """Persist a batch of pings to SQLite and prune pings > 24 hours old."""
        try:
            with sqlite3.connect(DB_PATH, timeout=30.0) as conn:
                conn.executemany(
                    """
                    INSERT INTO vessel_pings (
                        mmsi, ship_name, ship_type, latitude, longitude, sog, cog, heading, timestamp, received_at
                    ) VALUES (
                        :mmsi, :ship_name, :ship_type, :latitude, :longitude, :sog, :cog, :heading, :timestamp, :received_at
                    )
                    """,
                    batch,
                )
                # Prune records older than 24 hours
                cutoff = time.time() - (24 * 3600)
                conn.execute(
                    "DELETE FROM vessel_pings WHERE received_at < ?", (cutoff,)
                )
                conn.commit()
        except Exception as e:
            logger.error(f"Error persisting AIS batch: {e}")

    # =========================================================================
    # Query APIs: Live Snapshot & Historical Replay
    # =========================================================================

    def get_live_vessels(
        self,
        lat_min: Optional[float] = None,
        lat_max: Optional[float] = None,
        lon_min: Optional[float] = None,
        lon_max: Optional[float] = None,
        limit: int = 150,
    ) -> List[dict]:
        """
        Return the most recent live vessel positions (within last 30 minutes).
        Optionally filtered by geographic bounding box.
        """
        now = time.time()
        recent_threshold = now - (30 * 60)

        with self._cache_lock:
            candidates = list(self._latest_vessels.values())

        if not candidates:
            # Cold-start fallback: query latest pings per vessel from SQLite buffer
            try:
                with sqlite3.connect(DB_PATH, timeout=30.0) as conn:
                    conn.row_factory = sqlite3.Row
                    conditions = ["received_at >= ?"]
                    params = [recent_threshold]
                    if lat_min is not None:
                        conditions.append("latitude >= ?")
                        params.append(lat_min)
                    if lat_max is not None:
                        conditions.append("latitude <= ?")
                        params.append(lat_max)
                    if lon_min is not None:
                        conditions.append("longitude >= ?")
                        params.append(lon_min)
                    if lon_max is not None:
                        conditions.append("longitude <= ?")
                        params.append(lon_max)

                    where_str = " AND ".join(conditions)
                    q = f"""
                        SELECT mmsi, ship_name, ship_type, latitude, longitude, sog, cog, heading, timestamp, received_at
                        FROM vessel_pings
                        WHERE {where_str}
                        GROUP BY mmsi
                        ORDER BY received_at DESC
                        LIMIT {limit}
                    """
                    rows = conn.execute(q, params).fetchall()
                    return [dict(r) for r in rows]
            except Exception as e:
                logger.error(f"Error querying live vessels from DB: {e}")
                return []

        results = []
        for v in candidates:
            if v["received_at"] < recent_threshold:
                continue

            lat = v["latitude"]
            lon = v["longitude"]

            if lat_min is not None and lat < lat_min:
                continue
            if lat_max is not None and lat > lat_max:
                continue
            if lon_min is not None and lon < lon_min:
                continue
            if lon_max is not None and lon > lon_max:
                continue

            results.append(v)
            if len(results) >= limit:
                break

        return results

    def get_vessel_history(
        self,
        mmsi: Optional[int] = None,
        hours: float = 5.0,
        lat_min: Optional[float] = None,
        lat_max: Optional[float] = None,
        lon_min: Optional[float] = None,
        lon_max: Optional[float] = None,
    ) -> Dict[int, dict]:
        """
        Return vessel trajectories for the last N hours (default 5 hours).
        Groups chronological points into track LineStrings per MMSI.
        """
        cutoff = time.time() - (hours * 3600)

        conditions = ["received_at >= ?"]
        params = [cutoff]

        if mmsi:
            conditions.append("mmsi = ?")
            params.append(mmsi)
        if lat_min is not None:
            conditions.append("latitude >= ?")
            params.append(lat_min)
        if lat_max is not None:
            conditions.append("latitude <= ?")
            params.append(lat_max)
        if lon_min is not None:
            conditions.append("longitude >= ?")
            params.append(lon_min)
        if lon_max is not None:
            conditions.append("longitude <= ?")
            params.append(lon_max)

        where_clause = " AND ".join(conditions)

        tracks: Dict[int, dict] = {}

        try:
            with sqlite3.connect(DB_PATH, timeout=30.0) as conn:
                conn.row_factory = sqlite3.Row
                query = f"""
                    SELECT mmsi, ship_name, ship_type, latitude, longitude, sog, cog, heading, timestamp, received_at
                    FROM vessel_pings
                    WHERE {where_clause}
                    ORDER BY mmsi, received_at ASC
                    LIMIT 4000
                """
                rows = conn.execute(query, params).fetchall()

                for r in rows:
                    vmmsi = r["mmsi"]
                    if vmmsi not in tracks:
                        tracks[vmmsi] = {
                            "mmsi": str(vmmsi),
                            "name": r["ship_name"],
                            "type": r["ship_type"],
                            "pings_count": 0,
                            "latest_position": [r["longitude"], r["latitude"]],
                            "latest_speed_kn": r["sog"],
                            "latest_timestamp": r["timestamp"],
                            "coordinates": [],
                        }

                    tracks[vmmsi]["pings_count"] += 1
                    tracks[vmmsi]["coordinates"].append(
                        [r["longitude"], r["latitude"]]
                    )
                    tracks[vmmsi]["latest_position"] = [r["longitude"], r["latitude"]]
                    tracks[vmmsi]["latest_speed_kn"] = r["sog"]
                    tracks[vmmsi]["latest_timestamp"] = r["timestamp"]

        except Exception as e:
            logger.error(f"Error querying vessel history: {e}")

        return tracks

    def to_geojson(self, vessels: List[dict]) -> dict:
        """Convert a list of vessel point dicts to a GeoJSON FeatureCollection."""
        features = []
        for v in vessels:
            features.append(
                {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [v["longitude"], v["latitude"]],
                    },
                    "properties": {
                        "mmsi": v["mmsi"],
                        "name": v["ship_name"],
                        "type": v.get("ship_type", "Commercial Vessel"),
                        "sog_kn": v.get("sog", 0.0),
                        "cog_deg": v.get("cog", 0.0),
                        "heading_deg": v.get("heading", 0.0),
                        "timestamp": v.get("timestamp"),
                    },
                }
            )
        return {"type": "FeatureCollection", "features": features}


# Global singleton instance
live_ais_service = LiveAISManager.get_instance()
