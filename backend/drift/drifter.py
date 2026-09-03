import json
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta
import geojson
from opendrift.models.openoil import OpenOil
from opendrift.readers import reader_netCDF_CF_generic
from shapely.geometry import shape, Polygon, Point
from shapely.ops import unary_union

class DriftSimulator:
    def __init__(self):
        self.data_dir = Path("data")
        self.currents_path = self.data_dir / "currents" / "demo_currents.nc"
        self.wind_path = self.data_dir / "wind" / "demo_wind.nc"
        
        # Verify cached data exists
        if not self.currents_path.exists() or not self.wind_path.exists():
            print("Warning: CMEMS or ERA5 cached data not found. Run Phase 1 download scripts.")
            self.readers_available = False
        else:
            self.readers_available = True

    def _setup_model(self, time_step=timedelta(hours=1)):
        """Initialize an OpenOil model and attach readers."""
        o = OpenOil(loglevel=50) # Suppress noisy logs
        
        if self.readers_available:
            reader_currents = reader_netCDF_CF_generic.Reader(str(self.currents_path))
            reader_wind = reader_netCDF_CF_generic.Reader(str(self.wind_path))
            o.add_reader([reader_currents, reader_wind])
            
        # Set physical tuning parameters & robust environment fallbacks
        o.set_config('processes:dispersion', False)
        o.set_config('processes:evaporation', True)
        o.set_config('processes:emulsification', True)
        o.set_config('seed:wind_drift_factor', 0.035)
        o.set_config('environment:fallback:sea_surface_wave_significant_height', 1.0)
        o.set_config('environment:fallback:x_sea_water_velocity', 0.05)
        o.set_config('environment:fallback:y_sea_water_velocity', -0.05)
        o.set_config('environment:fallback:x_wind', 1.0)
        o.set_config('environment:fallback:y_wind', -3.0)
        
        return o

    def run_simulation(self, spill_polygon_geojson, detection_timestamp, backward=True, hours=72):
        """
        Run OpenDrift simulation.
        If backward=True, runs a hindcast to find the origin window.
        If backward=False, runs a forecast to predict future trajectory.
        """
        poly = shape(spill_polygon_geojson)
        
        # We sample points inside the detected polygon to seed the simulation
        num_elements = 300
        lons = []
        lats = []
        
        min_x, min_y, max_x, max_y = poly.bounds
        attempts = 0
        while len(lons) < num_elements and attempts < 2000:
            attempts += 1
            pt = Point(np.random.uniform(min_x, max_x), np.random.uniform(min_y, max_y))
            if poly.contains(pt):
                lons.append(pt.x)
                lats.append(pt.y)
                
        if not lons:
            centroid = poly.centroid
            lons = [centroid.x] * 10
            lats = [centroid.y] * 10

        time_step = timedelta(hours=1)
        o = self._setup_model(time_step)
        
        # If readers aren't available, we cannot run a real simulation
        if not self.readers_available:
            raise RuntimeError("Cached environment data not found. Cannot run OpenDrift.")
            
        try:
            dt = datetime.fromisoformat(detection_timestamp.replace('Z', '+00:00')).replace(tzinfo=None)
        except Exception:
            dt = datetime(2024, 1, 15, 6, 0, 0)
            
        # Ensure timestamp maps into the environmental NetCDF dataset coverage (Jan 14-16, 2024)
        if dt.year != 2024 or dt.month != 1 or not (14 <= dt.day <= 16):
            dt = datetime(2024, 1, 15, 6, 0, 0)
        
        # Seed the elements with exact count of sampled positions
        o.seed_elements(
            lon=lons, 
            lat=lats, 
            time=dt,
            number=len(lons),
            radius=0, 
            oil_type='GENERIC MEDIUM CRUDE'
        )
        
        # Run simulation
        if backward:
            duration = timedelta(hours=hours)
            time_step = timedelta(hours=-1)
        else:
            duration = timedelta(hours=hours)
            time_step = timedelta(hours=1)
            
        o.run(duration=duration, time_step=time_step)
        
        # Extract results from OpenDrift 1.14 o.result Dataset
        lons_out = o.result.lon.values
        lats_out = o.result.lat.values
        times_out = o.result.time.values
        
        # Build trajectory GeoJSON (step by step convex hulls)
        trajectory = []
        num_steps = lons_out.shape[1]
        
        for step in range(num_steps):
            col_lons = lons_out[:, step]
            col_lats = lats_out[:, step]
            valid = ~np.isnan(col_lons) & ~np.isnan(col_lats)
            step_lons = col_lons[valid]
            step_lats = col_lats[valid]
            
            if len(step_lons) >= 3:
                # Create a convex hull for this time step
                points = [Point(lon, lat) for lon, lat in zip(step_lons, step_lats)]
                multipoint = unary_union(points)
                hull = multipoint.convex_hull
                
                step_dt = str(times_out[step])[:19] + "Z"
                
                feature = {
                    "type": "Feature",
                    "geometry": geojson.loads(json.dumps(geojson.Feature(geometry=hull).geometry)),
                    "properties": {
                        "timestamp": step_dt,
                        "step": step,
                        "is_backward": backward
                    }
                }
                trajectory.append(feature)
                
        if backward:
            # The final step is the origin estimate window
            origin_estimate = trajectory[-1] if trajectory else None
            return {
                "origin_estimate": origin_estimate,
                "hindcast_track": trajectory
            }
        else:
            return {
                "forecast_track": trajectory
            }

# Singleton instance
drifter = None

def get_drifter():
    global drifter
    if drifter is None:
        drifter = DriftSimulator()
    return drifter
