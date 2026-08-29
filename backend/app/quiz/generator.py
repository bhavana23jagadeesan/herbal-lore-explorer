import random
from typing import List, Dict, Any

def generate_quiz_questions(plants: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Generates dynamic multiple choice questions directly from the database plant records.
    """
    questions = []
    if not plants:
        return []

    # Use first 5 plants deterministically
    for idx, plant in enumerate(plants[:5]):
        all_names = [p["name"] for p in plants if p["name"] != plant["name"]]
        distractors = list(dict.fromkeys(all_names))
        random.seed(idx + 42)
        random.shuffle(distractors)
        opts = [plant["name"]] + distractors[:3]
        random.seed(idx + 100)
        random.shuffle(opts)

        if idx % 2 == 0:
            uses_str = ", ".join(plant.get("uses", [])[:2]) if plant.get("uses") else "medicinal therapy"
            q_text = f"Which plant's botanical name is '{plant.get('botanical_name')}' and is used for {uses_str}?"
        else:
            constituents_str = ", ".join(plant.get("constituents", [])[:2]) if plant.get("constituents") else "bioactive compounds"
            q_text = f"Which medicinal plant contains active constituents like {constituents_str}?"

        questions.append({
            "id": f"q_{plant['id']}_{idx}",
            "question": q_text,
            "options": opts,
            "plantId": plant["id"]
        })

    return questions

def evaluate_quiz_submission(answers: Dict[str, str], plants: List[Dict[str, Any]]) -> Dict[str, Any]:
    correct_mapping = {}
    for idx, plant in enumerate(plants[:5]):
        q_id = f"q_{plant['id']}_{idx}"
        correct_mapping[q_id] = plant["name"]

    score = 0
    total = len(answers) if answers else 5

    for q_id, user_ans in answers.items():
        # STRICT evaluation: user answer MUST match the exact plant name for this specific question ID
        expected = correct_mapping.get(q_id)
        if expected and user_ans.strip().lower() == expected.strip().lower():
            score += 1

    xp_earned = score * 50

    return {
        "score": score,
        "total": max(5, total),
        "xpEarned": xp_earned,
        "correctAnswers": correct_mapping
    }
