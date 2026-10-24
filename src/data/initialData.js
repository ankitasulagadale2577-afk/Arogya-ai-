// ==============================================================================
// ArogyaMitra AI — Verified Healthcare Data (MoHFW, UIP India, WHO)
// ==============================================================================

export const VACCINES_DATA = [
  {
    id: "bcg",
    name: "BCG (Bacillus Calmette-Guérin)",
    group: "Infants",
    schedule: "At birth (or as early as possible till one year of age)",
    purpose: "Protects infants against severe and disseminated forms of childhood tuberculosis, including TB meningitis.",
    precautions: "Do not apply antiseptic or rub the injection site if a small papule or pustule forms; it heals naturally.",
    source: "Universal Immunisation Programme (UIP), MoHFW India"
  },
  {
    id: "hepb",
    name: "Hepatitis B (Birth Dose)",
    group: "Infants",
    schedule: "Within 24 hours of birth",
    purpose: "Prevents perinatal transmission of Hepatitis B virus from mother to child and prevents chronic liver disease.",
    precautions: "Must be given within 24 hours of birth for optimal perinatal protection.",
    source: "WHO / UIP MoHFW India"
  },
  {
    id: "opv",
    name: "OPV & fIPV (Polio Vaccines)",
    group: "Infants",
    schedule: "Birth dose (OPV-0), followed by 6, 10, and 14 weeks",
    purpose: "Provides dual mucosal and systemic immunity against polioviruses, preventing poliomyelitis and paralysis.",
    precautions: "Delay administration if infant is experiencing severe acute diarrhea until recovery.",
    source: "National Polio Surveillance Project (NPSP) / MoHFW"
  },
  {
    id: "pentavalent",
    name: "Pentavalent Vaccine (DTP + HepB + Hib)",
    group: "Infants",
    schedule: "At 6 weeks, 10 weeks, and 14 weeks",
    purpose: "Five-in-one protection against Diphtheria, Pertussis (whooping cough), Tetanus, Hepatitis B, and Haemophilus influenzae type b.",
    precautions: "Mild fever and localized tenderness at the thigh injection site are normal for 24-48 hours.",
    source: "Universal Immunisation Programme (UIP), India"
  },
  {
    id: "rotavirus",
    name: "Rotavirus Vaccine (RVV)",
    group: "Infants",
    schedule: "At 6 weeks, 10 weeks, and 14 weeks (oral drops)",
    purpose: "Significantly reduces severe dehydrating rotavirus diarrhea in infants and young children.",
    precautions: "Given orally; contra-indicated in infants with history of intussusception.",
    source: "MoHFW Guidelines"
  },
  {
    id: "pcv",
    name: "Pneumococcal Conjugate Vaccine (PCV)",
    group: "Infants",
    schedule: "Primary doses at 6 & 14 weeks; booster at 9 months",
    purpose: "Protects against Streptococcus pneumoniae causing pneumonia, sepsis, and meningitis.",
    precautions: "Report severe persistent fever to pediatrician.",
    source: "Universal Immunisation Programme, India"
  },
  {
    id: "mr",
    name: "MR Vaccine (Measles - Rubella)",
    group: "Children",
    schedule: "1st dose at 9-12 months; 2nd dose at 16-24 months",
    purpose: "Eliminates measles (preventing pneumonia and encephalitis) and controls congenital rubella syndrome (CRS).",
    precautions: "Ensure child receives both doses for full life-long immunity.",
    source: "National Immunization Schedule, MoHFW"
  },
  {
    id: "dpt_booster",
    name: "DPT Booster",
    group: "Children",
    schedule: "Booster 1 at 16-24 months; Booster 2 at 5-6 years",
    purpose: "Maintains adequate antibody titers against diphtheria, pertussis, and tetanus throughout early childhood.",
    precautions: "Administered intramuscularly into mid-thigh or upper deltoid.",
    source: "Universal Immunisation Programme, India"
  },
  {
    id: "td",
    name: "Td (Tetanus & Adult Diphtheria)",
    group: "Adolescents & Adults",
    schedule: "At 10 years, 16 years, during pregnancy, and every 10 years for adults",
    purpose: "Guards against tetanus infection from wounds and maintains immunity against respiratory diphtheria.",
    precautions: "During pregnancy, two doses (or one booster if vaccinated within past 3 years) protect mother and newborn.",
    source: "MoHFW Clinical Protocol"
  },
  {
    id: "hpv",
    name: "HPV Vaccine (Human Papillomavirus)",
    group: "Adolescents & Adults",
    schedule: "Girls aged 9-14 years (2-dose schedule); catch-up up to 26 years",
    purpose: "Prevents high-risk oncogenic HPV types responsible for cervical and other anogenital cancers.",
    precautions: "Most effective when administered prior to exposure to HPV.",
    source: "WHO / Indian Academy of Pediatrics (IAP)"
  },
  {
    id: "influenza",
    name: "Seasonal Influenza Vaccine",
    group: "All Ages",
    schedule: "Annually prior to monsoon or winter flu season",
    purpose: "Reduces severity of seasonal flu, particularly in elderly individuals, diabetics, and asthmatic patients.",
    precautions: "Updated annually based on circulating flu strains identified by WHO surveillance.",
    source: "WHO Influenza Surveillance"
  }
];

export const EMERGENCY_NUMBERS_DATA = [
  {
    id: "112",
    number: "112",
    name: "National Unified Emergency (India)",
    description: "All-in-one helpline for Police, Fire, and Medical Emergencies across all Indian states and Union Territories.",
    area: "Pan-India",
    tollFree: true,
    isPrimary: true
  },
  {
    id: "108",
    number: "108",
    name: "Emergency Medical & Ambulance Service",
    description: "Government-supported 24/7 emergency ambulance dispatch equipped with basic and advanced life support.",
    area: "Most Indian States",
    tollFree: true,
    isPrimary: true
  },
  {
    id: "102",
    number: "102",
    name: "Free Maternal & Infant Ambulance (JSSK)",
    description: "Free transport service dedicated to pregnant mothers and sick infants under Janani Shishu Suraksha Karyakram.",
    area: "Pan-India",
    tollFree: true,
    isPrimary: false
  },
  {
    id: "181",
    number: "181",
    name: "Women in Distress Helpline",
    description: "Confidential 24-hour emergency counseling, rescue support, and legal assistance for women facing abuse.",
    area: "Pan-India",
    tollFree: true,
    isPrimary: false
  },
  {
    id: "1098",
    number: "1098",
    name: "Childline (Child Protection)",
    description: "Nationwide emergency phone outreach service for children in need of care and protection.",
    area: "Pan-India",
    tollFree: true,
    isPrimary: false
  },
  {
    id: "14416",
    number: "14416",
    name: "Tele-MANAS Mental Health Helpline",
    description: "Free 24/7 national mental health consultation and psychosocial counseling in 20+ Indian languages (or 1800-891-4416).",
    area: "Pan-India (MoHFW)",
    tollFree: true,
    isPrimary: false
  },
  {
    id: "1075",
    number: "1075",
    name: "National Health Portal Helpline",
    description: "Ministry of Health and Family Welfare helpline for public health inquiries, disease outbreaks, and advisories.",
    area: "Pan-India",
    tollFree: true,
    isPrimary: false
  }
];

export const FIRST_AID_GUIDELINES = [
  {
    id: "bleeding",
    title: "Severe External Bleeding",
    emergencyAction: "Call 112 immediately. Uncontrolled bleeding can lead to hypovolemic shock within minutes.",
    steps: [
      "Wear gloves or use a clean barrier if available.",
      "Apply direct, firm, and continuous pressure onto the wound using sterile gauze or a clean cloth.",
      "Do NOT remove blood-soaked dressings; add more layers on top and maintain steady pressure.",
      "If the limb is injured and no fracture is suspected, elevate the injured site above the heart.",
      "Keep the person lying down and covered with a blanket to prevent shock until emergency responders arrive."
    ],
    donts: "Do not remove impaled objects; stabilize them in place with rolled dressings."
  },
  {
    id: "heart-attack",
    title: "Suspected Heart Attack",
    emergencyAction: "Call 112 or 108 immediately. Every minute counts.",
    steps: [
      "Recognize symptoms: Chest tightness, crushing pressure radiating to jaw, neck, back, or left arm, cold sweats, nausea, or shortness of breath.",
      "Help the person sit down in a comfortable position, typically half-sitting with knees bent and back supported.",
      "Loosen tight clothing around the neck, chest, and waist.",
      "Ask if they have prescribed heart medication (like sublingual nitroglycerin) and help them take it.",
      "If the person becomes unresponsive and stops normal breathing, immediately begin CPR (chest compressions in center of chest at 100-120 per minute)."
    ],
    donts: "Do not let them walk or drive themselves to the hospital."
  },
  {
    id: "stroke",
    title: "Suspected Stroke (FAST Protocol)",
    emergencyAction: "Call 112 immediately. Note the exact time symptoms started.",
    steps: [
      "F - Face Drooping: Ask the person to smile. Does one side of the face droop?",
      "A - Arm Weakness: Ask the person to raise both arms. Does one arm drift downward?",
      "S - Speech Difficulty: Ask the person to repeat a simple phrase. Is speech slurred or strange?",
      "T - Time to call 112: If you observe any of these signs, contact emergency services without waiting.",
      "Keep the person calm, lying flat on their side (recovery position) if vomiting or drowsy."
    ],
    donts: "Do NOT give anything to eat or drink (including water or aspirin) due to risk of choking from impaired swallowing reflex."
  },
  {
    id: "burns",
    title: "Thermal Burns & Scalds",
    emergencyAction: "Call 112 for burns larger than the person's palm, burns on face, hands, joints, or genitals, or chemical/electrical burns.",
    steps: [
      "Immediately cool the burn under gentle, cool running tap water for at least 20 minutes.",
      "Remove jewelry, rings, and non-sticking clothing near the affected area before swelling begins.",
      "After cooling, cover loosely with clean cling wrap (plastic film) or a sterile non-adherent dressing.",
      "Keep the patient warm, as cooling large burns can induce hypothermia."
    ],
    donts: "Never apply ice, butter, oil, toothpaste, or home remedies. Never pop burn blisters."
  },
  {
    id: "choking",
    title: "Choking (Adult or Child over 1 year)",
    emergencyAction: "Call 112 if the person cannot breathe, speak, or cough, or turns blue.",
    steps: [
      "Encourage them to cough forcefully if they can still make sounds.",
      "If completely obstructed: Stand behind them, lean them forward, and deliver 5 sharp back blows between shoulder blades with the heel of your hand.",
      "If unsuccessful, perform 5 abdominal thrusts (Heimlich maneuver): place a fist just above the navel, grasp with other hand, and pull inward and upward.",
      "Alternate 5 back blows and 5 abdominal thrusts until object is expelled or help arrives."
    ],
    donts: "Do not perform blind finger sweeps in the mouth as it may push foreign objects deeper."
  }
];

export const ARTICLES_DATA = [
  {
    id: "art-1",
    slug: "understanding-diabetes",
    title: "Understanding Diabetes: Types, Symptoms, and Management",
    category: "Conditions",
    summary: "Diabetes affects how your body processes blood sugar. Learn about signs, lifestyle measures, and monitoring.",
    content: `Diabetes mellitus is a condition that occurs when the blood glucose (sugar) level is too high. 

### Types of Diabetes
- **Type 1 Diabetes:** The body's immune system attacks insulin-producing beta cells in the pancreas. It requires lifelong insulin therapy.
- **Type 2 Diabetes:** The body becomes resistant to insulin or doesn't produce enough. It is strongly linked to genetics, physical inactivity, and excess body weight.
- **Gestational Diabetes:** Develops during pregnancy and can impact maternal and fetal health if left unmonitored.

### Common Warning Signs
1. Frequent urination, especially at night
2. Excessive thirst and dry mouth
3. Unexplained weight loss
4. Extreme fatigue and weakness
5. Blurred vision
6. Slow-healing sores or frequent skin infections

### Evidence-Based Management
- **Nutrition:** Emphasize high-fiber vegetables, whole grains, and lean proteins while minimizing refined sugars and sweetened drinks.
- **Physical Activity:** Aim for at least 150 minutes of moderate aerobic exercise (brisk walking, cycling) per week.
- **Routine Monitoring:** Regular testing of fasting blood sugar and HbA1c provides vital feedback. Consult a doctor before starting or changing medications.`,
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800",
    sourceName: "World Health Organization (WHO)",
    sourceUrl: "https://www.who.int/news-room/fact-sheets/detail/diabetes",
    reviewedDate: "2026-01-15"
  },
  {
    id: "art-2",
    slug: "how-to-sleep-better",
    title: "How to Sleep Better: Clinical Sleep Hygiene Guide",
    category: "Wellness",
    summary: "Restorative sleep powers immune health, memory, and heart function. Practical tips for lasting rest.",
    content: `Quality sleep is as crucial to physical and emotional wellbeing as nutritious food and clean water.

### Why Sleep Matters
During deep sleep, the brain clears metabolic waste, repairs muscle tissue, and consolidates long-term memory. Chronic insufficient sleep increases risks of hypertension, obesity, depression, and impaired immunity.

### Pillars of Sleep Hygiene
1. **Consistent Sleep Schedule:** Go to bed and wake up at the exact same time every day—including weekends. This anchors your circadian rhythm.
2. **Optimize the Environment:** Keep the bedroom cool (around 18-21°C), pitch dark, and silent. Use blackout curtains or earplugs if necessary.
3. **Limit Evening Blue Light:** Turn off phones, tablets, and televisions at least 45 minutes before sleep. Blue light suppresses melatonin synthesis.
4. **Caffeine Curfew:** Avoid coffee, tea, and energy drinks at least 6 to 8 hours prior to sleeping.
5. **Calm Pre-Bed Routine:** Reading, light stretching, or deep breathing signals to your nervous system that it is time to transition into rest.

*Note: If daytime fatigue or loud snoring with gasping for air persists, speak to a physician to evaluate for sleep apnea.*`,
    image: "https://images.unsplash.com/photo-1511295742362-92c96b6d4f6d?w=800",
    sourceName: "National Health Portal / MoHFW",
    sourceUrl: "https://main.mohfw.gov.in",
    reviewedDate: "2026-02-10"
  },
  {
    id: "art-3",
    slug: "understanding-blood-pressure",
    title: "Understanding Blood Pressure and Cardiovascular Care",
    category: "Conditions",
    summary: "High blood pressure is often symptomless. Discover standard ranges, screening, and heart-healthy habits.",
    content: `Blood pressure measures the pressure that circulating blood exerts on the walls of your arteries.

### Reading Blood Pressure Numbers
- **Systolic (top number):** The pressure when your heart beats and pumps blood.
- **Diastolic (bottom number):** The pressure when your heart rests between beats.
- **Normal Range:** Generally under 120/80 mmHg in healthy adults.
- **Hypertension:** Persistently 130/80 mmHg or higher.

### The Silent Killer
Hypertension rarely causes headaches or dizziness until it reaches extreme levels. Left untreated, it damages the kidneys, hardens arteries, and drastically raises the risk of stroke and heart attack.

### Preventive Actions
- **Reduce Sodium:** Limit processed snacks, pickles, and salty foods.
- **Dietary Potassium:** Incorporate bananas, leafy spinach, and coconut water.
- **Regular Screening:** Check your blood pressure at least once a year at a clinic or with a validated home monitor.`,
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800",
    sourceName: "World Health Organization (WHO)",
    sourceUrl: "https://www.who.int/health-topics/hypertension",
    reviewedDate: "2026-03-01"
  },
  {
    id: "art-4",
    slug: "healthy-eating-basics",
    title: "Healthy Eating Basics: Balanced Nutrition for Everyone",
    category: "Nutrition",
    summary: "Clear dietary guidelines for balanced Indian plates, legumes, vegetables, and wholesome proteins.",
    content: `Healthy nutrition does not mean restrictive diets; it means eating balanced, wholesome foods that nourish your body sustainably.

### Building a Balanced Plate
- **Half the Plate (50%):** Colorful seasonal vegetables, greens (methi, palak, gourds), and raw salad.
- **Quarter Plate (25%):** Whole grains such as millets (ragi, jowar, bajra), brown rice, or whole wheat roti.
- **Quarter Plate (25%):** Protein sources like lentils, dal, paneer, tofu, sprouts, curd, eggs, or fish.

### Hydration & Smart Habits
- Drink 2 to 3 liters of water across the day, adjusted for climate and physical work.
- Cook with healthy, unrefined vegetable oils in moderation.
- Replace ultra-processed packaged snacks with seasonal fruits, roasted chana, or a handful of nuts.`,
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800",
    sourceName: "ICMR - National Institute of Nutrition",
    sourceUrl: "https://www.nin.res.in",
    reviewedDate: "2026-02-20"
  },
  {
    id: "art-5",
    slug: "why-vaccination-matters",
    title: "Universal Immunisation: Protecting Children and Families",
    category: "Prevention",
    summary: "How vaccines train the immune system safely to protect against debilitating preventable infections.",
    content: `Vaccines are among modern medicine's greatest triumphs, eradicating smallpox and eliminating polio from India.

### How Immunity Works
Vaccines expose the immune system to a harmless antigen or weakened pathogen. The immune system produces defensive antibodies and creates memory T-cells without causing active infection. If the body encounters the real pathogen in the future, it neutralizes it swiftly.

### Herd Immunity
When high percentages of the population are vaccinated, infectious agents cannot easily spread. This shields vulnerable newborns and individuals undergoing cancer treatment who cannot be vaccinated themselves.

### National Guidelines
Always follow the Universal Immunisation Programme (UIP) card provided by government maternity centers or your pediatrician. Keep vaccination records safely.`,
    image: "https://images.unsplash.com/photo-1618015358954-3c9b3f45e1e7?w=800",
    sourceName: "Ministry of Health and Family Welfare (India)",
    sourceUrl: "https://nhm.gov.in",
    reviewedDate: "2026-01-28"
  },
  {
    id: "art-6",
    slug: "everyday-stress-management",
    title: "Everyday Stress Management and Mental Resilience",
    category: "Mental Wellness",
    summary: "Evidence-based techniques to reduce tension, cultivate mindfulness, and know when to seek counseling.",
    content: `While short-term stress is a normal response to challenges, chronic daily stress takes a toll on physical health, sleep, and emotional peace.

### Practical Self-Care Tools
1. **Box Breathing (Sama Vritti):** Inhale for 4 seconds, hold for 4 seconds, exhale for 4 seconds, hold empty for 4 seconds. Repeat 4 times to stimulate the vagus nerve and downregulate the fight-or-flight response.
2. **Move Daily:** A 20-minute walk releases endorphins and reduces stress hormones like cortisol.
3. **Talk to Someone You Trust:** Sharing feelings with friends or family alleviates emotional isolation.
4. **Disconnect:** Take intentional breaks from notifications and social media news cycles.

### Free Support in India
If anxiety, depression, or distress interferes with your ability to eat, sleep, or work, reach out to **Tele-MANAS** at **14416** (or **1800-891-4416**), a free national 24/7 mental health service.`,
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800",
    sourceName: "Tele-MANAS / MoHFW",
    sourceUrl: "https://telemanas.mohfw.gov.in",
    reviewedDate: "2026-03-12"
  }
];
