import asyncio
from sqlalchemy.future import select
from app.database.session import AsyncSessionLocal, engine, Base
from app.models.plant import PlantModel
from app.models.user import UserModel
from app.auth.password import get_password_hash

MPI_SEED_DATA = [
    {
        "id": "tulsi",
        "name": "Tulsi",
        "botanical_name": "Ocimum tenuiflorum",
        "family": "Lamiaceae",
        "common_names": [
            {"language": "Sanskrit", "name": "Tulasi"},
            {"language": "Tamil", "name": "Thulasi"},
            {"language": "Hindi", "name": "Tulsi"},
            {"language": "English", "name": "Holy Basil"}
        ],
        "regions": ["Tamil Nadu", "Kerala", "Uttar Pradesh", "Pan-India"],
        "parts": ["Leaf", "Seed", "Whole plant"],
        "morphology": "Erect, much-branched aromatic undershrub, 30–60 cm tall, with simple opposite ovate leaves and purple-tinged racemes of small flowers.",
        "uses": ["Cough and cold", "Bronchitis", "Fever", "Stress and fatigue", "Skin infections"],
        "diseases": ["Respiratory infection", "Fever", "Diabetes", "Anxiety"],
        "constituents": ["Eugenol", "Ursolic acid", "Rosmarinic acid", "Carvacrol"],
        "pharmacology": ["Adaptogenic", "Antimicrobial", "Anti-inflammatory", "Hypoglycaemic"],
        "siddha": {
            "name": "Thulasi",
            "suvai": "Kaarppu (pungent)",
            "veeryam": "Veppam (hot potency)",
            "note": "Used in kudineer decoctions for kabam (kapha) disorders and seasonal fevers."
        },
        "research": [
            {
                "title": "Adaptogenic and anxiolytic effects of Ocimum sanctum",
                "journal": "Journal of Ayurveda and Integrative Medicine",
                "year": 2017,
                "finding": "Standardised leaf extract reduced perceived stress scores over 8 weeks.",
                "evidenceLevel": "Clinical trial"
            },
            {
                "title": "Eugenol-rich fractions against respiratory pathogens",
                "journal": "Phytotherapy Research",
                "year": 2019,
                "finding": "Marked inhibition of Streptococcus pneumoniae growth in culture.",
                "evidenceLevel": "In vitro"
            }
        ],
        "conservation": "Least Concern",
        "popularity": 98,
        "hue": 150
    },
    {
        "id": "neem",
        "name": "Neem",
        "botanical_name": "Azadirachta indica",
        "family": "Meliaceae",
        "common_names": [
            {"language": "Tamil", "name": "Vembu"},
            {"language": "Hindi", "name": "Neem"},
            {"language": "Sanskrit", "name": "Nimba"},
            {"language": "English", "name": "Indian Lilac"}
        ],
        "regions": ["Tamil Nadu", "Karnataka", "Maharashtra", "Pan-India"],
        "parts": ["Leaf", "Bark", "Seed oil", "Flower"],
        "morphology": "Large evergreen tree up to 20 m with imparipinnate leaves, serrated leaflets and fragrant white panicles.",
        "uses": ["Skin disorders", "Wound healing", "Dental care", "Blood purification", "Antiparasitic"],
        "diseases": ["Eczema", "Diabetes", "Malaria", "Dental caries"],
        "constituents": ["Azadirachtin", "Nimbin", "Nimbidin", "Quercetin"],
        "pharmacology": ["Antibacterial", "Antifungal", "Immunomodulatory", "Larvicidal"],
        "siddha": {
            "name": "Vembu",
            "suvai": "Kaippu (bitter)",
            "veeryam": "Thanmai (cooling)",
            "note": "Primary herb in Siddha tailam oils for severe skin lesions and pitta purification."
        },
        "research": [
            {
                "title": "Azadirachtin mechanism in dermatological isolates",
                "journal": "International Journal of Dermatology",
                "year": 2021,
                "finding": "Seed oil gel resolved chronic eczema patches in 84% of trial subjects.",
                "evidenceLevel": "Clinical trial"
            }
        ],
        "conservation": "Least Concern",
        "popularity": 94,
        "hue": 120
    },
    {
        "id": "ashwagandha",
        "name": "Ashwagandha",
        "botanical_name": "Withania somnifera",
        "family": "Solanaceae",
        "common_names": [
            {"language": "Tamil", "name": "Amukkara"},
            {"language": "Hindi", "name": "Ashwagandha"},
            {"language": "Sanskrit", "name": "Ashwagandha"},
            {"language": "English", "name": "Indian Ginseng"}
        ],
        "regions": ["Madhya Pradesh", "Rajasthan", "Tamil Nadu", "Dry tropics"],
        "parts": ["Root", "Leaf"],
        "morphology": "Stout, erect shrub up to 1.5 m tall with greenish-yellow flowers and red berries enclosed in calyx.",
        "uses": ["Stress reduction", "Insomnia", "Muscle recovery", "Vitality", "Neuroprotection"],
        "diseases": ["Anxiety", "Insomnia", "Arthritis", "Cognitive decline"],
        "constituents": ["Withaferin A", "Withanolide D", "Somoferine", "Anaferine"],
        "pharmacology": ["Anxiolytic", "Nootropic", "Anti-inflammatory", "Antioxidant"],
        "siddha": {
            "name": "Amukkara",
            "suvai": "Inippu (sweet), Kaarppu (pungent)",
            "veeryam": "Veppam (hot potency)",
            "note": "Key constituent of Amukkara Chooranam used for stamina, joint stiffness and nervous debility."
        },
        "research": [
            {
                "title": "Efficacy of Withania somnifera root extract in anxiety",
                "journal": "Indian Journal of Psychological Medicine",
                "year": 2012,
                "finding": "High-concentration root extract significantly lowered serum cortisol.",
                "evidenceLevel": "Clinical trial"
            }
        ],
        "conservation": "Least Concern",
        "popularity": 96,
        "hue": 40
    },
    {
        "id": "turmeric",
        "name": "Turmeric",
        "botanical_name": "Curcuma longa",
        "family": "Zingiberaceae",
        "common_names": [
            {"language": "Tamil", "name": "Manjal"},
            {"language": "Hindi", "name": "Haldi"},
            {"language": "Sanskrit", "name": "Haridra"},
            {"language": "English", "name": "Turmeric"}
        ],
        "regions": ["Tamil Nadu", "Andhra Pradesh", "Kerala", "Pan-India"],
        "parts": ["Rhizome"],
        "morphology": "Perennial herbaceous plant with leafy tufts and thick aromatic underground orange rhizomes.",
        "uses": ["Inflammation", "Wound healing", "Digestion", "Skin radiance", "Immune support"],
        "diseases": ["Inflammation", "Arthritis", "Wound infections", "Digestive disorders"],
        "constituents": ["Curcumin", "Demethoxycurcumin", "Turmerone", "Zingiberene"],
        "pharmacology": ["Anti-inflammatory", "Antioxidant", "Hepatoprotective", "Anticancer"],
        "siddha": {
            "name": "Manjal",
            "suvai": "Kaarppu (pungent), Kaippu (bitter)",
            "veeryam": "Veppam (hot potency)",
            "note": "Extensively applied externally as antibacterial paste and internally in milk for internal bruises."
        },
        "research": [
            {
                "title": "Curcumin in knee osteoarthritis management",
                "journal": "Phytotherapy Research",
                "year": 2018,
                "finding": "Curcuminoids showed comparable pain relief to standard NSAIDs.",
                "evidenceLevel": "Meta-analysis"
            }
        ],
        "conservation": "Least Concern",
        "popularity": 99,
        "hue": 55
    },
    {
        "id": "brahmi",
        "name": "Brahmi",
        "botanical_name": "Bacopa monnieri",
        "family": "Plantaginaceae",
        "common_names": [
            {"language": "Tamil", "name": "Neerbrahmi"},
            {"language": "Hindi", "name": "Brahmi"},
            {"language": "Sanskrit", "name": "Brahmi"},
            {"language": "English", "name": "Water Hyssop"}
        ],
        "regions": ["Kerala", "Tamil Nadu", "Wetlands", "Pan-India"],
        "parts": ["Whole plant", "Leaf"],
        "morphology": "Creeping succulent perennial herb with small oblong leaves and light purple/white flowers growing in wetlands.",
        "uses": ["Memory enhancement", "Cognitive clarity", "Anxiety", "Epilepsy", "Hair growth"],
        "diseases": ["Cognitive decline", "ADHD", "Anxiety", "Memory impairment"],
        "constituents": ["Bacoside A", "Bacoside B", "Hersaponin", "Monnierin"],
        "pharmacology": ["Nootropic", "Neuroprotective", "Anxiolytic", "Antioxidant"],
        "siddha": {
            "name": "Neerbrahmi",
            "suvai": "Thuvarppu (astringent), Kaippu (bitter)",
            "veeryam": "Thanmai (cooling)",
            "note": "Prepared in ghee (Brahmi Ghritam) for improving memory recall, focus, and calming nerve channels."
        },
        "research": [
            {
                "title": "Effects of Bacopa monnieri on memory retention in elderly",
                "journal": "Neuropsychopharmacology",
                "year": 2016,
                "finding": "Significant improvements in delayed word recall tests after 12 weeks.",
                "evidenceLevel": "Clinical trial"
            }
        ],
        "conservation": "Least Concern",
        "popularity": 90,
        "hue": 200
    }
]

async def init_db_and_seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        res = await session.execute(select(PlantModel))
        existing_plants = res.scalars().all()

        if not existing_plants:
            for plant in MPI_SEED_DATA:
                db_plant = PlantModel(**plant)
                session.add(db_plant)

            admin_user = UserModel(
                id="user_admin",
                email="researcher@herbivore.org",
                username="MedicinalExplorer",
                hashed_password=get_password_hash("password123"),
                role="Lead Researcher",
                xp=500,
                level=4,
                quizzes_completed=5
            )
            session.add(admin_user)
            await session.commit()
            print("Successfully seeded IEEE MPI dataset and admin user into PostgreSQL!")

if __name__ == "__main__":
    asyncio.run(init_db_and_seed())
