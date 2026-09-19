import time
import os
import sys

sys.path.insert(0, os.path.abspath("."))
from backend.attribution.live_ais import live_ais_service

print("=== TESTING LIVE AISSTREAM INGESTION ===")
print("Starting ingestion...")
live_ais_service.start_ingestion()

# Monitor for 15 seconds
for i in range(15):
    time.sleep(1)
    vessels = live_ais_service.get_live_vessels()
    count = len(vessels)
    print(f"Second {i+1}: In-memory live vessels count = {count}")
    if count > 0:
        print(f"Sample live vessel: {vessels[0]}")
        break

print(f"Final live vessel count: {len(live_ais_service.get_live_vessels())}")
live_ais_service.stop_ingestion()
print("Ingestion stopped.")
