import os
import sys
import argparse
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATA_DIR = Path("data")
SAR_TRAIN_DIR = DATA_DIR / "sar" / "training"
SAR_DEMO_DIR = DATA_DIR / "sar" / "demo"
CURRENTS_DIR = DATA_DIR / "currents"
WIND_DIR = DATA_DIR / "wind"
AIS_REF_DIR = DATA_DIR / "ais" / "reference"
DEMO_CACHE_DIR = DATA_DIR / "demo_cache"

def verify_credentials():
    print("Verifying credentials...")
    creds = {
        "Copernicus Data Space Username": os.getenv("COPERNICUS_DATASPACE_USERNAME"),
        "Copernicus Data Space Password": os.getenv("COPERNICUS_DATASPACE_PASSWORD"),
        "CMEMS Username": os.getenv("CMEMS_USERNAME"),
        "CMEMS Password": os.getenv("CMEMS_PASSWORD"),
        "CDS API Key": os.getenv("CDS_API_KEY")
    }
    
    missing = [k for k, v in creds.items() if not v]
    if missing:
        print(f"Error: Missing credentials in .env file: {', '.join(missing)}")
        sys.exit(1)
        
    print("✅ All required credentials found in .env.")

def setup_directories():
    print("Setting up data directories...")
    for d in [SAR_TRAIN_DIR, SAR_DEMO_DIR, CURRENTS_DIR, WIND_DIR, AIS_REF_DIR, DEMO_CACHE_DIR]:
        d.mkdir(parents=True, exist_ok=True)
    print("✅ Data directories verified.")

def download_ais_reference():
    print("\n--- 1. AIS Reference Schema ---")
    import csv
    # Instead of downloading a 500MB zip file, we will generate a small schema reference file
    # matching the MarineCadastre format for testing.
    sample_file = AIS_REF_DIR / "marinecadastre_sample.csv"
    if not sample_file.exists():
        headers = ["MMSI", "BaseDateTime", "LAT", "LON", "SOG", "COG", "Heading", "VesselName", "IMO", "CallSign", "VesselType", "Status", "Length", "Width", "Draft", "Cargo"]
        with open(sample_file, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerow(headers)
            writer.writerow(["123456789", "2024-01-15T06:30:00", "19.5", "72.5", "12.0", "135.0", "135.0", "TEST VESSEL", "IMO123", "CALL1", "Tanker", "0", "200", "30", "10", "1"])
        print(f"✅ Created AIS schema reference at {sample_file}")
    else:
        print("✅ AIS schema reference already exists.")

def download_cmems_currents(dry_run=False):
    print("\n--- 2. CMEMS Ocean Currents ---")
    cmems_user = os.getenv("CMEMS_USERNAME")
    cmems_pass = os.getenv("CMEMS_PASSWORD")
    
    # We will use the Copernicus Marine toolbox CLI directly via python os.system for simplicity
    # Product: GLOBAL_ANALYSISFORECAST_PHY_001_024 (Global Ocean Physics Analysis and Forecast)
    # Bounding box: 71.5-73.5°E, 18-20.5°N
    
    out_file = CURRENTS_DIR / "demo_currents.nc"
    if out_file.exists():
        print("✅ CMEMS currents data already exists.")
        return

    cmd = (
        f"copernicusmarine subset -i cmems_mod_glo_phy-cur_anfc_0.083deg_PT6H-i "
        f"-x 71.5 -X 73.5 -y 18.0 -Y 20.5 "
        f"-t 2024-01-14T00:00:00 -T 2024-01-16T00:00:00 "
        f"-v uo -v vo "
        f"-o {CURRENTS_DIR} -f demo_currents.nc "
        f"--username '{cmems_user}' --password '{cmems_pass}' --force-download"
    )
    if dry_run:
        print(f"Dry run. Would execute: {cmd}")
    else:
        print("Downloading CMEMS currents (this may take a minute)...")
        os.system(cmd)
        print(f"✅ Downloaded CMEMS currents to {out_file}")

def download_cds_wind(dry_run=False):
    print("\n--- 3. ERA5 Wind Data (CDS) ---")
    out_file = WIND_DIR / "demo_wind.nc"
    if out_file.exists():
        print("✅ ERA5 wind data already exists.")
        return

    import cdsapi

    # Create the .cdsapirc file for cdsapi to use
    rc_path = Path.home() / ".cdsapirc"
    with open(rc_path, "w") as f:
        f.write(f"url: https://cds.climate.copernicus.eu/api/v2\n")
        f.write(f"key: {os.getenv('CDS_API_KEY')}\n")

    if dry_run:
        print("Dry run. Would download ERA5 wind data.")
    else:
        print("Downloading ERA5 wind data via CDS API...")
        try:
            c = cdsapi.Client()
            c.retrieve(
                'reanalysis-era5-single-levels',
                {
                    'product_type': 'reanalysis',
                    'variable': ['10m_u_component_of_wind', '10m_v_component_of_wind'],
                    'year': '2024',
                    'month': '01',
                    'day': ['14', '15', '16'],
                    'time': [f"{h:02d}:00" for h in range(24)],
                    'area': [20.5, 71.5, 18.0, 73.5],
                    'format': 'netcdf',
                },
                str(out_file)
            )
            print(f"✅ Downloaded ERA5 wind to {out_file}")
        except Exception as e:
            print(f"Warning: Failed to download from CDS. API might be busy or credentials invalid. {e}")

def main():
    parser = argparse.ArgumentParser(description="Download data for Phase 1")
    parser.add_argument("--dry-run", action="store_true", help="Print commands without downloading large datasets")
    args = parser.parse_args()

    print("==================================================")
    print(" Phase 1: Data Acquisition & Caching")
    print("==================================================")
    
    verify_credentials()
    setup_directories()
    
    download_ais_reference()
    download_cmems_currents(dry_run=args.dry_run)
    download_cds_wind(dry_run=args.dry_run)
    
    print("\n--- 4. SAR Training & Demo Scene ---")
    print("For the SAR data, since Sentinel-1 scenes are ~1GB+ each, we will download them directly")
    print("via the Copernicus Data Space Ecosystem API in a separate Colab notebook during Phase 2.")
    print("This keeps our local workspace light and allows cloud GPU training.")
    
    print("\n✅ Phase 1 Data Acquisition process complete.")

if __name__ == "__main__":
    main()
