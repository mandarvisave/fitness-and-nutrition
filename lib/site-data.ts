import type { MealPlanDay } from "@/types/nutrition";

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#how-it-works", label: "How It Works" },
  { href: "/workouts", label: "Programs" },
  { href: "/pricing", label: "Pricing" }
];

export const pricingPlans = [
  {
    name: "Free",
    price: 0,
    description: "Best for testing the platform and running a free fitness assessment.",
    features: ["1 adult profile", "Free fitness test", "Basic dashboard", "Community myths access"],
    cta: "Start Free"
  },
  {
    name: "Core",
    price: 999,
    description: "For families who want guided habits, meal planning, and score tracking.",
    features: ["Up to 4 members", "AI meal planner", "Grocery lists", "Weekly reports", "Hindi support"],
    cta: "Choose Core"
  },
  {
    name: "Premium",
    price: 2999,
    description: "Coach-led health optimisation for busy Indian families.",
    features: ["Unlimited family members", "Coach booking", "Condition-specific plans", "Priority nudges", "Premium analytics"],
    cta: "Go Premium"
  }
];

export const problemCards = [
  { title: "No Time for Gym", text: "Between work, school runs, and household duties, consistency falls apart." },
  { title: "Confusing Online Advice", text: "Western meal plans and generic workouts rarely fit Indian kitchens or family routines." },
  { title: "No One to Hold You Accountable", text: "Health feels lonely when everyone in the house is operating on a different plan." }
];

export const pillars = [
  { label: "Nutrition", score: 24 },
  { label: "Activity", score: 17 },
  { label: "Consistency", score: 11 },
  { label: "Sleep", score: 8 },
  { label: "Hydration", score: 4 },
  { label: "Mental Wellness", score: 7 },
  { label: "Family Sync", score: 6 }
];

export const features = [
  "Indian Food Database",
  "Family Health Score",
  "Home Workouts",
  "Ayurveda Tips",
  "AI Meal Planner",
  "Family Challenges"
];

export const testimonials = [
  {
    quote: "We stopped arguing about diets because everyone now follows one plan that actually works with our kitchen and schedules.",
    name: "The Sharma Family",
    city: "Pune"
  },
  {
    quote: "My parents track walks, my kids do family workouts, and I finally have a grocery list that makes sense for all of us.",
    name: "The Reddy Family",
    city: "Hyderabad"
  },
  {
    quote: "Festival Mode saved us during Holi. We enjoyed the week, stayed mindful, and didn’t lose momentum.",
    name: "The Banerjee Family",
    city: "Kolkata"
  }
];

export const dashboardData = {
  familyScore: 82,
  level: "Fit Family",
  dailyNudge: "Yesterday hydration dipped across the house. Add a water bottle to breakfast and aim for 500ml before lunch.",
  weakest: { category: "Nutrition", score: 18, max: 30 },
  summary: { in: 1820, out: 1540 },
  members: [
    { id: "1", name: "Aarav", phs: 78, top: "Activity", bottom: "Hydration", role: "parent", conditions: [] },
    { id: "2", name: "Meera", phs: 84, top: "Nutrition", bottom: "Sleep", role: "parent", conditions: ["bp"] },
    { id: "3", name: "Dadi", phs: 73, top: "Consistency", bottom: "Activity", role: "senior", conditions: ["joint_pain"] }
  ]
};

export const badges = [
  "Protein Champion",
  "United Family",
  "7-Day Streak",
  "Sleep Master",
  "Hydration Hero",
  "Junk-Free Week",
  "Morning Warrior",
  "Festival Fighter"
];

export const mythCards = [
  ["Roti makes you fat", "Weight gain comes from total intake and inactivity, not one roti by itself.", "Because rotis are eaten daily, people blame the familiar staple instead of the full plate."],
  ["You need a gym to build muscle", "Muscle grows from progressive overload, enough protein, and recovery, even with bodyweight or home resistance.", "Gyms look serious, so people assume equipment is the only path to results."],
  ["Dal is complete protein by itself", "Dal is nutritious but is lower in some amino acids, so pairing it with grains or dairy improves the overall protein quality.", "Dal is a core Indian protein source, so many families assume it covers everything alone."],
  ["Eating rice at night is unhealthy", "Rice at night can fit well if portions and total calories are appropriate.", "Rice is often linked with heaviness, especially after large festive dinners."],
  ["Fruit should never be eaten after meals", "Fruit timing matters far less than total intake and digestion comfort.", "Traditional advice often turns general digestion tips into rigid rules."],
  ["Ghee should be avoided completely", "A measured amount of ghee can be part of a balanced diet.", "People swing from overusing it to fearing all fats."],
  ["Sweating means fat loss", "Sweat reflects body temperature and fluid loss, not necessarily fat loss.", "Hot weather and intense classes create the illusion that more sweat equals more progress."],
  ["Protein powders are harmful", "Quality protein powder is simply a supplement and can help when whole-food intake is low.", "Supplements are often grouped together with unsafe shortcuts."],
  ["Healthy food is always expensive", "Indian staples like dal, curd, eggs, sprouts, peanuts, and seasonal produce are highly cost-effective.", "Packaged 'health foods' are marketed as premium, so basic foods get overlooked."],
  ["Seniors should avoid strength training", "Age-appropriate strength work can improve balance, mobility, and independence.", "Outdated advice confuses careful movement with complete rest."]
];

export const mealPlanSample: MealPlanDay[] = [
  {
    day: "Monday",
    meals: [
      { type: "breakfast", name_en: "Moong dal chilla with curd", name_hi: "मूंग दाल चीला", calories: 320, protein_g: 18 },
      { type: "lunch", name_en: "Rajma rice bowl", name_hi: "राजमा चावल", calories: 520, protein_g: 20 },
      { type: "dinner", name_en: "Paneer bhurji with phulka", name_hi: "पनीर भुर्जी", calories: 470, protein_g: 27 }
    ]
  }
];

export const workoutTracks = [
  { slug: "weight-loss", title: "Weight Loss", description: "Fat-loss-focused walking, circuits, and portion coaching.", weeks: "6 weeks" },
  { slug: "muscle-gain", title: "Muscle Gain", description: "At-home strength building using tempo, bands, and overload.", weeks: "8 weeks" },
  { slug: "family-fit", title: "Family Fit", description: "Short, playful sessions everyone can join together.", weeks: "4 weeks" }
];
