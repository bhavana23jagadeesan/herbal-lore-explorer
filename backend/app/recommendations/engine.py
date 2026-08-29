from typing import List, Dict, Any
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

def calculate_plant_recommendations(target_plant_id: str, all_plants: List[Dict[str, Any]], top_n: int = 3) -> List[Dict[str, Any]]:
    """
    Computes content-based plant recommendations using Scikit-learn TF-IDF and Cosine Similarity
    over combined features: uses + diseases + constituents + family.
    """
    if not all_plants or len(all_plants) < 2:
        return []

    target_index = -1
    corpus = []

    for idx, plant in enumerate(all_plants):
        if plant["id"] == target_plant_id:
            target_index = idx

        uses_text = " ".join(plant.get("uses", []))
        diseases_text = " ".join(plant.get("diseases", []))
        constituents_text = " ".join(plant.get("constituents", []))
        family_text = plant.get("family", "")

        feature_text = f"{family_text} {uses_text} {diseases_text} {constituents_text}"
        corpus.append(feature_text)

    if target_index == -1:
        return all_plants[:top_n]

    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform(corpus)

    cosine_sim = cosine_similarity(tfidf_matrix[target_index], tfidf_matrix).flatten()

    # Sort indices by highest similarity (excluding the target plant itself)
    similar_indices = cosine_sim.argsort()[::-1]
    similar_indices = [i for i in similar_indices if i != target_index]

    recommendations = [all_plants[i] for i in similar_indices[:top_n]]
    return recommendations
