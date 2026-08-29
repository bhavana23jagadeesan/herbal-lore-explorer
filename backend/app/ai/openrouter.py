import os
import httpx
import asyncio
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "google/gemini-2.5-flash:free")

RECIPE_TEMPLATES = {
    "wound": {
        "title": "Turmeric & Aloe Vera Antiseptic Poultice",
        "ingredients": [
            "Fresh Turmeric Powder / Paste (Manjal): 1 teaspoon",
            "Fresh Aloe Vera Gel (Kattarazhai): 1 tablespoon",
            "Neem Oil / Virgin Coconut Oil: 3 drops",
            "Clean Sterile Gauze / Bandage"
        ],
        "steps": [
            "Clean the cut or wound thoroughly with clean running water.",
            "Mix fresh turmeric paste with Aloe Vera gel and 3 drops of coconut oil into a smooth paste.",
            "Apply the antiseptic paste gently over the cut/wound.",
            "Cover with sterile gauze to stop bleeding, prevent bacterial infection, and accelerate skin tissue regeneration.",
            "Reapply twice daily until healed."
        ]
    },
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
    "stomach": {
        "title": "Pomegranate Peel & Cumin Soothing Decoction",
        "ingredients": [
            "Dried Pomegranate Peel Powder / Fresh Peel: 1 teaspoon",
            "Cumin Seeds (Jeeragam): 1/2 teaspoon",
            "Curd / Warm Water: 250 ml"
        ],
        "steps": [
            "Boil pomegranate peel and cumin seeds in 250 ml water for 5 minutes.",
            "Strain the liquid into a cup.",
            "Sip warm to calm intestinal spasms, relieve stomach ache, and stop diarrhea."
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
    "joint": {
        "title": "Mustard & Turmeric Anti-Inflammatory Liniment",
        "ingredients": [
            "Warm Mustard Oil / Sesame Oil: 2 tablespoons",
            "Turmeric Powder: 1/2 teaspoon",
            "Camphor (Karpuram): 1 small pinch"
        ],
        "steps": [
            "Warm mustard oil gently in a small pan.",
            "Add turmeric powder and camphor until dissolved.",
            "Gently massage the warm oil onto painful joints twice daily for arthritis & joint pain relief."
        ]
    }
}

MULTILINGUAL_KEYWORDS = {
    "wound": ["cut", "cuts", "wound", "wounds", "injury", "finger", "bleeding", "skin", "burn", "காயம்", "வெட்டு", "இரத்தம்", "விரல்", "घाव", "चोट", "gaayam"],
    "cold": ["cold", "colds", "coldag", "sali", "சளி", "கோல்ட்", "கோல்டா", "கோல்டாக", "கோல்டு", "jukaam", "जुकाम", "jalubu", "జలుబు", "jaladhosham", "ജനദോഷം"],
    "cough": ["cough", "coughs", "irumal", "இருமல்", "இருமலாக", "khaansi", "खांसी", "daggu", "దగ్గు", "chuma", "ചുമ"],
    "headache": ["headache", "headaches", "thalai vali", "தலைவலி", "தலை வலி", "தலை வலிக்குது", "தலைவலியாக", "sir dard", "सिर दर्द", "thala noppi", "తల నప్పి", "thala vedana", "തലവേദന"],
    "stomach": ["stomach", "stomach ache", "belly", "diarrhea", "loose motion", "gas", "வயிறு", "வயிறு வலி", "வயிற்றுப்போக்கு", "pet dard", "पेट दर्द"],
    "fever": ["fever", "fevers", "kaichal", "காய்ச்சல்", "காய்ச்சலாக", "bukhar", "बुखार", "pani", "പനി"],
    "constipation": ["constipation", "malakattu", "மலச்சிக்கல்", "kabz", "कब्ज", "malabaddhakam", "మలబద్ధకం"],
    "joint": ["joint", "knee", "arthritis", "joint pain", "knee pain", "மூட்டு", "மூட்டு வலி", "joint pain"]
}

FARMER_KEYWORDS = [
    "sell", "where to sell", "market value", "price", "cultivation", "cultivate", "farming", "buyback", "vanguard", "yield", "rate", "profit", "profitable", "income",
    "விவசாயி", "விற்க", "சந்தை", "சந்தை விலை", "பயிரிடுதல்", "கத்தாலை", "செடி", "வச்சா", "லாபம்", "லாபமா", "வருமானம்", "வளர்த்தா", "லாபகரமான"
]

async def call_openrouter_api(question: str, context_str: str) -> str:
    if not OPENROUTER_API_KEY or OPENROUTER_API_KEY == "your_openrouter_api_key_here":
        return ""

    system_prompt = (
        "You are an expert AI Ethnopharmacology & Agricultural Specialist for the Vanaspati IEEE MPI Heritage Explorer. "
        "You are fluent in English, Tamil, Telugu, Hindi, Malayalam, and Indian regional languages. "
        "DIRECTIVE FOR HEALTH SYMPTOMS: Match the user's specific symptom accurately (cuts/wounds -> Turmeric Aloe Antiseptic Poultice; headache -> Coriander Ginger Tea; cold/cough -> Tulsi Kudineer; stomach ache -> Pomegranate Cumin Tea; fever -> Nilavembu; constipation -> Aloe Fennel Elixir; joint pain -> Warm Mustard Liniment).\n"
        "DIRECTIVE FOR FARMERS: If asked about farming/selling/profitability, format a structured **Farmer Commercial Guide**.\n"
        "Always write responses in clean English letters so the Text-to-Speech audio reader can speak it out loud clearly."
    )

    user_prompt = f"IEEE MPI Dataset Context:\n{context_str}\n\nUser Question (Multi-lingual): {question}"

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.3,
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
    q_lower = question.lower()

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

    # 1. Multi-lingual Symptom Recipe Fallback Engine (Matched strictly per symptom)
    recipe = None
    for target_sym, aliases in MULTILINGUAL_KEYWORDS.items():
        if any(alias in q_lower for alias in aliases):
            recipe = RECIPE_TEMPLATES.get(target_sym)
            break

    if recipe:
        ing_list = "\n".join([f"- **{ing}**" for ing in recipe["ingredients"]])
        step_list = "\n".join([f"{i+1}. {step}" for i, step in enumerate(recipe["steps"])])

        plant_name = context_plants[0]['name'] if context_plants else "Turmeric / Aloe Vera / Tulsi"
        bot_name = context_plants[0]['botanical_name'] if context_plants else "Curcuma longa / Aloe barbadensis"
        consts = ", ".join(context_plants[0]['constituents']) if context_plants else "Curcumin, Aloin, Active Bio-Alkaloids"

        ans = (
            f"### 🍵 Recommended Herbal Recipe: *{recipe['title']}*\n\n"
            f"Here is a traditional home remedy using dataset-grounded medicinal flora like **{plant_name}** (*{bot_name}*):\n\n"
            f"#### 🛒 Required Ingredients\n{ing_list}\n\n"
            f"#### 🥣 Step-by-Step Preparation & Dosage\n{step_list}\n\n"
            f"---\n"
            f"#### 🧪 Bio-Active Compounds & Mechanism\n"
            f"• **Active Phytochemicals**: {consts}\n"
            f"• **Mechanism of Action**: Provides potent anti-inflammatory, antiseptic wound-healing, and symptom-soothing benefits validated in traditional ethnopharmacology."
        )
        return {
            "answer": ans,
            "sources": sources if sources else ["IEEE MPI Dataset"]
        }

    # 2. Farmer Agricultural, Commercial & Profitability Fallback
    if any(fk in q_lower for fk in FARMER_KEYWORDS):
        crop_name = "Aloe Vera (Kattarazhai)" if ("கத்தாலை" in q_lower or "aloe" in q_lower) else (context_plants[0]['name'] if context_plants else "Medicinal Crops (Tulsi / Ashwagandha / Aloe Vera)")
        bot_name = "Aloe barbadensis miller" if ("கத்தாலை" in q_lower or "aloe" in q_lower) else (context_plants[0]['botanical_name'] if context_plants else "Ocimum tenuiflorum")

        ans = (
            f"### 🌾 Farmer Commercial & Profitability Guide for **{crop_name}** (*{bot_name}*)\n\n"
            f"Yes! Cultivating **{crop_name}** is highly profitable for farmers with strong commercial returns:\n\n"
            f"#### 💰 Estimated Market Value & Net Profit\n"
            f"• **Fresh Leaf Price**: ₹6,000 – ₹12,000 per Ton.\n"
            f"• **Dry Extract / Gel Price**: ₹180 – ₹420 per kg.\n"
            f"• **Annual Yield**: 15 to 20 Tons per acre annually starting 8-10 months after planting.\n"
            f"• **Estimated Net Profit**: ₹80,000 to ₹1,500,000 per acre per year with minimal maintenance!\n\n"
            f"#### 🏪 Where to Sell & Direct Procurement Outlets\n"
            f"1. **Government e-CHARAK Portal**: List produce directly on [e-CHARAK (National Medicinal Plants Board)](https://echarak.in).\n"
            f"2. **Pharma & Cosmetic Companies**: Direct buy-back contracts with CAVINKARE, Dabur, Himalaya Wellness, IMPCOPS, and Patanjali.\n"
            f"3. **Farmer Producer Organizations (FPOs)**: Regional Tamil Nadu & South India Herbal FPOs & APMC Mandis.\n\n"
            f"#### 🌱 Best Cultivation Practices\n"
            f"• **Soil & Irrigation**: Dry sandy loam soil with pH 6.5–8.5. Requires minimal drip irrigation (once every 10 days).\n"
            f"• **Sowing & Spacing**: Plant suckers at 60 cm x 60 cm spacing (approx. 10,000 plants per acre)."
        )
        return {
            "answer": ans,
            "sources": sources if sources else ["IEEE MPI Dataset", "National Medicinal Plants Board (NMPB)"]
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
            f"### 🍵 Recommended Herbal Recipe: *Tulsi Ginger Honey Kudineer*\n\n"
            f"#### 🛒 Required Ingredients\n"
            f"- **Tulsi (Holy Basil) Leaves**: 8 to 10 fresh leaves\n"
            f"- **Fresh Ginger**: 1 inch crushed piece\n"
            f"- **Black Pepper**: 3 crushed peppercorns\n"
            f"- **Honey**: 1 tablespoon\n"
            f"- **Water**: 300 ml\n\n"
            f"#### 🥣 Step-by-Step Preparation & Dosage\n"
            f"1. Boil 300 ml of water with crushed ginger, Tulsi leaves, and peppercorns for 6 minutes.\n"
            f"2. Strain, add honey, and sip warm twice daily.\n\n"
            f"• **Bio-Active Action**: Rich in eugenol and gingerol to relieve cold, cough, and sore throat."
        )

    return {
        "answer": ans,
        "sources": sources if sources else ["IEEE MPI Dataset"]
    }
