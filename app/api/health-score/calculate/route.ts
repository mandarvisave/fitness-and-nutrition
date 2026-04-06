import { NextResponse } from "next/server";
import { calculatePHS, calculateNutritionScore, calculateActivityScore, calculateConsistencyScore, calculateSleepScore, calculateHydrationScore, calculateMentalScore, type DailyLog } from "@/lib/scoring/calculatePHS";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const badgeCatalog = [
  { name: "7-Day Streak", check: (streak: number, log: DailyLog) => streak >= 7 && log.activity.workoutCompleted },
  { name: "Protein Champion", check: (_streak: number, log: DailyLog) => log.nutrition.proteinHit },
  { name: "Hydration Hero", check: (_streak: number, log: DailyLog) => log.hydration.waterMl >= 2000 }
];

export async function POST(request: Request) {
  const body = await request.json();
  const dailyLog = body.dailyLog as DailyLog;
  const currentStreak = Number(body.currentStreak);
  const phs = calculatePHS(dailyLog, currentStreak);
  const newBadges = badgeCatalog.filter((badge) => badge.check(currentStreak, dailyLog)).map((badge) => badge.name);

  const breakdown = {
    nutrition_score: calculateNutritionScore(dailyLog.nutrition),
    activity_score: calculateActivityScore(dailyLog.activity),
    consistency_score: calculateConsistencyScore(currentStreak),
    sleep_score: calculateSleepScore(dailyLog.sleep),
    hydration_score: calculateHydrationScore(dailyLog.hydration),
    mental_score: calculateMentalScore(dailyLog.mental)
  };

  try {
    const supabase = createServerSupabaseClient();
    await supabase.from("health_scores").upsert({
      member_id: body.memberId,
      family_id: body.familyId ?? null,
      total_phs: phs,
      ...breakdown
    });
    await supabase.from("streaks").upsert({
      member_id: body.memberId,
      streak_type: "logging",
      current_streak: currentStreak,
      longest_streak: currentStreak,
      last_logged_at: new Date().toISOString().slice(0, 10)
    });
  } catch {}

  return NextResponse.json({
    phs,
    newBadges,
    streakUpdate: {
      currentStreak,
      familySyncEligible: dailyLog.activity.familyActivityDone
    }
  });
}
