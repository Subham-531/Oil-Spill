import React, { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup, CircleMarker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import MapLegend from './MapLegend'

// Default marker icons fix
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
})

// Override Leaflet's default blue path color to Graphite Bridge amber
if (L.Path && L.Path.prototype && L.Path.prototype.options) {
  L.Path.prototype.options.color = '#F0A11B'
}

// Demo region center: Arabian Sea west of Mumbai
const DEMO_CENTER = [19.4974, 72.5443]
const DEMO_ZOOM = 9

/**
 * Controller helper to connect custom zoom rocker and map events
 */
function MapController({ onCursorMove, onZoomChange, flyTarget }) {
  const map = useMap()

  useEffect(() => {
    if (!map) return

    const handleMouseMove = (e) => {
      if (onCursorMove) {
        onCursorMove(e.latlng.lat, e.latlng.lng)
      }
    }

    const handleZoom = () => {
      if (onZoomChange) {
        onZoomChange(map.getZoom())
      }
    }

    map.on('mousemove', handleMouseMove)
    map.on('zoomend', handleZoom)

    return () => {
      map.off('mousemove', handleMouseMove)
      map.off('zoomend', handleZoom)
    }
  }, [map, onCursorMove, onZoomChange])

  useEffect(() => {
    if (flyTarget && map) {
      map.flyTo(flyTarget.center, flyTarget.zoom || 11, {
        duration: 1.2,
      })
    }
  }, [flyTarget, map])

  return null
}

/**
 * Custom Zoom Rocker component
 */
function CustomZoomControl() {
  const map = useMap()

  return (
    <div className="custom-zoom-rocker">
      <button
        className="custom-zoom-btn"
        onClick={() => map.zoomIn()}
        title="Zoom in (+)"
        aria-label="Zoom in"
      >
        +
      </button>
      <button
        className="custom-zoom-btn"
        onClick={() => map.zoomOut()}
        title="Zoom out (-)"
        aria-label="Zoom out"
      >
        −
      </button>
    </div>
  )
}

/**
 * ConsoleMapView — Section 8.2
 * Satellite imagery base map with terrain relief, SAR footprint,
 * and warm-filtered skeuomorphic maritime overlays.
 */
export default function ConsoleMapView({
  detectionResult,
  driftResult,
  attributionResult,
  currentTimeStep,
  selectedVessel,
  onSelectVessel,
  showSpillFill = true,
  showDriftParticles = true,
  showVesselTracks = true,
  showSarSwath = true,
  showLiveAis = false,
  baseMapMode = 'satellite', // 'satellite' | 'relief' | 'tactical'
  onBaseMapModeChange,
  onCursorMove,
  onZoomChange,
  flyTarget,
}) {
  const [zoomLevel, setZoomLevel] = useState(DEMO_ZOOM)
  const [internalBaseMode, setInternalBaseMode] = useState(baseMapMode)
  const [liveVessels, setLiveVessels] = useState([])

  // Poll live AIS vessels when showLiveAis is enabled
  useEffect(() => {
    if (!showLiveAis) return

    const fetchLive = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/attribute/live?format=geojson')
        if (res.ok) {
          const data = await res.json()
          if (data.features) {
            setLiveVessels(data.features)
          }
        }
      } catch (err) {
        // Backend offline or AISStream initializing
      }
    }

    fetchLive()
    const timer = setInterval(fetchLive, 8000)
    return () => clearInterval(timer)
  }, [showLiveAis])

  const activeMode = onBaseMapModeChange ? baseMapMode : internalBaseMode
  const handleModeChange = (mode) => {
    setInternalBaseMode(mode)
    if (onBaseMapModeChange) onBaseMapModeChange(mode)
  }

  // Spill Polygon Style: #131110 at 85% fill, 2px --signal dashed outline
  const spillStyle = {
    color: '#F0A11B', // --signal amber
    weight: 2,
    dashArray: '6 4',
    fillColor: '#131110',
    fillOpacity: showSpillFill ? 0.85 : 0.05,
  }

  // Sentinel-1 SAR Swath Footprint (Arabian Sea Demo Box: ~80km x 80km)
  const sarSwathGeoJSON = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [72.18, 19.82],
          [72.85, 19.82],
          [72.85, 19.18],
          [72.18, 19.18],
          [72.18, 19.82],
        ],
      ],
    },
    properties: {
      satellite: 'Sentinel-1A',
      sensor: 'C-SAR / IW',
      resolution: '10m',
      acquisition: '2024-01-15T06:00:00Z',
    },
  }

  // Hindcast origin window style
  const hindcastStyle = {
    color: '#C9452F', // --alarm red
    weight: 1.5,
    dashArray: '4 4',
    fillColor: '#C9452F',
    fillOpacity: 0.12,
  }

  // Vessel track styling (dashed #EDE4D3 lines, prime suspect --alarm)
  const getVesselTrackStyle = (vessel) => {
    const isPrime = vessel.mmsi === 'CULPRIT_999' || vessel.suspicion_score >= 85
    const isSelected = selectedVessel === vessel.mmsi

    if (isPrime) {
      return {
        color: '#C9452F', // --alarm
        weight: isSelected ? 4 : 3,
        dashArray: '8 4',
        opacity: 0.95,
      }
    }

    return {
      color: '#EDE4D3', // --paper
      weight: isSelected ? 3 : 1.5,
      dashArray: '4 4',
      opacity: isSelected ? 0.9 : 0.45,
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <MapContainer
        center={DEMO_CENTER}
        zoom={DEMO_ZOOM}
        style={{ width: '100%', height: '100%' }}
        zoomControl={false}
      >
        <MapController
          onCursorMove={onCursorMove}
          onZoomChange={(z) => {
            setZoomLevel(z)
            if (onZoomChange) onZoomChange(z)
          }}
          flyTarget={flyTarget}
        />

        <CustomZoomControl />

        {/* 1. SATELLITE IMAGERY BASE (Default — High-Res Photographic Satellite & Terrain) */}
        {activeMode === 'satellite' && (
          <>
            <TileLayer
              key="tile-satellite-base"
              attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
            />
            <TileLayer
              key="tile-satellite-ref"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxZoom={18}
              opacity={0.7}
            />
          </>
        )}

        {/* 2. TERRAIN SHADED RELIEF BASE (Bathymetry, Ridges, Topography) */}
        {activeMode === 'relief' && (
          <>
            <TileLayer
              key="tile-relief-base"
              attribution="Tiles &copy; Esri &mdash; Esri, USGS, NOAA"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Shaded_Relief/MapServer/tile/{z}/{y}/{x}"
              maxZoom={14}
            />
            <TileLayer
              key="tile-relief-ref"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              maxZoom={14}
              opacity={0.65}
            />
          </>
        )}

        {/* 3. TACTICAL DARK CANVAS BASE */}
        {activeMode === 'tactical' && (
          <>
            <TileLayer
              key="tile-tactical-base"
              attribution="Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
              maxZoom={16}
            />
            <TileLayer
              key="tile-tactical-ref"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}"
              maxZoom={16}
            />
          </>
        )}

        {/* Sentinel-1 SAR Acquisition Swath Box */}
        {showSarSwath && (
          <GeoJSON
            key="sar-swath-overlay"
            data={sarSwathGeoJSON}
            style={() => ({
              color: '#F0A11B',
              weight: 1.5,
              dashArray: '8 4',
              fillColor: '#131110',
              fillOpacity: 0.1,
            })}
          />
        )}

        {/* Detected Spill Polygon */}
        {detectionResult && detectionResult.features && (
          <GeoJSON
            data={detectionResult}
            style={() => spillStyle}
          />
        )}

        {/* Origin Window Polygon from Drift */}
        {driftResult && driftResult.origin_estimate && (
          <GeoJSON
            data={driftResult.origin_estimate}
            style={() => hindcastStyle}
          />
        )}

        {/* Drift Simulation Particle Steps */}
        {showDriftParticles && driftResult?.forecast_track && (
          driftResult.forecast_track
            .filter((_, i) => i <= currentTimeStep)
            .map((step, i) => (
              <GeoJSON
                key={`forecast-${i}`}
                data={step}
                style={() => ({
                  color: '#F0A11B',
                  weight: 1.5,
                  fillColor: '#F0A11B',
                  fillOpacity: Math.max(0.1, 0.4 - (i / driftResult.forecast_track.length) * 0.3),
                })}
              />
            ))
        )}

        {/* AIS Suspect Vessel Tracks */}
        {showVesselTracks &&
          attributionResult &&
          attributionResult.map((vessel) =>
            vessel.track_geojson ? (
              <GeoJSON
                key={`vessel-${vessel.mmsi}`}
                data={vessel.track_geojson}
                style={() => getVesselTrackStyle(vessel)}
                eventHandlers={{
                  click: () => onSelectVessel(vessel.mmsi),
                }}
              />
            ) : null
          )}

        {/* Live AIS Vessels from AISStream.io */}
        {showLiveAis &&
          liveVessels.map((feat) => {
            const [lon, lat] = feat.geometry.coordinates
            const p = feat.properties
            return (
              <CircleMarker
                key={`live-ais-${p.mmsi}`}
                center={[lat, lon]}
                radius={6}
                pathOptions={{
                  color: '#F0A11B',
                  fillColor: '#EDE4D3',
                  fillOpacity: 0.95,
                  weight: 2,
                }}
              >
                <Popup>
                  <div
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: '#131110',
                      padding: '4px',
                      minWidth: '160px',
                    }}
                  >
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: '13px',
                        color: '#1D1A16',
                        marginBottom: '4px',
                      }}
                    >
                      {p.name || 'VESSEL'}
                    </div>
                    <div>MMSI: <strong>{p.mmsi}</strong></div>
                    <div>SPEED: {p.sog_kn} kn · COG: {p.cog_deg}°</div>
                    <div style={{ fontSize: '9px', color: '#6E6656', marginTop: '4px' }}>
                      LAST PING: {p.timestamp}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            )
          })}
      </MapContainer>

      {/* Tactile Base Map Mode Switcher (Top Center) */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          left: '70px',
          zIndex: 500,
          display: 'flex',
          alignItems: 'center',
          background: 'rgba(29, 26, 22, 0.94)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius-control)',
          padding: '2px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        }}
      >
        <button
          onClick={() => handleModeChange('satellite')}
          style={{
            background: activeMode === 'satellite' ? '#8A5C05' : 'transparent',
            border: 'none',
            color: activeMode === 'satellite' ? 'var(--ink-text)' : 'var(--fg-dim)',
            fontFamily: 'var(--font-display)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 120ms ease',
          }}
          title="Satellite Imagery Base Map (Sentinel-1 / High-Res Imagery)"
        >
          Satellite
        </button>

        <button
          onClick={() => handleModeChange('relief')}
          style={{
            background: activeMode === 'relief' ? '#8A5C05' : 'transparent',
            border: 'none',
            color: activeMode === 'relief' ? 'var(--ink-text)' : 'var(--fg-dim)',
            fontFamily: 'var(--font-display)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 120ms ease',
          }}
          title="Shaded Relief Terrain & Bathymetry"
        >
          Terrain
        </button>

        <button
          onClick={() => handleModeChange('tactical')}
          style={{
            background: activeMode === 'tactical' ? '#8A5C05' : 'transparent',
            border: 'none',
            color: activeMode === 'tactical' ? 'var(--ink-text)' : 'var(--fg-dim)',
            fontFamily: 'var(--font-display)',
            fontSize: '12px',
            fontWeight: 700,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            padding: '6px 12px',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'all 120ms ease',
          }}
          title="Tactical Dark Canvas"
        >
          Tactical
        </button>
      </div>

      {/* Engraved Compass Rose (Top Right) */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          zIndex: 500,
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'rgba(29, 26, 22, 0.92)',
          border: '1px solid var(--line)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <svg viewBox="0 0 60 60" style={{ width: '42px', height: '42px' }}>
          <circle cx="30" cy="30" r="26" fill="none" stroke="#3A342B" strokeWidth="1" />
          <circle cx="30" cy="30" r="2" fill="#F0A11B" />
          {/* North Pointer (Amber) */}
          <polygon points="30,8 34,28 30,26 26,28" fill="#F0A11B" />
          {/* South Pointer (Muted) */}
          <polygon points="30,52 34,32 30,34 26,32" fill="#3A342B" />
          <text x="30" y="7" fill="#F0A11B" fontFamily="var(--font-mono)" fontSize="8" textAnchor="middle" fontWeight="600">
            N
          </text>
        </svg>
      </div>

      {/* Map Symbology & Color Key (Corner Legend) */}
      <MapLegend showLiveAis={showLiveAis} />

      {/* Reticle + Corner Brackets at Centroid (When Detected) */}
      {detectionResult && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 400,
          }}
        >
          <svg viewBox="0 0 100 100" style={{ width: '80px', height: '80px' }}>
            {/* Corner Brackets */}
            <path d="M 20,30 L 20,20 L 30,20" fill="none" stroke="#F0A11B" strokeWidth="1.5" />
            <path d="M 80,30 L 80,20 L 70,20" fill="none" stroke="#F0A11B" strokeWidth="1.5" />
            <path d="M 20,70 L 20,80 L 30,80" fill="none" stroke="#F0A11B" strokeWidth="1.5" />
            <path d="M 80,70 L 80,80 L 70,80" fill="none" stroke="#F0A11B" strokeWidth="1.5" />
            {/* Crosshair */}
            <circle cx="50" cy="50" r="12" fill="none" stroke="#F0A11B" strokeWidth="1" strokeDasharray="2 2" />
            <line x1="50" y1="32" x2="50" y2="44" stroke="#F0A11B" strokeWidth="1" />
            <line x1="50" y1="56" x2="50" y2="68" stroke="#F0A11B" strokeWidth="1" />
            <line x1="32" y1="50" x2="44" y2="50" stroke="#F0A11B" strokeWidth="1" />
            <line x1="56" y1="50" x2="68" y2="50" stroke="#F0A11B" strokeWidth="1" />
          </svg>
        </div>
      )}

      {/* Scale Bar (Bottom Left Ruler with Mono Ticks) */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          zIndex: 500,
          background: 'rgba(29, 26, 22, 0.92)',
          border: '1px solid var(--line)',
          borderRadius: '4px',
          padding: '6px 12px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--fg-dim)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          pointerEvents: 'none',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '80px' }}>
          <span>0</span>
          <span>10 KM</span>
          <span>20 KM</span>
        </div>
        <div
          style={{
            width: '80px',
            height: '4px',
            border: '1px solid #3A342B',
            background: 'repeating-linear-gradient(90deg, #F0A11B 0 20px, #26221C 20px 40px)',
          }}
        />
      </div>

      {/* Attribution Plaque (Bottom Right) */}
      <div className="engraved-attribution-plaque">
        COP COPERNICUS SENTINEL-1 · CMEMS HYDRODYNAMICS · DUCKDB AIS
      </div>

      {/* Keyboard Hint Chip (Bottom Center-Right) */}
      <div
        style={{
          position: 'absolute',
          bottom: '16px',
          right: '280px',
          zIndex: 500,
          background: 'rgba(19, 17, 16, 0.85)',
          border: '1px solid var(--line)',
          borderRadius: '4px',
          padding: '4px 10px',
          fontFamily: 'var(--font-mono)',
          fontSize: '10px',
          color: 'var(--fg-mute)',
          display: 'flex',
          gap: '12px',
          pointerEvents: 'none',
        }}
        className="keyboard-hints-chip"
      >
        <span>[R] RUN</span>
        <span>[U] UPLOAD</span>
        <span>[E] EXPORT</span>
        <span>[L] LAYERS</span>
        <span>[ESC] CANCEL</span>
      </div>
    </div>
  )
}
