import asyncio
import httpx
import random
import time

# Syncing with backend on 127.0.0.1:8001
API_URL = "http://127.0.0.1:9000/api/v1"
ENDPOINTS = [
    ("/status", "GET"),
    ("/users", "GET"),
    ("/data", "POST")
]

async def send_request(client):
    endpoint, method = random.choice(ENDPOINTS)
    url = f"{API_URL}{endpoint}"
    
    try:
        if method == "GET":
            response = await client.get(url, timeout=2.0)
        else:
            response = await client.post(url, timeout=2.0)
        
        print(f"🚀 Sent {method} to {endpoint} - Status: {response.status_code}")
    except Exception as e:
        print(f"❌ Connection Error: Backend server unreachable at {url}")

async def run_simulator():
    print(f"📊 PulseProxy Traffic Simulator Starting on {API_URL}...")
    # Using a pooled client for efficiency
    async with httpx.AsyncClient() as client:
        while True:
            tasks = [send_request(client) for _ in range(random.randint(1, 5))]
            await asyncio.gather(*tasks)
            await asyncio.sleep(random.uniform(0.5, 1.0))

if __name__ == "__main__":
    try:
        asyncio.run(run_simulator())
    except KeyboardInterrupt:
        print("\n🛑 Simulator stopped.")
