import requests

TOKEN = "eyJhbGciOiJIUzUxMiJ9.eyJ1c2VyX2lkIjoxMDUwMjgzNiwiZXhwIjoxNzc4MDY4MDM2fQ.-xNmxPhYBp1W73Op1wnU8ioaLmAZ2yoON9a4FZvT09o4ziuwnGkPgca6g-cWt0oc6wFccB_xLuFqhvw72Eo_HQ"

taxon_id = input("Enter taxon_id: ").strip()

r = requests.get(
    f"https://api.inaturalist.org/v1/taxa/{taxon_id}",
    headers={"Authorization": f"Bearer {TOKEN}"}
)

t = r.json()["results"][0]

# Build ancestor lookup
ancestors = {a["rank"]: a["name"] for a in t.get("ancestors", [])}
ancestor_keys = {a["rank"]: a["id"] for a in t.get("ancestors", [])}

print(f"""
taxon_id        : {t["id"]}
name            : {t["name"]}
common_name     : {t.get("preferred_common_name", "N/A")}
rank            : {t["rank"]}
status          : {"active" if t.get("is_active") else "inactive"}
extinct         : {t.get("extinct")}
threatened      : {t.get("threatened")}
introduced      : {t.get("introduced")}
native          : {t.get("native")}
endemic         : {t.get("endemic")}

kingdom         : {ancestors.get("kingdom", "N/A")}
phylum          : {ancestors.get("phylum", "N/A")}
class           : {ancestors.get("class", "N/A")}
order           : {ancestors.get("order", "N/A")}
family          : {ancestors.get("family", "N/A")}
genus           : {ancestors.get("genus", "N/A")}
species         : {t["name"]}

kingdom_id      : {ancestor_keys.get("kingdom", "N/A")}
phylum_id       : {ancestor_keys.get("phylum", "N/A")}
class_id        : {ancestor_keys.get("class", "N/A")}
order_id        : {ancestor_keys.get("order", "N/A")}
family_id       : {ancestor_keys.get("family", "N/A")}
genus_id        : {ancestor_keys.get("genus", "N/A")}
parent_id       : {t.get("parent_id")}

observations    : {t.get("observations_count")}
wikipedia_url   : {t.get("wikipedia_url", "N/A")}
photo           : {t.get("default_photo", {}).get("medium_url", "N/A")}
""")