interface HealthTopic {
  name: string;
  keywords: string[];
  quickTips: string[];
  commonMedications: string[];
  description: string;
}

const healthTopics: HealthTopic[] = [
  {
    name: "Diabetes",
    keywords: ["diabetes", "blood sugar", "glucose", "insulin", "a1c", "diabetic"],
    quickTips: [
      "Monitor your blood sugar levels regularly as recommended by your doctor.",
      "Stay active with at least 30 minutes of moderate exercise most days.",
      "Choose foods with a low glycemic index to help manage blood sugar.",
      "Keep a log of your blood sugar readings to share with your healthcare team.",
      "Stay hydrated - water is the best choice for people with diabetes.",
    ],
    commonMedications: [
      "Metformin",
      "Glipizide",
      "Insulin (various types)",
      "Januvia (sitagliptin)",
      "Jardiance (empagliflozin)",
    ],
    description:
      "Diabetes is a condition where your body has trouble managing blood sugar levels. Type 2 diabetes is the most common form and can often be managed with lifestyle changes and medication.",
  },
  {
    name: "Hypertension",
    keywords: [
      "hypertension",
      "high blood pressure",
      "blood pressure",
      "bp",
      "systolic",
      "diastolic",
    ],
    quickTips: [
      "Reduce sodium intake to less than 2,300mg per day.",
      "Regular exercise can help lower blood pressure naturally.",
      "Limit alcohol consumption and avoid smoking.",
      "Practice stress management techniques like deep breathing.",
      "Take your blood pressure medications at the same time each day.",
    ],
    commonMedications: [
      "Lisinopril",
      "Amlodipine",
      "Losartan",
      "Hydrochlorothiazide",
      "Metoprolol",
    ],
    description:
      "High blood pressure (hypertension) is when the force of blood against your artery walls is consistently too high. It is often called the silent killer because it usually has no symptoms.",
  },
  {
    name: "Heart Disease",
    keywords: [
      "heart disease",
      "cardiovascular",
      "heart attack",
      "coronary",
      "chest pain",
      "angina",
      "cardiac",
    ],
    quickTips: [
      "Know the warning signs of a heart attack: chest pain, shortness of breath, arm pain.",
      "Eat a heart-healthy diet rich in fruits, vegetables, and whole grains.",
      "Get regular cardiovascular exercise as approved by your doctor.",
      "Manage stress through relaxation techniques and adequate sleep.",
      "Keep all follow-up appointments with your cardiologist.",
    ],
    commonMedications: [
      "Aspirin (low-dose)",
      "Statins (Atorvastatin, Rosuvastatin)",
      "Beta-blockers (Metoprolol)",
      "ACE inhibitors",
      "Nitroglycerin",
    ],
    description:
      "Heart disease refers to several types of heart conditions, with coronary artery disease being the most common. It can lead to heart attacks if not managed properly.",
  },
  {
    name: "Heart Failure / CHF",
    keywords: [
      "heart failure",
      "chf",
      "congestive",
      "ejection fraction",
      "fluid retention",
      "swelling",
    ],
    quickTips: [
      "Weigh yourself daily and report sudden weight gain to your doctor.",
      "Limit fluid intake as recommended by your healthcare team.",
      "Reduce sodium to help prevent fluid retention.",
      "Take all medications exactly as prescribed.",
      "Report any new or worsening symptoms promptly.",
    ],
    commonMedications: [
      "Entresto (sacubitril/valsartan)",
      "Carvedilol",
      "Furosemide (Lasix)",
      "Spironolactone",
      "Digoxin",
    ],
    description:
      "Heart failure means your heart is not pumping as well as it should. It does not mean your heart has stopped. With proper treatment and lifestyle changes, many people live active lives.",
  },
  {
    name: "Arthritis",
    keywords: [
      "arthritis",
      "joint pain",
      "rheumatoid",
      "osteoarthritis",
      "inflammation",
      "stiff joints",
    ],
    quickTips: [
      "Stay active with gentle exercises like swimming or walking.",
      "Apply heat or cold therapy to affected joints for relief.",
      "Maintain a healthy weight to reduce stress on joints.",
      "Consider physical therapy for targeted joint strengthening.",
      "Use assistive devices when needed to protect your joints.",
    ],
    commonMedications: [
      "Ibuprofen",
      "Naproxen",
      "Acetaminophen",
      "Methotrexate (for RA)",
      "Prednisone",
    ],
    description:
      "Arthritis causes joint inflammation, pain, and stiffness. Osteoarthritis is wear-and-tear damage, while rheumatoid arthritis is an autoimmune condition.",
  },
];

export function findRelevantTopics(query: string): HealthTopic[] {
  const lower = query.toLowerCase();
  return healthTopics.filter((topic) =>
    topic.keywords.some((keyword) => lower.includes(keyword))
  );
}

export function getQuickResponse(query: string): string | null {
  const topics = findRelevantTopics(query);
  if (topics.length === 0) return null;

  const topic = topics[0];
  const randomTip =
    topic.quickTips[Math.floor(Math.random() * topic.quickTips.length)];

  return `Here is a quick tip about ${topic.name}: ${randomTip}\n\nWould you like to know more about ${topic.name}?`;
}

export function getAllTopics(): string[] {
  return healthTopics.map((t) => t.name);
}
