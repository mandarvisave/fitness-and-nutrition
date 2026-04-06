export interface DailyLog {
  nutrition: {
    homeCooked: number;
    proteinHit: boolean;
    junkFoodCount: number;
    skippedMeals: number;
  };
  activity: {
    steps: number;
    workoutCompleted: boolean;
    familyActivityDone: boolean;
  };
  sleep: {
    hours: number;
    consistentTiming: boolean;
  };
  hydration: {
    waterMl: number;
  };
  mental: {
    moodScore: number;
    meditationDone: boolean;
    stressLevel: number;
  };
}

export function calculateNutritionScore(n: DailyLog["nutrition"]): number {
  let score = 0;
  score += n.homeCooked * 3;
  if (n.proteinHit) score += 5;
  score -= n.junkFoodCount * 2;
  score -= n.skippedMeals * 3;
  return Math.max(0, Math.min(30, score));
}

export function calculateActivityScore(a: DailyLog["activity"]): number {
  let score = 0;
  if (a.steps >= 10000) score += 10;
  else if (a.steps >= 8000) score += 8;
  else if (a.steps >= 5000) score += 5;
  else score += 2;
  if (a.workoutCompleted) score += 8;
  if (a.familyActivityDone) score += 2;
  return Math.min(20, score);
}

export function calculateSleepScore(s: DailyLog["sleep"]): number {
  if (s.hours >= 7 && s.hours <= 9) return 10;
  if (s.hours >= 6) return 7;
  if (s.hours >= 5) return 4;
  return 2;
}

export function calculateHydrationScore(h: DailyLog["hydration"]): number {
  const pct = h.waterMl / 2000;
  if (pct >= 1) return 5;
  if (pct >= 0.7) return 3;
  return 1;
}

export function calculateMentalScore(m: DailyLog["mental"]): number {
  let score = 0;
  score += m.moodScore >= 7 ? 3 : m.moodScore >= 4 ? 1 : 0;
  score += m.stressLevel <= 4 ? 3 : m.stressLevel <= 6 ? 1 : 0;
  if (m.meditationDone) score += 4;
  return Math.min(10, score);
}

export function calculateConsistencyScore(currentStreak: number): number {
  if (currentStreak >= 15) return 15;
  if (currentStreak >= 7) return 10;
  if (currentStreak >= 3) return 5;
  return 0;
}

export function calculatePHS(log: DailyLog, streak: number): number {
  return (
    calculateNutritionScore(log.nutrition) +
    calculateActivityScore(log.activity) +
    calculateConsistencyScore(streak) +
    calculateSleepScore(log.sleep) +
    calculateHydrationScore(log.hydration) +
    calculateMentalScore(log.mental)
  );
}
