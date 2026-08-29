import os
import sys
import re
import pickle
import pandas as pd
import numpy as np

sys.stdout.reconfigure(encoding='utf-8')

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.multioutput import MultiOutputClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report

DATASET_PATH = r"c:\Users\Welcome\Desktop\anna_university\dataset\MPI Dataset (1).xlsx"
MODEL_SAVE_PATH = os.path.join(os.path.dirname(__file__), "app", "ai", "mpi_ml_model.pkl")

# Define target disease/indication categories for multi-label classification
TARGET_DISEASE_CATEGORIES = [
    "Respiratory & Cold",
    "Skin & Dermatological",
    "Fever & Infections",
    "Pain & Inflammation",
    "Diabetes & Metabolic",
    "Digestive & Gastrointestinal",
    "Nervous & Anxiety",
    "Dental & Oral Care"
]

def map_diseases_to_categories(text: str) -> List[int]:
    t = str(text).lower()
    labels = []

    # Respiratory & Cold
    labels.append(1 if any(w in t for w in ["cough", "cold", "asthma", "chest", "bronchitis", "respiratory", "breath", "catarrh", "phlegm"]) else 0)
    # Skin & Dermatological
    labels.append(1 if any(w in t for w in ["skin", "eczema", "leucoderma", "boil", "ulcer", "leprosy", "wound", "ringworm", "alopeci", "scabies", "pimples", "rash"]) else 0)
    # Fever & Infections
    labels.append(1 if any(w in t for w in ["fever", "malaria", "gonorrhoea", "urethritis", "infection", "bacterial", "microbial", "syphilis"]) else 0)
    # Pain & Inflammation
    labels.append(1 if any(w in t for w in ["pain", "swelling", "rheumatism", "arthritis", "sciatica", "paralysis", "headache", "joint", "inflammation", "ache", "contusion"]) else 0)
    # Diabetes & Metabolic
    labels.append(1 if any(w in t for w in ["diabetes", "sugar", "blood", "purification", "metabolic", "hypoglyc", "cholesterol"]) else 0)
    # Digestive & Gastrointestinal
    labels.append(1 if any(w in t for w in ["piles", "diarrhoea", "dysentery", "stomach", "digest", "bowel", "liver", "jaundice", "constipation", "flatulence", "nausea"]) else 0)
    # Nervous & Anxiety
    labels.append(1 if any(w in t for w in ["anxiety", "stress", "insomnia", "memory", "brain", "nerve", "paraplegia", "decline", "debility", "mental"]) else 0)
    # Dental & Oral Care
    labels.append(1 if any(w in t for w in ["tooth", "dental", "gum", "bleeding", "oral", "caries", "gargle"]) else 0)

    return labels

def train_and_evaluate_model():
    print("=" * 60)
    print("🚀 TRAINING IEEE MPI DATASET MACHINE LEARNING MODEL")
    print("=" * 60)

    if not os.path.exists(DATASET_PATH):
        print(f"Error: Dataset not found at {DATASET_PATH}")
        return

    excel = pd.ExcelFile(DATASET_PATH)
    sheet_name = "Sheet2" if "Sheet2" in excel.sheet_names else excel.sheet_names[0]
    df = pd.read_excel(excel, sheet_name=sheet_name)

    features = []
    labels = []
    species_names = []

    for idx, row in df.iterrows():
        b_name = str(row.get("Botanical name \n") or row.get("Botanical name") or row.get("Botanical name \n.1") or "").strip()
        if not b_name or b_name.lower() == "botanical name" or b_name.lower() == "nan":
            continue

        desc = str(row.get("Botanical description") or row.get("Botanical description.1") or "").strip()
        constituents = str(row.get("Active constituents") or row.get("Active constituents.1") or "").strip()
        usages = str(row.get("Usages") or row.get("Usages.1") or "").strip()
        actions = str(row.get("Actions") or row.get("Actions.1") or "").strip()
        siddha = str(row.get("Siddha literary data") or "").strip()

        part_texts = []
        for col in ["Roots", "Roots.1", "Seeds", "Seeds.1", "Leaves", "Leaves.1", "Flowers", "Flowers.1", "Bark", "Bark.1", "Fruits", "Fruits.1"]:
            val = str(row.get(col) or "").strip()
            if val and val.lower() != "nan" and val.lower() != "nil":
                part_texts.append(val)

        all_text = f"{b_name} {desc} {constituents} {usages} {actions} {' '.join(part_texts)} {siddha}"
        features.append(all_text)
        species_names.append(b_name)

        label_vector = map_diseases_to_categories(f"{usages} {actions} {' '.join(part_texts)} {desc}")
        labels.append(label_vector)

    X = np.array(features)
    y = np.array(labels)

    print(f"📊 Dataset Size: {len(X)} species records")
    print(f"🎯 Target Categories ({len(TARGET_DISEASE_CATEGORIES)}): {', '.join(TARGET_DISEASE_CATEGORIES)}")

    # Ensure at least some labels are present
    pos_counts = y.sum(axis=0)
    for cat, count in zip(TARGET_DISEASE_CATEGORIES, pos_counts):
        print(f"  • Category '{cat}': {count} positive instances")

    # Train / Test Split (80% Train, 20% Test)
    X_train, X_test, y_train, y_test, species_train, species_test = train_test_split(
        X, y, species_names, test_size=0.20, random_state=42
    )

    print(f"\n📈 Train Set Size: {len(X_train)} samples")
    print(f"📉 Test Set Size:  {len(X_test)} samples")
    print("-" * 60)

    # Build Pipeline: TF-IDF Vectorizer + MultiOutput Random Forest Classifier
    vectorizer = TfidfVectorizer(max_features=1000, ngram_range=(1, 2), stop_words='english')
    X_train_vec = vectorizer.fit_transform(X_train)
    X_test_vec = vectorizer.transform(X_test)

    classifier = MultiOutputClassifier(RandomForestClassifier(n_estimators=100, random_state=42))
    classifier.fit(X_train_vec, y_train)

    # Evaluate on Test Set
    y_pred = classifier.predict(X_test_vec)

    acc = accuracy_score(y_test, y_pred)
    prec_micro = precision_score(y_test, y_pred, average='micro', zero_division=0)
    rec_micro = recall_score(y_test, y_pred, average='micro', zero_division=0)
    f1_micro = f1_score(y_test, y_pred, average='micro', zero_division=0)
    f1_macro = f1_score(y_test, y_pred, average='macro', zero_division=0)

    print("📊 MODEL EVALUATION RESULTS (TEST SET):")
    print(f"  • Subset Exact Match Accuracy: {acc * 100:.2f}%")
    print(f"  • Micro Precision:             {prec_micro * 100:.2f}%")
    print(f"  • Micro Recall:                {rec_micro * 100:.2f}%")
    print(f"  • Micro F1-Score:              {f1_micro * 100:.2f}%")
    print(f"  • Macro F1-Score:              {f1_macro * 100:.2f}%")
    print("-" * 60)

    print("📋 PER-CATEGORY CLASSIFICATION REPORT:")
    report = classification_report(y_test, y_pred, target_names=TARGET_DISEASE_CATEGORIES, zero_division=0)
    print(report)

    # Save model artifacts
    model_payload = {
        "vectorizer": vectorizer,
        "classifier": classifier,
        "categories": TARGET_DISEASE_CATEGORIES,
        "accuracy": acc,
        "f1_micro": f1_micro
    }

    os.makedirs(os.path.dirname(MODEL_SAVE_PATH), exist_ok=True)
    with open(MODEL_SAVE_PATH, "wb") as f:
        pickle.dump(model_payload, f)

    print(f"💾 Saved trained ML model checkpoint to: {MODEL_SAVE_PATH}")
    print("=" * 60)

if __name__ == "__main__":
    train_and_evaluate_model()
