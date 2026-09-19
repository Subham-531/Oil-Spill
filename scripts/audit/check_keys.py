import os
from dotenv import load_dotenv

load_dotenv()
keys = ['AISSTREAM_API_KEY', 'CDS_API_KEY', 'CMEMS_USERNAME', 'CMEMS_PASSWORD']
for k in keys:
    val = os.getenv(k)
    status = f"EXISTS (length={len(val)})" if val else "MISSING"
    print(f"{k}: {status}")
