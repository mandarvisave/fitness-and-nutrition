import type { BodyProfile, MemberGender, MemberGoal, MemberGoalSettings, MemberRole, WorkoutTrack } from "@/types/settings";

export interface BodyMetricsInput {
  role: MemberRole;
  gender: MemberGender;
  age: number;
  heightCm: number;
  weightKg: number;
  bodyFatPct: number | null;
}

export interface TransformationPlanResult {
  bmi: number;
  bodyProfile: BodyProfile;
  goal: MemberGoal;
  calorieTarget: number;
  proteinTarget: number;
  hydrationTarget: number;
  workoutTrack: WorkoutTrack;
  focusHabit: string;
  targetWeightKg: number | null;
  targetTimelineWeeks: number;
  summary: string;
}

export function calculateBMI(heightCm: number, weightKg: number) {
  const heightM = heightCm / 100;
  if (heightM <= 0) return 0;
  return Number((weightKg / (heightM * heightM)).toFixed(1));
}

function getBodyFatBand(gender: MemberGender, bodyFatPct: number) {
  if (gender === "female") {
    if (bodyFatPct >= 35) return "high";
    if (bodyFatPct >= 25) return "moderate";
    if (bodyFatPct < 20) return "low";
    return "balanced";
  }

  if (bodyFatPct >= 28) return "high";
  if (bodyFatPct >= 18) return "moderate";
  if (bodyFatPct < 12) return "low";
  return "balanced";
}

export function inferBodyProfile(input: BodyMetricsInput): BodyProfile {
  if (input.role === "senior" || input.age >= 60) {
    return "mobility-first";
  }

  if (input.bodyFatPct !== null) {
    const band = getBodyFatBand(input.gender, input.bodyFatPct);
    if (band === "high") return "fat-loss-priority";
    if (band === "moderate") return "recomposition-candidate";
    if (band === "low") return "muscle-gain-priority";
    return "balanced-build";
  }

  const bmi = calculateBMI(input.heightCm, input.weightKg);
  if (bmi < 18.5) return "muscle-gain-priority";
  if (bmi < 22) return "lean-build";
  if (bmi < 25) return "balanced-build";
  if (bmi < 30) return "recomposition-candidate";
  return "fat-loss-priority";
}

function getPlanMeta(profile: BodyProfile) {
  const mapping: Record<BodyProfile, Omit<TransformationPlanResult, "bmi">> = {
    "lean-build": {
      bodyProfile: "lean-build",
      goal: "general_fitness",
      calorieTarget: 0,
      proteinTarget: 0,
      hydrationTarget: 0,
      workoutTrack: "general-fitness",
      focusHabit: "Build meal consistency and daily movement",
      targetWeightKg: null,
      targetTimelineWeeks: 10,
      summary: "You look relatively lean already, so the plan focuses on routine, posture, energy, and small strength gains."
    },
    "balanced-build": {
      bodyProfile: "balanced-build",
      goal: "general_fitness",
      calorieTarget: 0,
      proteinTarget: 0,
      hydrationTarget: 0,
      workoutTrack: "general-fitness",
      focusHabit: "Protect sleep and hit three quality workouts weekly",
      targetWeightKg: null,
      targetTimelineWeeks: 10,
      summary: "You are in a balanced range, so the best transformation path is consistency, strength, and body-composition improvement."
    },
    "fat-loss-priority": {
      bodyProfile: "fat-loss-priority",
      goal: "weight_loss",
      calorieTarget: 0,
      proteinTarget: 0,
      hydrationTarget: 0,
      workoutTrack: "weight-loss",
      focusHabit: "Daily walking plus protein-first meals",
      targetWeightKg: null,
      targetTimelineWeeks: 16,
      summary: "The strongest return now comes from a fat-loss phase with a mild calorie deficit, strength work, and high daily movement."
    },
    "muscle-gain-priority": {
      bodyProfile: "muscle-gain-priority",
      goal: "muscle_gain",
      calorieTarget: 0,
      proteinTarget: 0,
      hydrationTarget: 0,
      workoutTrack: "muscle-gain",
      focusHabit: "Eat protein in 3-4 meals and progress strength weekly",
      targetWeightKg: null,
      targetTimelineWeeks: 14,
      summary: "Your profile suggests muscle gain and strength development should be the primary focus."
    },
    "recomposition-candidate": {
      bodyProfile: "recomposition-candidate",
      goal: "body_recomposition",
      calorieTarget: 0,
      proteinTarget: 0,
      hydrationTarget: 0,
      workoutTrack: "body-recomposition",
      focusHabit: "Moderate calorie control with high-protein strength training",
      targetWeightKg: null,
      targetTimelineWeeks: 14,
      summary: "You are a good recomposition candidate, so the plan aims to reduce fat while preserving or building muscle."
    },
    "mobility-first": {
      bodyProfile: "mobility-first",
      goal: "energy_boost",
      calorieTarget: 0,
      proteinTarget: 0,
      hydrationTarget: 0,
      workoutTrack: "seniors",
      focusHabit: "Gentle daily mobility and short walks after meals",
      targetWeightKg: null,
      targetTimelineWeeks: 12,
      summary: "The priority is safer movement, energy, balance, and daily function before aggressive body transformation."
    }
  };

  return mapping[profile];
}

export function generateTransformationPlan(input: BodyMetricsInput): TransformationPlanResult {
  const bmi = calculateBMI(input.heightCm, input.weightKg);
  const bodyProfile = inferBodyProfile(input);
  const meta = getPlanMeta(bodyProfile);
  const baseCalories = Math.round(input.weightKg * (input.role === "senior" ? 24 : 28));
  const calorieAdjustment =
    meta.goal === "weight_loss" ? -250 :
    meta.goal === "muscle_gain" ? 220 :
    meta.goal === "body_recomposition" ? -100 :
    meta.goal === "energy_boost" ? -50 :
    0;
  const calorieTarget = Math.max(1200, baseCalories + calorieAdjustment);
  const proteinMultiplier =
    bodyProfile === "muscle-gain-priority" ? 1.8 :
    bodyProfile === "mobility-first" ? 1.2 :
    bodyProfile === "fat-loss-priority" || bodyProfile === "recomposition-candidate" ? 1.6 :
    1.4;
  const proteinTarget = Math.round(input.weightKg * proteinMultiplier);
  const hydrationTarget = Math.min(4500, Math.max(1800, Math.round(input.weightKg * 35)));

  let targetWeightKg: number | null = null;
  if (meta.goal === "weight_loss") {
    targetWeightKg = Number(Math.max(input.weightKg - Math.max(3, input.weightKg * 0.08), input.weightKg - 12).toFixed(1));
  } else if (meta.goal === "muscle_gain") {
    targetWeightKg = Number((input.weightKg + Math.max(2, input.weightKg * 0.04)).toFixed(1));
  } else if (meta.goal === "body_recomposition") {
    targetWeightKg = Number((input.weightKg - Math.max(1.5, input.weightKg * 0.03)).toFixed(1));
  }

  return {
    bmi,
    bodyProfile,
    goal: meta.goal,
    calorieTarget,
    proteinTarget,
    hydrationTarget,
    workoutTrack: meta.workoutTrack,
    focusHabit: meta.focusHabit,
    targetWeightKg,
    targetTimelineWeeks: meta.targetTimelineWeeks,
    summary: meta.summary
  };
}

export function applyTransformationPlan(member: Pick<MemberGoalSettings, "role" | "gender" | "age" | "heightCm" | "weightKg" | "bodyFatPct"> & Partial<MemberGoalSettings>) {
  const plan = generateTransformationPlan({
    role: member.role,
    gender: member.gender,
    age: member.age,
    heightCm: member.heightCm,
    weightKg: member.weightKg,
    bodyFatPct: member.bodyFatPct ?? null
  });

  return {
    ...member,
    bodyProfile: plan.bodyProfile,
    goal: plan.goal,
    calorieTarget: plan.calorieTarget,
    proteinTarget: plan.proteinTarget,
    hydrationTarget: plan.hydrationTarget,
    workoutTrack: plan.workoutTrack,
    focusHabit: plan.focusHabit,
    targetWeightKg: plan.targetWeightKg,
    targetTimelineWeeks: plan.targetTimelineWeeks
  };
}

export function bodyProfileLabel(profile: BodyProfile) {
  const labels: Record<BodyProfile, string> = {
    "lean-build": "Lean Build",
    "balanced-build": "Balanced Build",
    "fat-loss-priority": "Fat-loss Priority",
    "muscle-gain-priority": "Muscle-gain Priority",
    "recomposition-candidate": "Recomposition Candidate",
    "mobility-first": "Mobility-first"
  };
  return labels[profile];
}
