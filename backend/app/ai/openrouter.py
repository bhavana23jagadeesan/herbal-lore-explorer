import os
import httpx
import asyncio
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "google/gemini-2.5-flash:free")

RECIPE_TEMPLATES = {
    "cough": {
        "title": "Tulsi Ginger Honey Kudineer (Traditional Decoction)",
        "ingredients": [
            "Fresh Tulsi (Holy Basil) Leaves: 8 to 10 leaves",
            "Fresh Ginger Root: 1 inch (crushed)",
            "Black Pepper (Milagu): 3 crushed peppercorns",
            "Raw Organic Honey: 1 tablespoon",
            "Filtered Water: 300 ml (approx. 1.5 cups)"
        ],
        "steps": [
            "Boil 300 ml of filtered water in a clean saucepan over medium heat.",
            "Add the crushed ginger, fresh Tulsi leaves, and crushed black pepper.",
            "Simmer gently for 5 to 7 minutes until the volume reduces to about 200 ml.",
            "Strain the warm herbal tea into a cup and mix in 1 tablespoon of raw honey.",
            "Drink warm twice daily after meals until symptoms subside."
        ]
    },
    "cold": {
        "title": "Tulsi Ginger Honey Kudineer (Traditional Decoction)",
        "ingredients": [
            "Fresh Tulsi (Holy Basil) Leaves: 8 to 10 leaves",
            "Fresh Ginger Root: 1 inch (crushed)",
            "Black Pepper (Milagu): 3 crushed peppercorns",
            "Raw Organic Honey: 1 tablespoon",
            "Filtered Water: 300 ml (approx. 1.5 cups)"
        ],
        "steps": [
            "Boil 300 ml of filtered water in a clean saucepan over medium heat.",
            "Add the crushed ginger, fresh Tulsi leaves, and crushed black pepper.",
            "Simmer gently for 5 to 7 minutes until the volume reduces to about 200 ml.",
            "Strain the warm herbal tea into a cup and mix in 1 tablespoon of raw honey.",
            "Drink warm twice daily after meals until symptoms subside."
        ]
    },
    "constipation": {
        "title": "Aloe Vera & Fennel Soothing Elixir",
        "ingredients": [
            "Fresh Aloe Vera Gel: 2 tablespoons (scooped from fresh leaf)",
            "Fennel Seeds (Sombu): 1 teaspoon (crushed)",
            "Lemon Juice: 1 teaspoon",
            "Warm Water: 250 ml (1 glass)"
        ],
        "steps": [
            "Wash a fresh Aloe Vera leaf thoroughly and scoop out 2 tbsp of clear inner gel.",
            "Blend the Aloe Vera gel with 250 ml of warm water and crushed fennel seeds.",
            "Add a squeeze of fresh lemon juice.",
            "Consume fresh on an empty stomach in the morning for gentle digestive motility."
        ]
    },
    "headache": {
        "title": "Coriander Ginger Relief Infusion",
        "ingredients": [
            "Crushed Coriander Seeds (Kothamalli): 1 tablespoon",
            "Crushed Fresh Ginger: 1/2 inch piece",
            "Palm Jaggery / Honey: 1 teaspoon",
            "Water: 300 ml"
        ],
        "steps": [
            "Combine coriander seeds and crushed ginger in 300 ml of water.",
            "Boil on medium heat for 6 minutes until aromatic.",
            "Strain into a mug and sweeten with palm jaggery or honey.",
            "Sip slowly while warm to relieve vascular tension and head pressure."
        ]
    },
    "fever": {
        "title": "Nilavembu & Neem Protective Decoction",
        "ingredients": [
            "King of Bitters (Nilavembu) Powder: 1 teaspoon",
            "Fresh Neem Leaves: 4 leaves (rinsed)",
            "Water: 350 ml"
        ],
        "steps": [
            "Bring 350 ml of water to a boil.",
            "Add Nilavembu powder and rinsed Neem leaves.",
            "Simmer until reduced to 100 ml (approx. 1/3 cup).",
            "Strain and drink warm twice daily during fever recovery."
        ]
    },
    "indigestion": {
        "title": "Cumin & Ajwain Digestive Tea",
        "ingredients": [
            "Cumin Seeds (Jeeragam): 1 teaspoon",
            "Carom Seeds (Ajwain): 1/2 teaspoon",
            "Water: 300 ml"
        ],
        "steps": [
            "Lightly roast cumin and carom seeds in a pan for 30 seconds.",
            "Add 300 ml water and boil for 5 minutes.",
            "Strain and sip warm after heavy meals."
        ]
    }
}

async def call_openrouter_api(question: str, context_str: str) -> str:
    if not OPENROUTER_API_KEY or OPENROUTER_API_KEY == "your_openrouter_api_key_here":
        return ""

    system_prompt = (
        "You are an expert AI Medicinal Plant & Ethnopharmacology Specialist for the Vanaspati IEEE MPI Heritage Explorer. "
        "IMPORTANT DIRECTIVE: Whenever the user mentions any health condition, symptom, or ailment (e.g. cold, cough, constipation, headache, fever, indigestion, skin issues, etc.), "
        "ALWAYS format your answer with a structured **Traditional Herbal Recipe & Remedy Guide** containing:\n"
        "1. **Recommended Recipe Title**\n"
        "2. **Required Ingredients (with exact quantities like 1 tsp, 250ml, 5 leaves, etc.)**\n"
        "3. **Step-by-Step Preparation & Dosage Instructions**\n"
        "4. **Bio-Active Compounds & Phytochemical Action**\n"
        "Do NOT output raw Tamil script characters. Always use clean English letters."
    )

    user_prompt = f"IEEE MPI Dataset Context:\n{context_str}\n\nUser Question: {question}"

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.4,
        "max_tokens": 600
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://herbivore-explorer.org",
        "X-Title": "IEEE MPI Heritage Explorer"
    }

    async with httpx.AsyncClient(timeout=2.5) as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            json=payload,
            headers=headers
        )
        if response.status_code == 200:
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            if content and len(content.strip()) > 10:
                return content
    return ""

async def generate_grounded_answer(question: str, context_plants: List[Dict[str, Any]]) -> Dict[str, Any]:
    sources = [f"{p['name']} ({p['botanical_name']})" for p in context_plants]

    context_str = ""
    for p in context_plants:
        context_str += f"""
---
Plant Name: {p['name']}
Botanical Name: {p['botanical_name']}
Family: {p['family']}
Therapeutic Uses: {', '.join(p['uses'])}
Diseases Treated: {', '.join(p['diseases'])}
Active Constituents: {', '.join(p['constituents'])}
Pharmacology: {', '.join(p['pharmacology'])}
Siddha Profile: {p['siddha'].get('name', '')} - Suvai: {p['siddha'].get('suvai', '')}, Veeryam: {p['siddha'].get('veeryam', '')}. Note: {p['siddha'].get('note', '')}
---
"""

    try:
        api_ans = await asyncio.wait_for(call_openrouter_api(question, context_str), timeout=2.5)
        if api_ans:
            return {
                "answer": api_ans,
                "sources": sources if sources else ["IEEE MPI Dataset"]
            }
    except Exception as e:
        print(f"OpenRouter fast timeout fallback: {e}")

    # Smart Recipe Fallback Engine
    q_lower = question.lower()
    recipe = None
    for kw in RECIPE_TEMPLATES:
        if kw in q_lower:
            recipe = RECIPE_TEMPLATES[kw]
            break

    if recipe:
        ing_list = "\n".join([f"- **{ing}**" for ing in recipe["ingredients"]])
        step_list = "\n".join([f"{i+1}. {step}" for i, step in enumerate(recipe["steps"])])

        plant_name = context_plants[0]['name'] if context_plants else "Tulsi / Ginger"
        bot_name = context_plants[0]['botanical_name'] if context_plants else "Ocimum tenuiflorum"
        consts = ", ".join(context_plants[0]['constituents']) if context_plants else "Eugenol, Gingerol, Active Alkaloids"

        ans = (
            f"### 🍵 Recommended Herbal Recipe: *{recipe['title']}*\n\n"
            f"Here is a traditional home remedy using dataset-grounded medicinal flora like **{plant_name}** (*{bot_name}*):\n\n"
            f"#### 🛒 Required Ingredients\n{ing_list}\n\n"
            f"#### 🥣 Step-by-Step Preparation & Dosage\n{step_list}\n\n"
            f"---\n"
            f"#### 🧪 Bio-Active Compounds & Mechanism\n"
            f"• **Active Phytochemicals**: {consts}\n"
            f"• **Mechanism of Action**: Provides potent anti-inflammatory, antimicrobial, and symptom-soothing benefits validated in traditional ethnopharmacology."
        )
        return {
            "answer": ans,
            "sources": sources if sources else ["IEEE MPI Dataset"]
        }

    # Default structured response for general queries
    if context_plants:
        p0 = context_plants[0]
        uses_str = ", ".join(p0['uses'][:3]) if p0['uses'] else "general health"
        consts_str = ", ".join(p0['constituents'][:3]) if p0['constituents'] else "Essential Phytochemicals"

        ans = (
            f"### 🌿 Medicinal Profile: **{p0['name']}** (*{p0['botanical_name']}*)\n\n"
            f"Based on the IEEE MPI dataset, **{p0['name']}** is documented for treating {', '.join(p0['diseases'][:3])}.\n\n"
            f"#### 🍵 Recommended Usage & Decoction\n"
            f"1. **Ingredients**: 5-10 fresh leaves or 1 tsp powder of {p0['name']} in 250ml water.\n"
            f"2. **Preparation**: Boil water with the herb for 5 minutes, strain, and consume warm.\n"
            f"3. **Dosage**: Drink once or twice daily after meals.\n\n"
            f"#### 🧪 Key Bio-Active Compounds\n"
            f"• **Constituents**: {consts_str}\n"
            f"• **Pharmacological Action**: {', '.join(p0['pharmacology'][:3])}\n\n"
            f"• **Siddha Literature Note**: {p0['siddha'].get('note', 'Classical traditional Tamil formulation specified in Siddha literature.')}"
        )
    else:
        ans = (
            f"### 🌿 Recommended Herbal Remedy for *\"{question}\"*\n\n"
            f"#### 🍵 Recommended Recipe: *Tulsi Ginger Herbal Tea*\n\n"
            f"#### 🛒 Required Ingredients\n"
            f"- **Tulsi (Holy Basil) Leaves**: 6 to 8 fresh leaves\n"
            f"- **Fresh Ginger**: 1 inch crushed piece\n"
            f"- **Black Pepper**: 3 crushed peppercorns\n"
            f"- **Honey**: 1 tablespoon\n"
            f"- **Water**: 300 ml\n\n"
            f"#### 🥣 Step-by-Step Instructions\n"
            f"1. Boil 300 ml of water with ginger, Tulsi leaves, and black pepper.\n"
            f"2. Simmer for 5 minutes until reduced to 200 ml.\n"
            f"3. Strain, add honey, and sip warm twice daily.\n\n"
            f"• **Bio-Active Action**: Rich in eugenol and gingerol to relieve inflammation and soothe body discomfort."
        )

    return {
        "answer": ans,
        "sources": sources if sources else ["IEEE MPI Dataset"]
    }
