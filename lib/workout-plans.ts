import type { WorkoutTrack } from "@/types/settings";

export interface WorkoutPlan {
  name: string;
  focus: string;
  duration: string;
  level: string;
}

export interface WorkoutTrackDetail {
  slug: WorkoutTrack;
  title: string;
  description: string;
  weeks: string;
  goal: string;
  bestFor: string;
  schedule: string;
  equipment: string;
  highlights: string[];
  kind: "goal" | "lifestyle";
  plans: WorkoutPlan[];
}

export const workoutTrackMap: Record<WorkoutTrack, WorkoutTrackDetail> = {
  "weight-loss": {
    slug: "weight-loss",
    title: "Weight Loss",
    description: "Fat-loss-focused walking, circuits, and simple calorie-burning sessions you can repeat at home.",
    weeks: "6 weeks",
    goal: "Lose body fat while protecting energy and consistency.",
    bestFor: "Beginners and busy adults who want visible progress without jumping into extreme workouts.",
    schedule: "4 training days per week with 2 interval days, 2 full-body circuit days, and a daily step target.",
    equipment: "Walking shoes, mat, water bottle, optional light dumbbells.",
    highlights: [
      "Low-impact progressions that are easier on knees and joints.",
      "Step-count support to keep calorie burn high between sessions.",
      "Short circuits that fit before work or after dinner."
    ],
    kind: "goal",
    plans: [
      { name: "Starter Burn", focus: "Walking intervals + bodyweight circuits", duration: "20 min", level: "Beginner" },
      { name: "Metabolic Reset", focus: "Low-impact cardio and squat-push patterns", duration: "25 min", level: "Beginner-Intermediate" },
      { name: "Weekend Sweat", focus: "Family-friendly conditioning ladder", duration: "30 min", level: "Intermediate" }
    ]
  },
  "muscle-gain": {
    slug: "muscle-gain",
    title: "Muscle Gain",
    description: "At-home strength work built around progressive overload, tempo control, and smarter recovery.",
    weeks: "8 weeks",
    goal: "Build lean muscle with structured strength sessions.",
    bestFor: "Anyone who wants to get stronger and add size using bodyweight, bands, or household resistance.",
    schedule: "4 weekly strength sessions split into lower body, upper push, upper pull, and full-body overload.",
    equipment: "Backpack, resistance bands, mat, chair or bench.",
    highlights: [
      "Progressive overload using backpacks, tempo, and extra reps.",
      "Higher protein and recovery focus baked into the routine.",
      "Clear strength progression from foundational to higher-volume blocks."
    ],
    kind: "goal",
    plans: [
      { name: "Home Strength Base", focus: "Tempo squats, push-ups, and rows", duration: "30 min", level: "Beginner" },
      { name: "Progressive Overload I", focus: "Backpack loading and unilateral work", duration: "35 min", level: "Intermediate" },
      { name: "Mass Builder", focus: "Higher-volume push, pull, and lower body supersets", duration: "40 min", level: "Intermediate" }
    ]
  },
  "general-fitness": {
    slug: "general-fitness",
    title: "General Fitness",
    description: "Balanced training that mixes strength, mobility, conditioning, and weekly movement consistency.",
    weeks: "6 weeks",
    goal: "Improve stamina, movement quality, and all-round health.",
    bestFor: "People who want to feel fitter overall instead of chasing just one body-composition target.",
    schedule: "5 active days per week with 2 strength days, 2 cardio-mobility days, and 1 core reset session.",
    equipment: "Mat, light weights or filled water bottles, skipping rope optional.",
    highlights: [
      "Balanced mix of cardio, mobility, and strength.",
      "Steady weekly structure that is easy to maintain long term.",
      "Works well as a base before moving into more specialized goals."
    ],
    kind: "goal",
    plans: [
      { name: "Fit Foundation", focus: "Bodyweight strength plus light cardio finishers", duration: "25 min", level: "Beginner" },
      { name: "Everyday Athlete", focus: "Mobility, core, and interval conditioning", duration: "30 min", level: "Beginner-Intermediate" },
      { name: "Balanced Builder", focus: "Strength endurance with recovery mobility", duration: "35 min", level: "Intermediate" }
    ]
  },
  "energy-boost": {
    slug: "energy-boost",
    title: "Energy Boost",
    description: "Low-stress movement designed to improve circulation, posture, and daily energy without overtraining.",
    weeks: "4 weeks",
    goal: "Feel lighter, more alert, and less sluggish through the day.",
    bestFor: "People restarting exercise, desk workers, and anyone dealing with afternoon crashes or low motivation.",
    schedule: "5 shorter sessions per week with morning mobility, low-impact cardio, and posture resets.",
    equipment: "Mat, chair, resistance band optional.",
    highlights: [
      "Shorter sessions that create momentum without feeling draining.",
      "Posture and mobility work to undo long sitting hours.",
      "Ideal bridge plan for users rebuilding consistency."
    ],
    kind: "goal",
    plans: [
      { name: "Morning Spark", focus: "Joint mobility, marching, and breathing resets", duration: "15 min", level: "Beginner" },
      { name: "Desk Detox Flow", focus: "Posture drills and low-impact cardio", duration: "20 min", level: "Beginner" },
      { name: "All-Day Energy Circuit", focus: "Core activation and brisk bodyweight intervals", duration: "25 min", level: "Beginner-Intermediate" }
    ]
  },
  "body-recomposition": {
    slug: "body-recomposition",
    title: "Body Recomposition",
    description: "A hybrid plan that blends fat loss and muscle gain so you look leaner while getting stronger.",
    weeks: "8 weeks",
    goal: "Reduce fat and build lean muscle at the same time.",
    bestFor: "Intermediate beginners, returners, and anyone wanting a tighter physique without aggressive bulking or cutting.",
    schedule: "5 weekly sessions with 3 strength-focused days, 1 conditioning day, and 1 mobility-core recovery session.",
    equipment: "Backpack or dumbbells, resistance band, mat, chair or bench.",
    highlights: [
      "Strength-first training with enough conditioning to support fat loss.",
      "Built for high-protein eating and steady progress photos, not scale obsession.",
      "Best when paired with sleep, hydration, and a small calorie deficit or maintenance intake."
    ],
    kind: "goal",
    plans: [
      { name: "Lean Build Base", focus: "Compound lower and upper body strength", duration: "30 min", level: "Beginner-Intermediate" },
      { name: "Recomp Accelerator", focus: "Strength supersets plus short metabolic finishers", duration: "35 min", level: "Intermediate" },
      { name: "Shape & Strength", focus: "Glute, core, push, and pull emphasis with density sets", duration: "40 min", level: "Intermediate" }
    ]
  },
  "family-fit": {
    slug: "family-fit",
    title: "Family Fit",
    description: "Playful shared sessions that get kids, parents, and grandparents moving together.",
    weeks: "4 weeks",
    goal: "Build movement consistency across the whole family.",
    bestFor: "Homes that want fun movement time together instead of solo workouts every day.",
    schedule: "3 shared sessions per week plus one optional family walk challenge.",
    equipment: "Mat, chairs, music speaker, light bands optional.",
    highlights: [
      "Designed for mixed ages and mixed ability levels.",
      "Turns workouts into a social habit instead of another chore.",
      "Easy to pair with weekend challenges and streak tracking."
    ],
    kind: "lifestyle",
    plans: [
      { name: "Playful Cardio", focus: "Relay walks, partner taps, and music breaks", duration: "15 min", level: "All ages" },
      { name: "Weekend Team Circuit", focus: "Shared stations with mobility and balance", duration: "20 min", level: "All ages" },
      { name: "Grandparents Included", focus: "Chair support, marching, and band rows", duration: "18 min", level: "Mixed abilities" }
    ]
  },
  "morning-routine": {
    slug: "morning-routine",
    title: "Morning Routine",
    description: "Fast wake-up sessions that improve mobility, focus, and consistency before the day gets busy.",
    weeks: "3 weeks",
    goal: "Start the day with momentum and better movement quality.",
    bestFor: "Anyone who prefers quick routines before work, school, or household tasks.",
    schedule: "Daily 10 to 15 minute sessions with mobility, core activation, and light cardio.",
    equipment: "Mat only.",
    highlights: [
      "Easy to repeat every day without feeling overwhelming.",
      "Great companion track for desk workers and busy parents.",
      "Improves consistency because the session is done early."
    ],
    kind: "lifestyle",
    plans: [
      { name: "Wake-Up Reset", focus: "Breathing, spinal mobility, and hip opening", duration: "10 min", level: "Beginner" },
      { name: "Sunrise Core", focus: "Low-impact core and glute activation", duration: "12 min", level: "Beginner" },
      { name: "Quick Sweat Start", focus: "Fast bodyweight circuit before breakfast", duration: "15 min", level: "Beginner-Intermediate" }
    ]
  },
  seniors: {
    slug: "seniors",
    title: "Seniors",
    description: "Age-friendly sessions that support mobility, balance, strength, and confidence in daily movement.",
    weeks: "6 weeks",
    goal: "Maintain independence, strength, and stability safely.",
    bestFor: "Older adults who need joint-friendly training with a simple pace and clear structure.",
    schedule: "4 gentle training days per week with balance, chair strength, and walking support.",
    equipment: "Chair, mat, light band or water bottles.",
    highlights: [
      "Joint-conscious pace with steady balance and strength progressions.",
      "Supports walking, stairs, and daily-life confidence.",
      "Easy to modify for blood pressure, mobility, or knee limitations."
    ],
    kind: "lifestyle",
    plans: [
      { name: "Chair Strength Start", focus: "Sit-to-stands, wall pushes, and marching", duration: "15 min", level: "Beginner" },
      { name: "Balance Builder", focus: "Single-leg support, calf raises, and core bracing", duration: "20 min", level: "Beginner" },
      { name: "Mobility & Confidence", focus: "Joint mobility, band pulls, and walking drills", duration: "20 min", level: "Beginner-Intermediate" }
    ]
  }
};

export const goalWorkoutTracks: WorkoutTrackDetail[] = [
  workoutTrackMap["weight-loss"],
  workoutTrackMap["muscle-gain"],
  workoutTrackMap["general-fitness"],
  workoutTrackMap["energy-boost"],
  workoutTrackMap["body-recomposition"]
];

export const lifestyleWorkoutTracks: WorkoutTrackDetail[] = [
  workoutTrackMap["family-fit"],
  workoutTrackMap["morning-routine"],
  workoutTrackMap.seniors
];
