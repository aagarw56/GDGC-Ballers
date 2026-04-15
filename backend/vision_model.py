import os
import re
from typing import Any
from urllib.parse import unquote, urlparse

import requests


CANOPY_PRODUCT_URL = "https://rest.canopyapi.co/api/amazon/product"
PRODUCT_KEYWORDS = [
    "laptop",
    "smartphone",
    "wired earbuds",
    "wireless earbuds",
    "headphones",
    "monitor",
    "television",
    "speaker",
    "tablet",
    "computer mouse",
    "camera",
    "keyboard",
    "printer",
    "gaming console",
    "charger",
    "router",
    "microphone",
    "watch",
]


def normalize_url_text(url: str) -> str:
    parsed = urlparse(url)
    raw_text = f"{parsed.netloc} {parsed.path} {parsed.query}"
    decoded = unquote(raw_text).lower()
    return re.sub(r"[-_/+=%]+", " ", decoded)


def extract_product_keyword(url: str) -> str:
    normalized = normalize_url_text(url)

    for keyword in sorted(PRODUCT_KEYWORDS, key=len, reverse=True):
        pattern = rf"\b{re.escape(keyword)}\b"
        if re.search(pattern, normalized):
            return keyword

    return "unknown"


def extract_asin(url: str) -> str | None:
    match = re.search(r"/(?:dp|gp/product)/([A-Z0-9]{10})", url, re.IGNORECASE)
    if match:
        return match.group(1).upper()
    return None


def infer_amazon_domain(url: str) -> str:
    host = urlparse(url).netloc.lower()

    domain_map = {
        "amazon.com": "US",
        "www.amazon.com": "US",
        "amazon.co.uk": "GB",
        "www.amazon.co.uk": "GB",
        "amazon.ca": "CA",
        "www.amazon.ca": "CA",
        "amazon.de": "DE",
        "www.amazon.de": "DE",
        "amazon.fr": "FR",
        "www.amazon.fr": "FR",
        "amazon.in": "IN",
        "www.amazon.in": "IN",
        "amazon.co.jp": "JP",
        "www.amazon.co.jp": "JP",
    }

    return domain_map.get(host, "US")


def fetch_canopy_product(url: str) -> dict[str, Any]:
    api_key = os.getenv("CANOPY_API_KEY")
    if not api_key:
        raise RuntimeError("Missing CANOPY_API_KEY environment variable.")

    asin = extract_asin(url)
    if not asin:
        raise ValueError("Could not find an Amazon ASIN in the provided URL.")

    response = requests.get(
        CANOPY_PRODUCT_URL,
        params={
            "asin": asin,
            "domain": infer_amazon_domain(url),
        },
        headers={
            "API-KEY": api_key,
            "Content-Type": "application/json",
        },
        timeout=20,
    )
    response.raise_for_status()
    return response.json()


def analyze_product_url(url: str) -> dict[str, Any]:
    product_keyword = extract_product_keyword(url)
    canopy_data = fetch_canopy_product(url)

    return {
        "productKeyword": product_keyword,
        "asin": extract_asin(url),
        "title": canopy_data.get("title"),
        "price": canopy_data.get("price"),
        "rating": canopy_data.get("rating"),
        "reviewCount": canopy_data.get("ratings_total"),
        "brand": canopy_data.get("brand"),
        "image": canopy_data.get("main_image"),
        "raw": canopy_data,
    }
