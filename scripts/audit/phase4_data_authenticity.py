import os
import sys
import json
import pandas as pd
import pyarrow.parquet as pq
import xarray as xr
import numpy as np

print("=== PHASE 4: DATA FILE AUTHENTICITY AUDIT ===")

# 1. AIS Parquet audit
ais_path = os.path.join("data", "ais", "marinecadastre_2024_01_15.parquet")
print(f"\n--- 1. AIS Parquet: {ais_path} ---")
if os.path.exists(ais_path):
    size_mb = os.path.getsize(ais_path) / (1024 * 1024)
    print(f"File exists! Size: {size_mb:.2f} MB")
    
    # Read metadata using pyarrow
    parquet_file = pq.ParquetFile(ais_path)
    total_rows = parquet_file.metadata.num_rows
    num_cols = parquet_file.metadata.num_columns
    schema = parquet_file.schema
    print(f"Total Rows (metadata): {total_rows:,}")
    print(f"Columns ({num_cols}): {parquet_file.schema.names}")
    
    # Read sample or full if memory allows
    df = pd.read_parquet(ais_path)
    actual_rows = len(df)
    unique_mmsi = df["MMSI"].nunique() if "MMSI" in df.columns else (df["mmsi"].nunique() if "mmsi" in df.columns else "N/A")
    time_col = "BaseDateTime" if "BaseDateTime" in df.columns else ("timestamp" if "timestamp" in df.columns else None)
    
    time_min = df[time_col].min() if time_col else "N/A"
    time_max = df[time_col].max() if time_col else "N/A"
    
    print(f"Actual Row Count in dataframe: {actual_rows:,}")
    print(f"Unique MMSIs: {unique_mmsi:,}")
    print(f"Time span: {time_min} to {time_max}")
    
    # Demo bbox: lat [19.0, 20.0], lon [72.0, 73.0] (Mumbai offshore)
    lat_col = "LAT" if "LAT" in df.columns else ("lat" if "lat" in df.columns else "Latitude")
    lon_col = "LON" if "LON" in df.columns else ("lon" if "lon" in df.columns else "Longitude")
    
    if lat_col in df.columns and lon_col in df.columns:
        mumbai_subset = df[(df[lat_col] >= 19.0) & (df[lat_col] <= 20.0) & (df[lon_col] >= 72.0) & (df[lon_col] <= 73.0)]
        print(f"Rows within Mumbai demo bbox (lat [19, 20], lon [72, 73]): {len(mumbai_subset):,}")
        
        # Check geographic bounds of the entire dataset
        print(f"Dataset bounds: Lat [{df[lat_col].min():.2f}, {df[lat_col].max():.2f}], Lon [{df[lon_col].min():.2f}, {df[lon_col].max():.2f}]")
else:
    print(f"CRITICAL: {ais_path} DOES NOT EXIST!")
    # Check what else is in data/ais/
    if os.path.exists("data/ais"):
        print("Contents of data/ais/:", os.listdir("data/ais"))
    else:
        print("data/ais directory does not exist.")

# 2. Inspect NetCDF files: demo_currents.nc and demo_wind.nc
print("\n--- 2. Environmental NetCDF Files ---")
nc_files = ["data/currents/demo_currents.nc", "data/wind/demo_wind.nc"]
for ncf in nc_files:
    print(f"\nAuditing: {ncf}")
    if os.path.exists(ncf):
        size_kb = os.path.getsize(ncf) / 1024
        print(f"File size: {size_kb:.2f} KB")
        ds = xr.open_dataset(ncf)
        print("Dimensions:", dict(ds.dims))
        print("Data variables:", list(ds.data_vars.keys()))
        print("Attributes:", dict(ds.attrs))
        for var in ds.data_vars:
            v = ds[var]
            vals = v.values
            print(f"  Variable '{var}':")
            print(f"    Shape: {v.shape}, Dtype: {v.dtype}")
            print(f"    Attrs: {dict(v.attrs)}")
            print(f"    Min: {float(np.nanmin(vals)):.4f}, Max: {float(np.nanmax(vals)):.4f}, Mean: {float(np.nanmean(vals)):.4f}, Std: {float(np.nanstd(vals)):.4f}")
            # Check if values are constant or trivially repeating
            unique_vals = np.unique(vals)
            print(f"    Unique values count: {len(unique_vals)}")
            if len(unique_vals) <= 10:
                print(f"    Unique values: {unique_vals}")
    else:
        print(f"{ncf} DOES NOT EXIST!")

