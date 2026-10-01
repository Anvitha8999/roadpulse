import random
from pathlib import Path

import httpx

API = "http://localhost:8000"
STREETS = [
    "J St & 16th St",
    "Broadway near 21st St",
    "Folsom Blvd at 65th St",
    "Freeport Blvd",
    "Capitol Ave bike lane",
    "Del Paso Blvd",
    "Stockton Blvd",
    "Fair Oaks Blvd",
    "Riverside Blvd",
    "X St underpass",
]

random.seed(42)
images = sorted(Path("data/crack-seg").rglob("images/test/*.jpg"))[:12]
images += sorted(Path("data/sample-test-images").glob("*.jpg"))

for img in images:
    lat = 38.58 + random.uniform(-0.05, 0.05)
    lon = -121.49 + random.uniform(-0.06, 0.06)
    with img.open("rb") as f:
        response = httpx.post(
            f"{API}/reports",
            files={"image": (img.name, f, "image/jpeg")},
            data={
                "latitude": f"{lat:.5f}",
                "longitude": f"{lon:.5f}",
                "description": f"Damage reported on {random.choice(STREETS)}",
            },
            timeout=30,
        )
    response.raise_for_status()
    print(f"Created report {response.json()['id']} from {img.name}")
