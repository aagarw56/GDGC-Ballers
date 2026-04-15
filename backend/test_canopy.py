from .canopy_client import get_full_product_profile, search_similar_products

result = get_full_product_profile("B0DKD54S65")
print("Title:", result["product"].get("title"))
print("Rating:", result["product"].get("rating"))
print("Reviews found:", len(result["reviews"]))
print("First review:", result["reviews"][0] if result["reviews"] else "none")

similar = search_similar_products("wireless headphones")
print(f"\nFound {len(similar)} similar products:")
for p in similar[:3]:
    price = (p.get("price") or {}).get("display")
    print(f"  - {p.get('title')} | {price} | rating {p.get('rating')}")