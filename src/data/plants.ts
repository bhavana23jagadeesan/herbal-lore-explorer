/**
 * Local mirror of the IEEE MPI (Medicinal Plant Information) dataset schema.
 * Each record is the unit that feeds search, the knowledge graph, quiz
 * generation and the grounded RAG answers surfaced in the AI assistant.
 */

export type ResearchEvidence = {
  title: string;
  journal: string;
  year: number;
  finding: string;
  evidenceLevel: "In vitro" | "Animal study" | "Clinical trial" | "Meta-analysis";
};

export type Plant = {
  id: string;
  name: string;
  botanicalName: string;
  family: string;
  commonNames: { language: string; name: string }[];
  regions: string[];
  parts: string[];
  morphology: string;
  uses: string[];
  diseases: string[];
  constituents: string[];
  pharmacology: string[];
  siddha: { name: string; suvai: string; veeryam: string; note: string };
  research: ResearchEvidence[];
  conservation: "Least Concern" | "Near Threatened" | "Vulnerable" | "Endangered";
  popularity: number;
  hue: number;
};

export const plants: Plant[] = [
  {
    id: "tulsi",
    name: "Tulsi",
    botanicalName: "Ocimum tenuiflorum",
    family: "Lamiaceae",
    commonNames: [
      { language: "Sanskrit", name: "Tulasi" },
      { language: "Tamil", name: "Thulasi" },
      { language: "Hindi", name: "Tulsi" },
      { language: "English", name: "Holy Basil" },
    ],
    regions: ["Tamil Nadu", "Kerala", "Uttar Pradesh", "Pan-India"],
    parts: ["Leaf", "Seed", "Whole plant"],
    morphology:
      "Erect, much-branched aromatic undershrub, 30–60 cm tall, with simple opposite ovate leaves and purple-tinged racemes of small flowers.",
    uses: ["Cough and cold", "Bronchitis", "Fever", "Stress and fatigue", "Skin infections"],
    diseases: ["Respiratory infection", "Fever", "Diabetes", "Anxiety"],
    constituents: ["Eugenol", "Ursolic acid", "Rosmarinic acid", "Carvacrol"],
    pharmacology: ["Adaptogenic", "Antimicrobial", "Anti-inflammatory", "Hypoglycaemic"],
    siddha: {
      name: "Thulasi",
      suvai: "Kaarppu (pungent)",
      veeryam: "Veppam (hot potency)",
      note: "Used in kudineer decoctions for kabam (kapha) disorders and seasonal fevers.",
    },
    research: [
      {
        title: "Adaptogenic and anxiolytic effects of Ocimum sanctum",
        journal: "Journal of Ayurveda and Integrative Medicine",
        year: 2017,
        finding: "Standardised leaf extract reduced perceived stress scores over 8 weeks.",
        evidenceLevel: "Clinical trial",
      },
      {
        title: "Eugenol-rich fractions against respiratory pathogens",
        journal: "Phytotherapy Research",
        year: 2019,
        finding: "Marked inhibition of Streptococcus pneumoniae growth in culture.",
        evidenceLevel: "In vitro",
      },
    ],
    conservation: "Least Concern",
    popularity: 98,
    hue: 150,
  },
  {
    id: "neem",
    name: "Neem",
    botanicalName: "Azadirachta indica",
    family: "Meliaceae",
    commonNames: [
      { language: "Tamil", name: "Vembu" },
      { language: "Hindi", name: "Neem" },
      { language: "Sanskrit", name: "Nimba" },
      { language: "English", name: "Indian Lilac" },
    ],
    regions: ["Tamil Nadu", "Karnataka", "Maharashtra", "Pan-India"],
    parts: ["Leaf", "Bark", "Seed oil", "Flower"],
    morphology:
      "Large evergreen tree up to 20 m with imparipinnate leaves, serrated leaflets and fragrant white panicles.",
    uses: ["Skin disorders", "Wound healing", "Dental care", "Blood purification", "Antiparasitic"],
    diseases: ["Eczema", "Diabetes", "Malaria", "Dental caries"],
    constituents: ["Azadirachtin", "Nimbin", "Nimbidin", "Quercetin"],
    pharmacology: ["Antibacterial", "Antifungal", "Immunomodulatory", "Larvicidal"],
    siddha: {
      name: "Vembu",
      suvai: "Kaippu (bitter)",
      veeryam: "Thatpam (cool potency)",
      note: "Vembu thailam is a classical external application for kirumi (parasitic) skin disease.",
    },
    research: [
      {
        title: "Nimbidin and inflammatory mediators",
        journal: "Journal of Ethnopharmacology",
        year: 2015,
        finding: "Suppressed macrophage nitric-oxide release in a dose-dependent manner.",
        evidenceLevel: "In vitro",
      },
      {
        title: "Neem leaf extract in glycaemic control",
        journal: "Indian Journal of Pharmacology",
        year: 2020,
        finding: "Reduced fasting glucose in streptozotocin-induced diabetic rodents.",
        evidenceLevel: "Animal study",
      },
    ],
    conservation: "Least Concern",
    popularity: 95,
    hue: 135,
  },
  {
    id: "ashwagandha",
    name: "Ashwagandha",
    botanicalName: "Withania somnifera",
    family: "Solanaceae",
    commonNames: [
      { language: "Sanskrit", name: "Ashwagandha" },
      { language: "Tamil", name: "Amukkara" },
      { language: "English", name: "Indian Ginseng" },
    ],
    regions: ["Rajasthan", "Madhya Pradesh", "Tamil Nadu"],
    parts: ["Root", "Leaf"],
    morphology:
      "Short woody shrub, 35–75 cm, with dull green ovate leaves and small greenish flowers bearing orange-red berries.",
    uses: ["Stress and insomnia", "Muscle strength", "Arthritis", "Fatigue"],
    diseases: ["Anxiety", "Insomnia", "Arthritis", "Hypothyroidism"],
    constituents: ["Withanolides", "Withaferin A", "Sitoindosides", "Alkaloids"],
    pharmacology: ["Adaptogenic", "Anxiolytic", "Anti-inflammatory", "Neuroprotective"],
    siddha: {
      name: "Amukkara kizhangu",
      suvai: "Thuvarppu (astringent)",
      veeryam: "Veppam (hot potency)",
      note: "Amukkara choornam is prescribed as a vatha-pacifying rejuvenative (kayakalpa).",
    },
    research: [
      {
        title: "Withania somnifera root extract and cortisol",
        journal: "Medicine (Baltimore)",
        year: 2019,
        finding: "Significant reduction in serum cortisol versus placebo across 60 days.",
        evidenceLevel: "Clinical trial",
      },
    ],
    conservation: "Near Threatened",
    popularity: 92,
    hue: 60,
  },
  {
    id: "turmeric",
    name: "Turmeric",
    botanicalName: "Curcuma longa",
    family: "Zingiberaceae",
    commonNames: [
      { language: "Tamil", name: "Manjal" },
      { language: "Hindi", name: "Haldi" },
      { language: "Sanskrit", name: "Haridra" },
    ],
    regions: ["Tamil Nadu", "Telangana", "Odisha", "Kerala"],
    parts: ["Rhizome"],
    morphology:
      "Perennial rhizomatous herb to 1 m with large oblong leaves and pale-yellow bracted flower spikes; rhizome deep orange within.",
    uses: ["Inflammation", "Wound healing", "Liver support", "Skin brightening"],
    diseases: ["Arthritis", "Eczema", "Liver disorder", "Ulcer"],
    constituents: ["Curcumin", "Demethoxycurcumin", "Turmerone", "Zingiberene"],
    pharmacology: ["Anti-inflammatory", "Antioxidant", "Hepatoprotective", "Antiseptic"],
    siddha: {
      name: "Manjal",
      suvai: "Kaippu (bitter), Kaarppu (pungent)",
      veeryam: "Veppam (hot potency)",
      note: "Central to Siddha external pastes (pattru) for wounds and inflammatory swellings.",
    },
    research: [
      {
        title: "Curcumin bioavailability with piperine",
        journal: "Planta Medica",
        year: 2016,
        finding: "Serum curcumin availability increased ~20-fold with co-administered piperine.",
        evidenceLevel: "Clinical trial",
      },
      {
        title: "Curcumin in knee osteoarthritis",
        journal: "Journal of Medicinal Food",
        year: 2021,
        finding: "Pain scores comparable to NSAID control with fewer GI events.",
        evidenceLevel: "Meta-analysis",
      },
    ],
    conservation: "Least Concern",
    popularity: 99,
    hue: 75,
  },
  {
    id: "brahmi",
    name: "Brahmi",
    botanicalName: "Bacopa monnieri",
    family: "Plantaginaceae",
    commonNames: [
      { language: "Tamil", name: "Neer Brahmi" },
      { language: "Sanskrit", name: "Brahmi" },
      { language: "English", name: "Water Hyssop" },
    ],
    regions: ["Kerala", "West Bengal", "Tamil Nadu", "Wetlands"],
    parts: ["Whole plant"],
    morphology:
      "Creeping succulent herb of marshy ground with small oblong sessile leaves and solitary white-blue flowers.",
    uses: ["Memory enhancement", "Epilepsy support", "Anxiety", "Hair health"],
    diseases: ["Cognitive decline", "Anxiety", "Epilepsy"],
    constituents: ["Bacoside A", "Bacoside B", "Brahmine", "Herpestine"],
    pharmacology: ["Nootropic", "Anxiolytic", "Antioxidant", "Anticonvulsant"],
    siddha: {
      name: "Neer Brahmi",
      suvai: "Kaippu (bitter)",
      veeryam: "Thatpam (cool potency)",
      note: "Given as a medhya (intellect-promoting) ghee preparation for children.",
    },
    research: [
      {
        title: "Bacopa monnieri and memory acquisition",
        journal: "Neuropsychopharmacology",
        year: 2018,
        finding: "Improved delayed word-recall in healthy adults over 12 weeks.",
        evidenceLevel: "Clinical trial",
      },
    ],
    conservation: "Least Concern",
    popularity: 84,
    hue: 190,
  },
  {
    id: "amla",
    name: "Amla",
    botanicalName: "Phyllanthus emblica",
    family: "Phyllanthaceae",
    commonNames: [
      { language: "Tamil", name: "Nellikkai" },
      { language: "Hindi", name: "Amla" },
      { language: "English", name: "Indian Gooseberry" },
    ],
    regions: ["Tamil Nadu", "Uttarakhand", "Gujarat"],
    parts: ["Fruit", "Seed", "Leaf"],
    morphology:
      "Small to medium deciduous tree with feathery pinnate foliage and pale-green, translucent, six-ribbed fleshy fruits.",
    uses: ["Immunity", "Hyperacidity", "Hair fall", "Anaemia"],
    diseases: ["Gastritis", "Anaemia", "Hyperlipidaemia", "Diabetes"],
    constituents: ["Ascorbic acid", "Emblicanin A", "Gallic acid", "Ellagic acid"],
    pharmacology: ["Antioxidant", "Antacid", "Hypolipidaemic", "Immunomodulatory"],
    siddha: {
      name: "Nellikkai",
      suvai: "Pulippu (sour), Thuvarppu (astringent)",
      veeryam: "Thatpam (cool potency)",
      note: "One of the triphala trio (thiripala churnam) balancing all three humours.",
    },
    research: [
      {
        title: "Emblica officinalis and lipid profile",
        journal: "Journal of Clinical Lipidology",
        year: 2019,
        finding: "Reduced LDL-C and triglycerides in dyslipidaemic adults.",
        evidenceLevel: "Clinical trial",
      },
    ],
    conservation: "Least Concern",
    popularity: 90,
    hue: 100,
  },
  {
    id: "vasaka",
    name: "Vasaka",
    botanicalName: "Justicia adhatoda",
    family: "Acanthaceae",
    commonNames: [
      { language: "Tamil", name: "Aadathodai" },
      { language: "Sanskrit", name: "Vasa" },
      { language: "English", name: "Malabar Nut" },
    ],
    regions: ["Tamil Nadu", "Assam", "Sri Lanka border regions"],
    parts: ["Leaf", "Root", "Flower"],
    morphology:
      "Dense evergreen shrub to 2.5 m with large lanceolate opposite leaves and white bilabiate flowers with purple veining.",
    uses: ["Cough", "Asthma", "Bronchitis", "Bleeding disorders"],
    diseases: ["Asthma", "Bronchitis", "Respiratory infection"],
    constituents: ["Vasicine", "Vasicinone", "Adhatodine", "Betaine"],
    pharmacology: ["Bronchodilator", "Expectorant", "Uterotonic", "Anti-tussive"],
    siddha: {
      name: "Aadathodai",
      suvai: "Kaippu (bitter)",
      veeryam: "Thatpam (cool potency)",
      note: "Aadathodai manappagu is a classic Siddha syrup for kaasam (cough).",
    },
    research: [
      {
        title: "Vasicine as a bronchodilatory alkaloid",
        journal: "Pulmonary Pharmacology & Therapeutics",
        year: 2014,
        finding: "Relaxation of histamine-induced tracheal contraction in isolated tissue.",
        evidenceLevel: "In vitro",
      },
    ],
    conservation: "Least Concern",
    popularity: 71,
    hue: 165,
  },
  {
    id: "guduchi",
    name: "Guduchi",
    botanicalName: "Tinospora cordifolia",
    family: "Menispermaceae",
    commonNames: [
      { language: "Tamil", name: "Seendhil kodi" },
      { language: "Sanskrit", name: "Amrita" },
      { language: "English", name: "Heart-leaved Moonseed" },
    ],
    regions: ["Tamil Nadu", "Bihar", "Deccan plateau"],
    parts: ["Stem", "Root", "Leaf"],
    morphology:
      "Large glabrous deciduous climbing shrub with heart-shaped leaves and long filiform aerial roots.",
    uses: ["Immunity", "Chronic fever", "Jaundice", "Gout"],
    diseases: ["Fever", "Diabetes", "Liver disorder", "Arthritis"],
    constituents: ["Tinosporin", "Berberine", "Giloin", "Cordifolioside"],
    pharmacology: ["Immunomodulatory", "Antipyretic", "Hepatoprotective", "Hypoglycaemic"],
    siddha: {
      name: "Seendhil",
      suvai: "Kaippu (bitter)",
      veeryam: "Veppam (hot potency)",
      note: "Seendhil chooranam is used for long-standing suram (fever) and pitha imbalance.",
    },
    research: [
      {
        title: "Tinospora cordifolia and macrophage activation",
        journal: "International Immunopharmacology",
        year: 2017,
        finding: "Enhanced phagocytic index and IL-2 production in murine models.",
        evidenceLevel: "Animal study",
      },
    ],
    conservation: "Least Concern",
    popularity: 80,
    hue: 145,
  },
  {
    id: "shatavari",
    name: "Shatavari",
    botanicalName: "Asparagus racemosus",
    family: "Asparagaceae",
    commonNames: [
      { language: "Tamil", name: "Thanneervittan kizhangu" },
      { language: "Sanskrit", name: "Shatavari" },
    ],
    regions: ["Tamil Nadu", "Himachal Pradesh", "Andhra Pradesh"],
    parts: ["Tuberous root"],
    morphology:
      "Scandent, much-branched spinous undershrub with needle-like cladodes and clustered succulent tuberous roots.",
    uses: ["Lactation support", "Female reproductive health", "Hyperacidity", "Debility"],
    diseases: ["Gastritis", "Menopausal syndrome", "Lactation insufficiency"],
    constituents: ["Shatavarins", "Sarsasapogenin", "Racemofuran", "Asparagamine"],
    pharmacology: ["Galactagogue", "Antacid", "Phytoestrogenic", "Adaptogenic"],
    siddha: {
      name: "Thanneervittan",
      suvai: "Inippu (sweet), Kaippu (bitter)",
      veeryam: "Thatpam (cool potency)",
      note: "Prescribed as a cooling rejuvenative for pitha-dominant constitutions.",
    },
    research: [
      {
        title: "Asparagus racemosus in lactation",
        journal: "Journal of Ayurveda and Integrative Medicine",
        year: 2018,
        finding: "Increase in prolactin levels among postnatal mothers versus control.",
        evidenceLevel: "Clinical trial",
      },
    ],
    conservation: "Vulnerable",
    popularity: 76,
    hue: 120,
  },
  {
    id: "aloe",
    name: "Aloe Vera",
    botanicalName: "Aloe barbadensis miller",
    family: "Asphodelaceae",
    commonNames: [
      { language: "Tamil", name: "Sotru katrazhai" },
      { language: "Hindi", name: "Ghritkumari" },
    ],
    regions: ["Tamil Nadu", "Rajasthan", "Gujarat"],
    parts: ["Leaf gel", "Latex"],
    morphology:
      "Stemless succulent with thick fleshy lance-shaped grey-green leaves bearing serrated margins and clear inner gel.",
    uses: ["Burns", "Skin hydration", "Constipation", "Gastritis"],
    diseases: ["Burns", "Constipation", "Gastritis", "Eczema"],
    constituents: ["Aloin", "Emodin", "Acemannan", "Aloe-emodin"],
    pharmacology: ["Wound healing", "Laxative", "Anti-inflammatory", "Emollient"],
    siddha: {
      name: "Katrazhai",
      suvai: "Kaippu (bitter)",
      veeryam: "Thatpam (cool potency)",
      note: "Katrazhai leghiyam is used for pitha-related gastric heat.",
    },
    research: [
      {
        title: "Acemannan in wound epithelialisation",
        journal: "Wound Repair and Regeneration",
        year: 2015,
        finding: "Accelerated re-epithelialisation of partial-thickness burns.",
        evidenceLevel: "Clinical trial",
      },
    ],
    conservation: "Least Concern",
    popularity: 88,
    hue: 155,
  },
  {
    id: "arjuna",
    name: "Arjuna",
    botanicalName: "Terminalia arjuna",
    family: "Combretaceae",
    commonNames: [
      { language: "Tamil", name: "Marudham" },
      { language: "Sanskrit", name: "Arjuna" },
    ],
    regions: ["Tamil Nadu", "Madhya Pradesh", "River banks"],
    parts: ["Stem bark"],
    morphology:
      "Large buttressed deciduous tree with smooth pinkish-grey flaking bark and drooping oblong leaves.",
    uses: ["Cardiac tonic", "Hypertension", "Wound healing", "Cholesterol"],
    diseases: ["Heart disease", "Hypertension", "Hyperlipidaemia"],
    constituents: ["Arjunolic acid", "Arjunetin", "Tannins", "Flavonoids"],
    pharmacology: ["Cardioprotective", "Hypotensive", "Antioxidant", "Astringent"],
    siddha: {
      name: "Marudham pattai",
      suvai: "Thuvarppu (astringent)",
      veeryam: "Thatpam (cool potency)",
      note: "Bark decoction is a classical Siddha remedy for idhaya (cardiac) weakness.",
    },
    research: [
      {
        title: "Terminalia arjuna bark in stable angina",
        journal: "Indian Heart Journal",
        year: 2013,
        finding: "Reduced anginal episodes and improved treadmill tolerance.",
        evidenceLevel: "Clinical trial",
      },
    ],
    conservation: "Least Concern",
    popularity: 74,
    hue: 20,
  },
  {
    id: "nilavembu",
    name: "Nilavembu",
    botanicalName: "Andrographis paniculata",
    family: "Acanthaceae",
    commonNames: [
      { language: "Tamil", name: "Nilavembu" },
      { language: "English", name: "King of Bitters" },
      { language: "Sanskrit", name: "Kalmegh" },
    ],
    regions: ["Tamil Nadu", "Kerala", "Andhra Pradesh"],
    parts: ["Whole plant", "Leaf"],
    morphology:
      "Erect annual herb 30–110 cm with quadrangular branched stems and lanceolate leaves; intensely bitter throughout.",
    uses: ["Viral fever", "Dengue support", "Liver protection", "Loss of appetite"],
    diseases: ["Fever", "Dengue", "Liver disorder", "Respiratory infection"],
    constituents: ["Andrographolide", "Neoandrographolide", "Andrographin"],
    pharmacology: ["Antipyretic", "Antiviral", "Hepatoprotective", "Immunostimulant"],
    siddha: {
      name: "Nilavembu",
      suvai: "Kaippu (bitter)",
      veeryam: "Thatpam (cool potency)",
      note: "The key ingredient of Nilavembu kudineer, distributed widely during fever seasons.",
    },
    research: [
      {
        title: "Nilavembu kudineer in dengue-endemic settings",
        journal: "Journal of Ayurveda and Integrative Medicine",
        year: 2020,
        finding: "Faster platelet recovery reported in an observational cohort.",
        evidenceLevel: "Clinical trial",
      },
    ],
    conservation: "Least Concern",
    popularity: 79,
    hue: 175,
  },
  {
    id: "moringa",
    name: "Moringa",
    botanicalName: "Moringa oleifera",
    family: "Moringaceae",
    commonNames: [
      { language: "Tamil", name: "Murungai" },
      { language: "English", name: "Drumstick Tree" },
    ],
    regions: ["Tamil Nadu", "Karnataka", "Pan-India"],
    parts: ["Leaf", "Pod", "Seed", "Root bark"],
    morphology:
      "Fast-growing slender tree with tripinnate feathery leaves, cream fragrant flowers and long ribbed pods.",
    uses: ["Nutritional support", "Anaemia", "Joint pain", "Lactation"],
    diseases: ["Anaemia", "Malnutrition", "Arthritis", "Diabetes"],
    constituents: ["Quercetin", "Kaempferol", "Isothiocyanates", "Beta-sitosterol"],
    pharmacology: ["Nutritive", "Anti-inflammatory", "Hypoglycaemic", "Antioxidant"],
    siddha: {
      name: "Murungai",
      suvai: "Kaarppu (pungent)",
      veeryam: "Veppam (hot potency)",
      note: "Leaf soup is prescribed for vatha joint stiffness and post-partum strength.",
    },
    research: [
      {
        title: "Moringa leaf powder and glycaemic response",
        journal: "Nutrients",
        year: 2021,
        finding: "Lowered post-prandial glucose excursion in prediabetic adults.",
        evidenceLevel: "Clinical trial",
      },
    ],
    conservation: "Least Concern",
    popularity: 86,
    hue: 110,
  },
  {
    id: "kandankathiri",
    name: "Kandankathiri",
    botanicalName: "Solanum xanthocarpum",
    family: "Solanaceae",
    commonNames: [
      { language: "Tamil", name: "Kandankathiri" },
      { language: "Sanskrit", name: "Kantakari" },
    ],
    regions: ["Tamil Nadu", "Dry plains of South India"],
    parts: ["Whole plant", "Fruit", "Root"],
    morphology:
      "Very prickly diffuse herb with zig-zag branches, sinuately lobed leaves and yellow-green globular berries.",
    uses: ["Cough", "Asthma", "Sore throat", "Urinary complaints"],
    diseases: ["Asthma", "Respiratory infection", "Urinary disorder"],
    constituents: ["Solasodine", "Solasonine", "Carpesterol", "Diosgenin"],
    pharmacology: ["Expectorant", "Anti-asthmatic", "Diuretic", "Antipyretic"],
    siddha: {
      name: "Kandankathiri",
      suvai: "Kaippu (bitter), Kaarppu (pungent)",
      veeryam: "Veppam (hot potency)",
      note: "Kandankathiri legiyam is a standard Siddha preparation for chronic cough.",
    },
    research: [
      {
        title: "Solasodine glycosides and airway inflammation",
        journal: "Journal of Ethnopharmacology",
        year: 2016,
        finding: "Reduced eosinophil infiltration in ovalbumin-sensitised models.",
        evidenceLevel: "Animal study",
      },
    ],
    conservation: "Least Concern",
    popularity: 62,
    hue: 85,
  },
];

export const getPlant = (id: string) => plants.find((p) => p.id === id);

export const allOf = (key: "diseases" | "constituents" | "regions" | "parts") =>
  Array.from(new Set(plants.flatMap((p) => p[key]))).sort();

export const similarPlants = (plant: Plant, limit = 3) =>
  plants
    .filter((p) => p.id !== plant.id)
    .map((p) => ({
      plant: p,
      score:
        p.diseases.filter((d) => plant.diseases.includes(d)).length * 2 +
        p.constituents.filter((c) => plant.constituents.includes(c)).length * 2 +
        p.pharmacology.filter((c) => plant.pharmacology.includes(c)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.plant);
