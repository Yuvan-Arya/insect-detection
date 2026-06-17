import requests
import json

TOKEN = "eyJhbGciOiJIUzUxMiJ9.eyJ1c2VyX2lkIjoxMDM5MDM5NywiZXhwIjoxNzc2NjkxNzQwfQ.GVNFPB1UDcNhtJqbKsYIbYw37HNv-5VeSoglOxm5TJ4RymfZG82CkOA_7Xu6IJNYMCzWLman0YL-dPyIM_HofA"
IMAGE_PATH = "green_darner.jpg" # just change the image name here 
LAT = 22.57
LNG = 88.36

headers = {"Authorization": f"Bearer {TOKEN}"}


print("Identifying image...")
with open(IMAGE_PATH, "rb") as f:
    response = requests.post(
        "https://api.inaturalist.org/v1/computervision/score_image",
        headers=headers,
        data={"lat": LAT, "lng": LNG},
        files={"image": f}
    )

results = response.json().get("results", [])[:3]

print("\nTop 3 suggestions:")
for i, r in enumerate(results, 1):
    taxon = r["taxon"]
    print(f"{i}. {taxon.get('preferred_common_name', 'N/A')} ({taxon['name']}) — score: {r.get('combined_score', 'N/A'):.2f} — taxon_id: {taxon['id']}")


top = results[0]["taxon"]["id"]
print(f"\nPosting observation with taxon_id: {top}...")

obs_response = requests.post(
    "https://api.inaturalist.org/v1/observations",
    headers=headers,
    json={"observation": {"taxon_id": top, "latitude": LAT, "longitude": LNG, "observed_on_string": "2026-04-19"}}
)

obs = obs_response.json()
obs_id = obs["id"]
print(f"Observation created: https://www.inaturalist.org/observations/{obs_id}")

print("Attaching photo...")
with open(IMAGE_PATH, "rb") as f:
    photo_response = requests.post(
        "https://api.inaturalist.org/v1/observation_photos",
        headers=headers,
        data={"observation_photo[observation_id]": obs_id},
        files={"file": f}
    )

print("Done! Photo attached." if photo_response.status_code == 200 else f"Photo upload failed: {photo_response.text}")