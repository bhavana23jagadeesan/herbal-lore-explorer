import os
import httpx
import asyncio
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "google/gemini-2.5-flash:free")

async def call_openrouter_api(question: str, context_str: str) -> str:
    if not OPENROUTER_API_KEY or OPENROUTER_API_KEY == "your_openrouter_api_key_here":
        return ""

    system_prompt = (
        "You are an expert AI Medicinal Plant & Ethnopharmacology Specialist for the Vanaspati IEEE MPI Heritage Explorer. "
        "Provide comprehensive, accurate, clear, and professional answers regarding medicinal plants, active phytochemical constituents, "
        "Siddha literature, and therapeutic applications for the user's query. "
        "Integrate the provided IEEE MPI Dataset Context and supplement with your expert botanical domain knowledge."
    )

    user_prompt = f"IEEE MPI Dataset Context:\n{context_str}\n\nUser Question: {question}"

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "temperature": 0.4,
        "max_tokens": 500
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://herbivore-explorer.org",
        "X-Title": "IEEE MPI Heritage Explorer"
    }

    async with httpx.AsyncClient(timeout=2.0) as client:
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
        api_ans = await asyncio.wait_for(call_openrouter_api(question, context_str), timeout=2.0)
        if api_ans:
            return {
                "answer": api_ans,
                "sources": sources if sources else ["IEEE MPI Dataset"]
            }
    except Exception as e:
        print(f"OpenRouter fast timeout fallback: {e}")

    # Instant expert domain response using dataset records
    if context_plants:
        p0 = context_plants[0]
        fallback_ans = (
            f"Based on the IEEE MPI dataset records, **{p0['name']}** (*{p0['botanical_name']}*) is widely documented for its medicinal properties.\n\n"
            f"• **Therapeutic Uses**: {', '.join(p0['uses'])}\n"
            f"• **Diseases Treated**: {', '.join(p0['diseases'])}\n"
            f"• **Active Phytochemical Constituents**: {', '.join(p0['constituents'])}\n"
            f"• **Siddha Literature & Potency**: {p0['siddha'].get('note', 'Classical traditional Tamil formulation specified in Siddha literature.')}"
        )
    else:
        fallback_ans = (
            f"Regarding **\"{question}\"**, medicinal plants in the IEEE MPI dataset "
            f"like **Aloe Vera** (*Aloe barbadensis*), **Tulsi** (*Ocimum tenuiflorum*), and **Neem** (*Azadirachta indica*) "
            f"contain rich bio-active alkaloids, polyphenols, and flavonoids that provide antimicrobial, anti-inflammatory, and adaptogenic benefits."
        )

    return {
        "answer": fallback_ans,
        "sources": sources if sources else ["IEEE MPI Dataset"]
    }
