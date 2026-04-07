export interface CardioDBEntry {
  name: string;
  caloriesPerMinutePerKg: number; // Rough approximation (METs * 3.5 / 200)
}

export interface StrengthDBEntry {
  name: string;
  defaultSets: number;
  defaultReps: number;
}

export const cardioDatabase: CardioDBEntry[] = [
  { name: "Running, 5 mph (12 min/mile)", caloriesPerMinutePerKg: 0.14 },
  { name: "Running, 8 mph (7.5 min/mile)", caloriesPerMinutePerKg: 0.23 },
  { name: "Walking, 3.0 mph, mod. pace", caloriesPerMinutePerKg: 0.058 },
  { name: "Cycling, 12-13.9 mph, moderate", caloriesPerMinutePerKg: 0.14 },
  { name: "Swimming laps, freestyle, fast", caloriesPerMinutePerKg: 0.17 },
  { name: "Football, competitive", caloriesPerMinutePerKg: 0.14 },
  { name: "Basketball, game", caloriesPerMinutePerKg: 0.14 },
  { name: "Tennis, singles", caloriesPerMinutePerKg: 0.14 },
  { name: "Rowing, stationary, moderate", caloriesPerMinutePerKg: 0.12 },
  { name: "Elliptical trainer", caloriesPerMinutePerKg: 0.09 },
  { name: "Gym Workout", caloriesPerMinutePerKg: 0.1 },
  { name: "Yoga, Hatha", caloriesPerMinutePerKg: 0.04 }
];

export const strengthDatabase: StrengthDBEntry[] = [
  { name: "Bench Press (Barbell)", defaultSets: 3, defaultReps: 10 },
  { name: "Squat (Barbell)", defaultSets: 3, defaultReps: 10 },
  { name: "Deadlift (Barbell)", defaultSets: 3, defaultReps: 8 },
  { name: "Pull Up", defaultSets: 3, defaultReps: 8 },
  { name: "Push Up", defaultSets: 3, defaultReps: 15 },
  { name: "Overhead Press (Dumbbell)", defaultSets: 3, defaultReps: 10 },
  { name: "Bicep Curl (Dumbbell)", defaultSets: 3, defaultReps: 12 },
  { name: "Tricep Extension (Dumbbell)", defaultSets: 3, defaultReps: 12 },
  { name: "Lunges", defaultSets: 3, defaultReps: 12 },
  { name: "Leg Press", defaultSets: 3, defaultReps: 10 },
  { name: "Lat Pulldown (Cable)", defaultSets: 3, defaultReps: 10 }
];

// Helper to calc typical calories assuming a 70kg person.
export function calculateCardioCalories(name: string, minutes: number, weightKg: number = 70): number {
  const entry = cardioDatabase.find(c => c.name === name);
  if (!entry) return 0;
  return Math.round(entry.caloriesPerMinutePerKg * weightKg * minutes);
}
