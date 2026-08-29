import os
import pickle
import numpy as np
from typing import Dict, Any, List

MODEL_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "ai", "mpi_ml_model.pkl")

class MPIMLService:
    def __init__(self):
        self.model_data = None
        self.vectorizer = None
        self.classifier = None
        self.categories = []
        self.load_model()

    def load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                with open(MODEL_PATH, "rb") as f:
                    self.model_data = pickle.load(f)
                    self.vectorizer = self.model_data["vectorizer"]
                    self.classifier = self.model_data["classifier"]
                    self.categories = self.model_data["categories"]
                print(f"Loaded trained ML Model checkpoint from {MODEL_PATH}")
            except Exception as e:
                print(f"Could not load ML model checkpoint: {e}")

    def predict_categories(self, text: str) -> List[Dict[str, Any]]:
        if not self.vectorizer or not self.classifier:
            return []

        try:
            vec = self.vectorizer.transform([text])
            probs = self.classifier.predict_proba(vec)
            predictions = []

            for idx, cat_name in enumerate(self.categories):
                # Get positive class probability
                cat_prob = probs[idx][0][1] if len(probs[idx][0]) > 1 else 0.0
                if cat_prob > 0.2:
                    predictions.append({
                        "category": cat_name,
                        "confidence": float(round(cat_prob, 3))
                    })

            predictions.sort(key=lambda x: x["confidence"], reverse=True)
            return predictions
        except Exception as e:
            print(f"Prediction error: {e}")
            return []

ml_service = MPIMLService()
