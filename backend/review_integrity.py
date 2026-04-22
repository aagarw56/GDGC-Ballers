# review_integrity.py

from .nlp_utils import extract_keywords, sia, STOP_WORDS

# ─── Domain-specific word lists ───────────────────────────────────────────────

PRODUCT_NOISE_WORDS = {
    "also", "like", "just", "really", "very", "good", "great", "nice", "love",
    "bought", "product", "item", "thing", "would", "could", "even", "much",
    "well", "still", "used", "using", "came", "come", "said", "says", "make",
    "made", "best", "ever", "back", "because", "dont", "didnt", "isnt", "wasnt",
    "this", "that", "with", "have", "been", "than", "them", "they", "from",
    "premier", "drink", "tried", "banana", "whilst", "available", "excellent",
    "getting", "going", "think", "know", "feel", "looks", "seems", "look",
    "give", "need", "want", "does", "work", "works", "worked", "will", "shall",
    "sure", "your", "their", "about", "there", "here", "when", "then",
    "these", "those", "some", "more", "less", "over", "same", "such",
}

PRODUCT_BOOST = {
    "quality", "durable", "material", "design", "finish", "texture", "weight",
    "size", "color", "colour", "thick", "thin", "soft", "hard", "sturdy",
    "cheap", "premium", "plastic", "metal", "screen", "battery", "charge",
    "charging", "cable", "case", "grip", "scratch", "clear", "protective",
    "fit", "install", "installation", "camera", "sound", "audio",
    "display", "bright", "accurate", "comfortable", "lightweight", "heavy",
}

PRODUCT_BIGRAMS = {
    "battery life",   "build quality",  "sound quality",   "image quality",
    "picture quality","print quality",  "great quality",   "poor quality",
    "good quality",   "high quality",   "low quality",
    "fast shipping",  "great value",    "good value",      "not worth",
    "easy install",   "easy setup",     "easy use",
    "highly recommend","would recommend","dont recommend",
    "well made",      "cheaply made",   "poorly made",
    "fits perfectly", "stopped working","broke after",     "cracked after",
    "customer service","return policy",
    "not good",       "not great",      "not bad",
    "works great",    "works perfectly","works well",
    "falls apart",    "holds up",       "peeling off",
}


# ─── Sentiment helpers ─────────────────────────────────────────────────────────

def score_single_review(review_text: str) -> dict:
    return sia.polarity_scores(review_text)

def label_sentiment(compound_score: float) -> str:
    if compound_score >= 0.05:  return "Positive"
    if compound_score <= -0.05: return "Negative"
    return "Neutral"

def check_star_sentiment_agreement(star_rating: int, compound_score: float) -> bool:
    if star_rating >= 4: return compound_score >= 0.05
    if star_rating <= 2: return compound_score <= -0.05
    return True


def extract_common_keywords(reviews: list, top_n: int = 10) -> list:
    """Thin wrapper so callers keep the same API as before."""
    return extract_keywords(
        reviews,
        field="body",
        noise_words=PRODUCT_NOISE_WORDS,
        boost_words=PRODUCT_BOOST,
        curated_bigrams=PRODUCT_BIGRAMS,
        min_doc_freq=2,
        min_word_length=4,
        use_proper_noun_filter=False,
        top_n=top_n,
    )


# ─── Review integrity analysis ────────────────────────────────────────────────

def analyze_review_integrity(reviews: list) -> dict:
    if not reviews:
        return {"error": "No reviews found for this product."}

    review_details   = []
    compound_scores  = []
    verified_count   = 0
    agreement_count  = 0
    sentiment_counts = {"Positive": 0, "Neutral": 0, "Negative": 0}

    for review in reviews:
        if not isinstance(review, dict):
            continue
        body        = review.get("body", "")
        star_rating = review.get("rating", 3)
        is_verified = review.get("verifiedPurchase", False)
        if not body:
            continue

        vader_scores = score_single_review(body)
        compound     = vader_scores["compound"]
        label        = label_sentiment(compound)
        agrees       = check_star_sentiment_agreement(star_rating, compound)

        compound_scores.append(compound)
        sentiment_counts[label] += 1
        if is_verified: verified_count  += 1
        if agrees:      agreement_count += 1

        review_details.append({
            "title":           review.get("title", ""),
            "rating":          star_rating,
            "verified":        is_verified,
            "compound_score":  round(compound, 3),
            "sentiment_label": label,
            "star_text_agree": agrees,
        })

    total = len(review_details)
    if total == 0:
        return {"error": "All reviews lacked text content."}

    verified_ratio    = verified_count  / total
    consistency_ratio = agreement_count / total
    avg_compound      = sum(compound_scores) / total

    raw_integrity       = (verified_ratio * 0.60) + (consistency_ratio * 0.40)
    integrity_score_pct = round(raw_integrity * 100)

    if integrity_score_pct >= 80:
        integrity_label = "Most reviews appear organic and verified."
    elif integrity_score_pct >= 60:
        integrity_label = "Some reviews may be unverified — read carefully."
    else:
        integrity_label = "Low review integrity — treat ratings with caution."

    flags = {}
    if verified_ratio < 0.50:
        flags["low_verified_ratio"] = True
    if consistency_ratio < 0.65:
        flags["star_text_mismatch"] = True
    if avg_compound < -0.1 and sum(r["rating"] for r in review_details) / total > 3.5:
        flags["inflated_ratings"] = True

    return {
        "integrity_score_pct":         integrity_score_pct,
        "integrity_label":             integrity_label,
        "verified_purchase_ratio":     round(verified_ratio, 2),
        "sentiment_consistency_ratio": round(consistency_ratio, 2),
        "avg_compound_score":          round(avg_compound, 3),
        "sentiment_breakdown":         sentiment_counts,
        "review_details":              review_details,
        "flags":                       flags,
        "commonKeywords":              extract_common_keywords(reviews),
    }