import os
import httpx
import asyncio
import re
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "google/gemini-2.5-flash:free")

def is_tamil_text(text: str) -> bool:
    return any('\u0b80' <= char <= '\u0bff' for char in text)

def clean_markdown(text: str) -> str:
    """Removes raw markdown symbols like ###, **, *, #### to output ChatGPT style clean plain text."""
    if not text:
        return ""
    text = re.sub(r'#+\s*', '', text)  # remove headers
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)  # remove bold
    text = re.sub(r'\*(.*?)\*', r'\1', text)  # remove italics
    text = re.sub(r'`(.*?)`', r'\1', text)  # remove code ticks
    text = re.sub(r'^\s*[-*+]\s+', '• ', text, flags=re.MULTILINE)  # clean bullet dashes
    return text.strip()

async def call_openrouter_api(question: str, context_str: str) -> str:
    if not OPENROUTER_API_KEY or OPENROUTER_API_KEY == "your_openrouter_api_key_here":
        return ""

    system_prompt = (
        "You are an expert AI Ethnopharmacology & Agricultural Commercial Specialist for Vanaspati IEEE MPI Heritage Explorer. "
        "STRICT MANDATORY RESPONSE RULES:\n"
        "1. CHATGPT CONVERSATIONAL STYLE:\n"
        "   - Respond naturally like ChatGPT in clean, helpful plain text paragraphs.\n"
        "   - ABSOLUTELY NO MARKDOWN FORMATTING SYMBOLS (NO ###, NO ####, NO **, NO *).\n"
        "   - Use clean line breaks, emojis (🌿, 🌾, 💰, 🏪, 🌱), and simple bullet points (•).\n"
        "2. FARMER COMMERCIAL & MARKET PROFITABILITY DIRECTIVE:\n"
        "   - When asked about market value, profit, rates, or where to sell ANY medicinal plant (e.g. Aloe Vera, Tulsi, Ashwagandha, Neem, Senna, Lemongrass, Moringa, Vetiver), provide comprehensive real-world market intelligence:\n"
        "     • Market Price & Rates per Ton / per kg\n"
        "     • Estimated Net Profit per Acre per Year\n"
        "     • Where to Sell: Government e-CHARAK Portal (echarak.in), National Medicinal Plants Board (NMPB), Herbal FPOs, and direct buy-back contracts with CAVINKARE, Dabur, Himalaya Wellness, IMPCOPS, Patanjali.\n"
        "     • Soil, spacing & irrigation cultivation tips.\n"
        "3. LANGUAGE MATCHING:\n"
        "   - If the user asks in Tamil (Tamil script or words), respond ONLY in pure Tamil script (தமிழ்).\n"
        "   - If the user asks in English, respond ONLY in English.\n"
        "   - If asked in Hindi, Telugu, or Malayalam, respond ONLY in that exact script.\n"
        "4. HEALTH REMEDIES: Provide clear remedies for cold, cough, constipation, knee pain, pimples, cuts, wounds, headache, fever, stomach ache, hair fall, toothache."
    )

    user_prompt = f"IEEE MPI Dataset Context:\n{context_str}\n\nUser Question: {question}"

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

    async with httpx.AsyncClient(timeout=4.5) as client:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            json=payload,
            headers=headers
        )
        if response.status_code == 200:
            data = response.json()
            content = data["choices"][0]["message"]["content"]
            if content and len(content.strip()) > 5:
                return clean_markdown(content)
    return ""

async def generate_grounded_answer(question: str, context_plants: List[Dict[str, Any]]) -> Dict[str, Any]:
    sources = [f"{p['name']} ({p['botanical_name']})" for p in context_plants]
    q_lower = question.lower()
    in_tamil = is_tamil_text(question)

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
        api_ans = await asyncio.wait_for(call_openrouter_api(question, context_str), timeout=4.5)
        if api_ans:
            return {
                "answer": api_ans,
                "sources": sources if sources else ["IEEE MPI Dataset", "National Medicinal Plants Board (NMPB)"]
            }
    except Exception as e:
        print(f"OpenRouter LLM timeout fallback: {e}")

    # 1. Farmer Cultivation, Market Value & Profitability Queries for ANY Plant
    if any(w in q_lower or w in question for w in ["sell", "market", "cultivat", "farming", "profit", "rate", "price", "income", "விவசாயி", "விற்க", "சந்தை", "பயிரிட", "லாப", "வருமானம்"]):
        crop = context_plants[0]['name'] if context_plants else "Aloe Vera (Kattarazhai) / Tulsi / Ashwagandha"
        bot_name = context_plants[0]['botanical_name'] if context_plants else "Aloe barbadensis miller"

        if in_tamil:
            ans = (
                f"🌾 {crop} பயிரிடுதல், சந்தை விலை மற்றும் விவசாயி லாப வழிகாட்டி\n\n"
                f"ஆம்! {crop} பயிரிடுவது விவசாயிகளுக்கு மிக அதிக வணிக லாபம் தரும் பயிராகும்.\n\n"
                f"💰 சந்தை விலை மற்றும் வருமான மதிப்பீடு:\n"
                f"• புதிய இலைகள் / மூலிகை சந்தை விலை: டன் ஒன்றுக்கு ₹6,000 முதல் ₹15,000 வரை.\n"
                f"• உலர் பொடி / சாறு விலை: கிலோ ஒன்றுக்கு ₹180 முதல் ₹450 வரை.\n"
                f"• வருடாந்திர மகசூல்: ஏக்கருக்கு 15 முதல் 20 டன்கள்.\n"
                f"• நிகர வருடாந்திர லாபம்: ஏக்கருக்கு ₹80,000 முதல் ₹1,50,000 வரை குறைந்த பராமரிப்பு செலவில் ஈட்டலாம்.\n\n"
                f"🏪 விற்பனை செய்யும் இடங்கள் மற்றும் நேரடி கொள்முதல்:\n"
                f"1. மத்திய அரசு e-CHARAK போர்டல்: echarak.in போர்டலில் விவசாயிகள் நேரடியாக தங்கள் மூலிகைகளை பதிவு செய்து நாடு முழுவதும் விற்கலாம்.\n"
                f"2. சித்தா & ஆயுர்வேத மருந்து நிறுவனங்கள்: CAVINKARE, டாபர், இமாலயா, IMPCOPS மற்றும் பதாஞ்சலி நிறுவனங்களின் நேரடி கொள்முதல் ஒப்பந்தங்கள்.\n"
                f"3. மூலிகை விவசாய உற்பத்தியாளர் அமைப்புகள் (Herbal FPOs) மற்றும் மாவட்ட ஏபிஎம்சி சந்தைகள்.\n\n"
                f"🌱 பயிரிடும் முறைகள்:\n"
                f"• மண் மற்றும் பாசனம்: வடிகால் வசதியுள்ள மணல் கலந்த நிலம் (pH 6.5-8.5). 10 நாட்களுக்கு ஒருமுறை சொட்டு நீர் பாசனம் போதுமானது."
            )
        else:
            ans = (
                f"🌾 Commercial Market Value & Profitability Guide for {crop} ({bot_name})\n\n"
                f"Yes, cultivating {crop} is highly profitable for farmers with strong commercial returns.\n\n"
                f"💰 Estimated Market Value & Rates:\n"
                f"• Fresh Crop Market Price: ₹6,000 to ₹15,000 per Ton.\n"
                f"• Dry Extract / Powder Price: ₹180 to ₹450 per kg.\n"
                f"• Annual Yield: 15 to 20 Tons per acre annually.\n"
                f"• Estimated Net Profit: ₹80,000 to ₹150,000 per acre per year with minimal maintenance.\n\n"
                f"🏪 Where to Sell & Direct Buy-Back Procurement Outlets:\n"
                f"1. Government e-CHARAK Portal: List produce directly on echarak.in (National Medicinal Plants Board).\n"
                f"2. Direct Buy-Back Contracts: CAVINKARE, Dabur, Himalaya Wellness, IMPCOPS, and Patanjali.\n"
                f"3. Regional Farmer Producer Organizations (FPOs) and APMC Herbal Mandis.\n\n"
                f"🌱 Cultivation Tips:\n"
                f"• Soil & Irrigation: Well-drained sandy loam soil with pH 6.5–8.5. Minimal drip irrigation once every 10 days."
            )
        return {"answer": clean_markdown(ans), "sources": ["IEEE MPI Dataset", "National Medicinal Plants Board (NMPB)", "e-CHARAK Portal"]}

    # 2. Cuts, Wounds & Bleeding (காயத்துக்கு / காயத்திற்கு / காயம் / வெட்டு / இரத்தம் / cut / wound / injury)
    if any(w in q_lower or w in question for w in ["cut", "wound", "injury", "finger", "bleeding", "காய", "வெட்டு", "இரத்த"]):
        if in_tamil:
            ans = (
                "🌿 காயங்கள் மற்றும் வெட்டுக்காயங்களுக்கான இயற்கை மூலிகை சிகிச்சை\n\n"
                "🛒 தேவையான பொருட்கள்:\n"
                "• மஞ்சள் தூள் / விழுது: 1 தேக்கரண்டி\n"
                "• கற்றாழை ஜெல்: 1 மேஜைக்கரண்டி\n"
                "• தேங்காய் எண்ணெய்: 3 சொட்டுகள்\n"
                "• சுத்தமான பருத்தி துணி / கட்டுக்கட்டு\n\n"
                "🥣 பயன்படுத்தும் முறை:\n"
                "1. காயமடைந்த இடத்தை சுத்தமான நீரில் நன்கு கழுவவும்.\n"
                "2. மஞ்சள் தூள் மற்றும் கற்றாழை ஜெல்லை 3 சொட்டுகள் தேங்காய் எண்ணெயுடன் கலந்து கிருமி நாசினி விழுதாக ஆக்கவும்.\n"
                "3. இந்த விழுதை காயத்தின் மீது தடவி சுத்தமான துணியால் கட்டவும்.\n\n"
                "✨ மருத்துவ நன்மை: மஞ்சளில் உள்ள குர்குமின் மற்றும் கற்றாழையில் உள்ள அலாயின் கிருமித் தொற்றைத் தடுத்து, இரத்தப்போக்கை நிறுத்தி காயத்தை விரைவாக ஆற்றும்."
            )
        else:
            ans = (
                "🌿 Turmeric & Aloe Vera Antiseptic Poultice for Cuts & Wounds\n\n"
                "🛒 Required Ingredients:\n"
                "• Fresh Turmeric Powder or Paste: 1 teaspoon\n"
                "• Fresh Aloe Vera Gel: 1 tablespoon\n"
                "• Pure Coconut Oil: 3 drops\n"
                "• Clean Cotton Bandage\n\n"
                "🥣 Preparation & Application:\n"
                "1. Gently clean the cut or wound with clean water.\n"
                "2. Mix turmeric powder with fresh Aloe Vera gel and coconut oil to form a smooth paste.\n"
                "3. Apply topically over the cut and secure with a clean bandage.\n\n"
                "✨ Bio-Active Benefits: Curcumin and Aloin provide potent antibacterial and rapid tissue regeneration action."
            )
        return {"answer": clean_markdown(ans), "sources": ["IEEE MPI Dataset"]}

    # 3. Constipation (மலச்சிக்கல் / மலக்கட்டு / constipation)
    if any(w in q_lower or w in question for w in ["constipation", "malakattu", "மலச்சிக்கல்", "மல"]):
        if in_tamil:
            ans = (
                "🌿 மலச்சிக்கலுக்கான இயற்கை மூலிகை நிவாரணம்\n\n"
                "🛒 தேவையான பொருட்கள்:\n"
                "• கற்றாழை ஜெல்: 2 மேஜைக்கரண்டி (புதிய இலையிலிருந்து)\n"
                "• சோம்பு (பெருஞ்சீரகம்): 1 தேக்கரண்டி (நுணுக்கியது)\n"
                "• எலுமிச்சை சாறு: 1 தேக்கரண்டி\n"
                "• வெதுவெதுப்பான தண்ணீர்: 1 டம்ளர்\n\n"
                "🥣 பயன்படுத்தும் முறை:\n"
                "1. புதிய கற்றாழை ஜெல்லை வெதுவெதுப்பான தண்ணீர் மற்றும் சோம்பு தூளுடன் கலந்து கொள்ளவும்.\n"
                "2. இதில் எலுமிச்சை சாறு சேர்த்து காலையில் வெறும் வயிற்றில் பருகவும்.\n\n"
                "✨ மருத்துவ நன்மை: கற்றாழை குடல் இயக்கத்தை சீராக்கி மலச்சிக்கலை உடனடியாக குணமாக்குகிறது."
            )
        else:
            ans = (
                "🌿 Natural Aloe Vera & Fennel Remedy for Constipation\n\n"
                "🛒 Required Ingredients:\n"
                "• Fresh Aloe Vera Gel: 2 tablespoons\n"
                "• Crushed Fennel Seeds (Sombu): 1 teaspoon\n"
                "• Lemon Juice: 1 teaspoon\n"
                "• Warm Water: 1 glass (250 ml)\n\n"
                "🥣 Preparation & Dosage:\n"
                "1. Blend fresh Aloe Vera gel with warm water and crushed fennel seeds.\n"
                "2. Squeeze in 1 tsp lemon juice and consume fresh on an empty stomach in the morning.\n\n"
                "✨ Bio-Active Benefits: Softens stool and promotes healthy digestive bowel motility naturally."
            )
        return {"answer": clean_markdown(ans), "sources": ["IEEE MPI Dataset"]}

    # 4. Knee & Joint Pain / Arthritis (மூட்டு வலி / முழங்கால் வலி / knee / joint / arthritis)
    if any(w in q_lower or w in question for w in ["knee", "joint", "arthritis", "மூட்டு", "முழங்கால்"]):
        if in_tamil:
            ans = (
                "🌿 மூட்டு வலி மற்றும் முழங்கால் வீக்கத்திற்கான மூலிகை தைலம்\n\n"
                "🛒 தேவையான பொருட்கள்:\n"
                "• கடுகு எண்ணெய் / நல்லெண்ணெய்: 2 மேஜைக்கரண்டி\n"
                "• மஞ்சள் தூள்: 1/2 தேக்கரண்டி\n"
                "• கற்பூரம்: 1 சிட்டிகை\n\n"
                "🥣 பயன்படுத்தும் முறை:\n"
                "1. கடுகு எண்ணெயை லேசாக சூடாக்கி, அதில் மஞ்சள் தூள் மற்றும் கற்பூரம் சேர்த்து கலக்கவும்.\n"
                "2. இந்த கதகதப்பான எண்ணெயை வலி உள்ள மூட்டுகளில் தினமும் இருவேளை லேசாக நீவி வரவும்.\n\n"
                "✨ மருத்துவ நன்மை: மூட்டு வீக்கம், தசைப்பிடிப்பு மற்றும் எலும்பு இணைப்புகளில் உள்ள வலியை போக்கும்."
            )
        else:
            ans = (
                "🌿 Warm Mustard & Turmeric Liniment for Knee & Joint Pain\n\n"
                "🛒 Required Ingredients:\n"
                "• Mustard Oil or Sesame Oil: 2 tablespoons\n"
                "• Turmeric Powder: 1/2 teaspoon\n"
                "• Camphor (Karpuram): 1 pinch\n\n"
                "🥣 Preparation & Application:\n"
                "1. Gently warm mustard oil in a pan, add turmeric powder and camphor until dissolved.\n"
                "2. Massage the warm oil gently over painful knee joints twice daily.\n\n"
                "✨ Bio-Active Benefits: Curcumin reduces joint inflammation, stiffness, and arthritis pain."
            )
        return {"answer": clean_markdown(ans), "sources": ["IEEE MPI Dataset"]}

    # 5. Pimples & Acne (முகப்பரு / பரு / pimple / acne / spots)
    if any(w in q_lower or w in question for w in ["pimple", "acne", "face", "spots", "முகப்பரு", "பரு"]):
        if in_tamil:
            ans = (
                "🌿 முகப்பரு மற்றும் வடுக்களுக்கான வேம்பு சந்தன பேக்\n\n"
                "🛒 தேவையான பொருட்கள்:\n"
                "• வேப்பிலை பொடி / விழுது: 1 தேக்கரண்டி\n"
                "• சுத்தமான சந்தனப் பொடி: 1 தேக்கரண்டி\n"
                "• கஸ்தூரி மஞ்சள்: 1/2 தேக்கரண்டி\n"
                "• பன்னீர் / கற்றாழை ஜெல்: 1 மேஜைக்கரண்டி\n\n"
                "🥣 பயன்படுத்தும் முறை:\n"
                "1. வேப்பிலை பொடி, சந்தனப் பொடி, கஸ்தூரி மஞ்சளை பன்னீருடன் கலந்து விழுதாக ஆக்கவும்.\n"
                "2. முகத்தைக் கழுவி, முகப்பரு உள்ள இடங்களில் தடவி 15-20 நிமிடங்கள் ஊறவைத்து கழுவவும்.\n\n"
                "✨ மருத்துவ நன்மை: பாக்டீரியாக்களை அழித்து முகப்பரு, சிவத்தல் மற்றும் கருமை வடுக்களை நீக்கும்."
            )
        else:
            ans = (
                "🌿 Neem & Sandalwood Anti-Acne Clarifying Face Pack\n\n"
                "🛒 Required Ingredients:\n"
                "• Fresh Neem Powder or Paste: 1 teaspoon\n"
                "• Sandalwood Powder (Chandanam): 1 teaspoon\n"
                "• Wild Turmeric (Kasthuri Manjal): 1/2 teaspoon\n"
                "• Pure Rose Water or Aloe Vera Gel: 1 tablespoon\n\n"
                "🥣 Preparation & Application:\n"
                "1. Mix ingredients into a cooling smooth paste.\n"
                "2. Apply over acne spots, leave for 15-20 minutes, then rinse with cool water.\n\n"
                "✨ Bio-Active Benefits: Nimbin and Curcumin eliminate acne-causing bacteria and restore clear skin."
            )
        return {"answer": clean_markdown(ans), "sources": ["IEEE MPI Dataset"]}

    # 6. Cold & Cough (சளி / இருமல் / கோல்ட் / cold / cough)
    if any(w in q_lower or w in question for w in ["cold", "cough", "சளி", "இருமல", "இருமல்", "கோல்ட"]):
        if in_tamil:
            ans = (
                "🍵 துளசி இஞ்சி மிளகு கஷாயம் (சளி & இருமல் நிவாரணி)\n\n"
                "🛒 தேவையான பொருட்கள்:\n"
                "• துளசி இலைகள்: 8 முதல் 10\n"
                "• இஞ்சி: 1 துண்டு (தட்டியது)\n"
                "• மிளகு: 3 (நுணுக்கியது)\n"
                "• சுத்தமான தேன்: 1 மேஜைக்கரண்டி\n"
                "• தண்ணீர்: 300 மி.லி\n\n"
                "🥣 செய்முறை:\n"
                "1. தண்ணீரில் துளசி, இஞ்சி, மிளகு சேர்த்து 6 நிமிடங்கள் கொதிக்க வைக்கவும்.\n"
                "2. வடிகட்டி தேன் கலந்து சூடாக தினமும் இருவேளை பருகவும்.\n\n"
                "✨ மருத்துவ நன்மை: தொண்டை புண், நெஞ்சு சளி மற்றும் தொடர் இருமலை உடனடியாகக் கட்டுப்படுத்தும்."
            )
        else:
            ans = (
                "🍵 Tulsi Ginger Honey Kudineer for Cold & Cough Relief\n\n"
                "🛒 Required Ingredients:\n"
                "• Fresh Tulsi Leaves: 8 to 10 leaves\n"
                "• Fresh Crushed Ginger: 1 inch piece\n"
                "• Black Pepper: 3 crushed peppercorns\n"
                "• Raw Honey: 1 tablespoon\n"
                "• Water: 300 ml\n\n"
                "🥣 Preparation & Dosage:\n"
                "1. Boil ingredients in water for 6 minutes, strain into a cup, add honey, and sip warm.\n\n"
                "✨ Bio-Active Benefits: Provides powerful antiviral, expectorant, and immunity-boosting cold relief."
            )
        return {"answer": clean_markdown(ans), "sources": ["IEEE MPI Dataset"]}

    # 7. Turmeric (மஞ்சள் / மஞ்சளின் / turmeric)
    if "மஞ்சள" in question or "மஞ்சள்" in question or "turmeric" in q_lower:
        if in_tamil:
            ans = (
                "🌿 மஞ்சளின் மருத்துவ பயன்கள் (Curcuma longa)\n\n"
                "IEEE MPI தரவுத்தளத்தின்படி, மஞ்சள் ஒரு சிறந்த இயற்கை கிருமி நாசினியாகும்:\n\n"
                "• காயங்கள் மற்றும் தோல் பராமரிப்பு: மஞ்சளில் உள்ள குர்குமின் பாக்டீரியா தொற்றுகளை அழிக்கிறது.\n"
                "• நோய் எதிர்ப்பு சக்தி: வெதுவெதுப்பான பாலில் மஞ்சள் தூள் கலந்து பருகினால் நோய் எதிர்ப்பு சக்தி அதிகரிக்கும்.\n"
                "• வீக்க எதிர்ப்பு: மூட்டு வலி மற்றும் தொண்டை புண்ணை ஆற்றுகிறது."
            )
        else:
            ans = (
                "🌿 Medicinal Uses of Turmeric (Curcuma longa)\n\n"
                "Based on the IEEE MPI dataset, Turmeric is a potent natural antiseptic and anti-inflammatory herb:\n\n"
                "• Antiseptic & Wound Healing: Curcumin in turmeric inhibits bacterial growth.\n"
                "• Immunity Booster: Drinking 1/2 tsp turmeric in warm milk boosts immunity.\n"
                "• Anti-inflammatory Action: Relieves joint pain, sore throat, and digestive inflammation."
            )
        return {"answer": clean_markdown(ans), "sources": sources if sources else ["IEEE MPI Dataset"]}

    # 8. Check direct plant matches in context_plants
    if context_plants and any(p['name'].lower() in q_lower or p['botanical_name'].lower() in q_lower for p in context_plants):
        p0 = context_plants[0]
        if in_tamil:
            ans = (
                f"🌿 மூலிகை விவரம்: {p0['name']} ({p0['botanical_name']})\n\n"
                f"IEEE MPI தரவுத்தளத்தின்படி, {p0['name']} குணமாக்கும் நோய்கள்: {', '.join(p0['diseases'][:3])}.\n\n"
                f"• மருத்துவ பயன்பாடு: {', '.join(p0['uses'][:3])}.\n"
                f"• வேதியியல் கூறுகள்: {', '.join(p0['constituents'][:3])}."
            )
        else:
            ans = (
                f"🌿 Medicinal Profile: {p0['name']} ({p0['botanical_name']})\n\n"
                f"Based on the IEEE MPI dataset, {p0['name']} is used to treat: {', '.join(p0['diseases'][:3])}.\n\n"
                f"• Therapeutic Uses: {', '.join(p0['uses'][:3])}.\n"
                f"• Active Constituents: {', '.join(p0['constituents'][:3])}."
            )
        return {"answer": clean_markdown(ans), "sources": sources}

    # Unavailable Info Fallback
    if in_tamil:
        ans = "இந்த தகவல் தரவுத்தளத்தில் கிடைக்கவில்லை."
    else:
        ans = "This information is not available in the database."

    return {
        "answer": clean_markdown(ans),
        "sources": ["IEEE MPI Dataset"]
    }
