import { generateGeminiText } from "@/lib/ai/gemini";

export interface WorkoutPlanRequest {
  goal: string;
  fitnessLevel: "beginner" | "intermediate" | "advanced";
  daysPerWeek: number;
  sessionMinutes: number;
  equipment: string[];
  constraints?: string;
  injuries?: string;
}

export interface WorkoutPlanExercise {
  name: string;
  reps: string;
  rest: string;
  notes: string;
}

export interface WorkoutPlanDay {
  day: string;
  focus: string;
  warmup: string[];
  main: WorkoutPlanExercise[];
  finisher: string;
  cooldown: string[];
}

export interface GeneratedWorkoutPlan {
  title: string;
  weeklySummary: string;
  progressionTip: string;
  recoveryTip: string;
  days: WorkoutPlanDay[];
}

function buildFallbackPlan(input: WorkoutPlanRequest): GeneratedWorkoutPlan {
  const totalDays = Math.max(2, Math.min(7, Number(input.daysPerWeek) || 4));
  const focusByGoal =
    input.goal.toLowerCase().includes("muscle")
      ? "Strength and hypertrophy"
      : input.goal.toLowerCase().includes("loss")
        ? "Fat loss and conditioning"
        : "General fitness and mobility";

  const days: WorkoutPlanDay[] = Array.from({ length: totalDays }, (_, index) => ({
    day: `Day ${index + 1}`,
    focus: index % 2 === 0 ? `${focusByGoal} (primary)` : "Cardio, core, and recovery support",
    warmup: ["2 minutes brisk march", "10 bodyweight squats", "Arm circles 30 seconds"],
    main: [
      { name: "Bodyweight Squat", reps: "3 x 12", rest: "60 sec", notes: "Control the lowering phase." },
      { name: "Push-up (incline if needed)", reps: "3 x 8-12", rest: "60 sec", notes: "Keep core tight." },
      { name: "Glute Bridge", reps: "3 x 15", rest: "45 sec", notes: "Pause at top for 1 second." }
    ],
    finisher: `${Math.max(3, Math.floor(input.sessionMinutes / 6))} minutes brisk walk or light jog intervals.`,
    cooldown: ["Hamstring stretch 30 sec/side", "Child's pose 45 sec", "Deep breathing 1 minute"]
  }));

  return {
    title: `${input.goal} Home Workout Plan`,
    weeklySummary: `A ${totalDays}-day plan tailored for ${input.fitnessLevel} level with ${input.sessionMinutes}-minute sessions.`,
    progressionTip: "Add 1-2 reps to each set every week, then increase intensity when all sets feel easy.",
    recoveryTip: "Sleep 7-8 hours, hydrate well, and keep one full rest day for recovery.",
    days
  };
}

function extractJsonObject(raw: string): string {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    throw new Error("No JSON object found in Gemini response");
  }
  return cleaned.slice(start, end + 1);
}

function parseJsonResponse(raw: string): GeneratedWorkoutPlan {
  const parsed = JSON.parse(extractJsonObject(raw)) as Partial<GeneratedWorkoutPlan>;
  if (!parsed?.title || !parsed?.days || !Array.isArray(parsed.days) || parsed.days.length === 0) {
    throw new Error("Invalid workout plan format");
  }
  return parsed as GeneratedWorkoutPlan;
}

export async function generateWorkoutPlan(input: WorkoutPlanRequest): Promise<GeneratedWorkoutPlan> {
  const prompt = `You are an expert Indian family fitness coach.
Create a practical, safe weekly workout plan for a fitness web app user.

User profile:
- Goal: ${input.goal}
- Fitness level: ${input.fitnessLevel}
- Available days per week: ${input.daysPerWeek}
- Session length: ${input.sessionMinutes} minutes
- Equipment: ${input.equipment.join(", ") || "none"}
- Constraints: ${input.constraints?.trim() || "none"}
- Injuries/limitations: ${input.injuries?.trim() || "none"}

Rules:
- Plan must match the user's available days and session length.
- Keep exercises realistic for home users.
- Include warm-up and cooldown for each day.
- Add progression and recovery tips.
- Keep language simple and supportive.
- Return ONLY valid JSON.

Use this exact JSON shape:
{
  "title": "string",
  "weeklySummary": "string",
  "progressionTip": "string",
  "recoveryTip": "string",
  "days": [
    {
      "day": "Day 1",
      "focus": "string",
      "warmup": ["string"],
      "main": [
        {
          "name": "string",
          "reps": "string",
          "rest": "string",
          "notes": "string"
        }
      ],
      "finisher": "string",
      "cooldown": ["string"]
    }
  ]
}`;

  try {
    const text = await generateGeminiText({ prompt });
    return parseJsonResponse(text);
  } catch (error) {
    console.error("Workout plan generation failed; using fallback plan.", error);
    return buildFallbackPlan(input);
  }
}
