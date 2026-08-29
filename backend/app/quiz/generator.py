import random
from typing import List, Dict, Any

def generate_quiz_questions(plants: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Generates dynamic multiple choice questions directly from the database plant records.
    """
    questions = []
    if not plants:
        return []

    for idx, plant in enumerate(plants[:5]):
        all_names = [p["name"] for p in plants]
        distractors = [n for n in all_names if n != plant["name"]]
        random.shuffle(distractors)
        opts = [plant["name"]] + distractors[:3]
        random.shuffle(opts)

        if idx % 2 == 0:
            q_text = f"Which plant's botanical name is '{plant.get('botanical_name')}' and is used for {', '.join(plant.get('uses', [])[:2])}?"
        else:
            q_text = f"Which medicinal plant contains active constituents like {', '.join(plant.get('constituents', [])[:2])}?"

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
        if correct_mapping.get(q_id) == user_ans or any(p["name"] == user_ans for p in plants):
            score += 1

    xp_earned = score * 50

    return {
        "score": score,
        "total": total,
        "xpEarned": xp_earned,
        "correctAnswers": correct_mapping
    }
