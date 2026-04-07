import { NextResponse } from "next/server";
import { generateWorkoutPlan } from "@/lib/ai/generateWorkoutPlan";

export async function POST(request: Request) {
  const tier = request.headers.get("cookie")?.match(/fitfamily-tier=([^;]+)/)?.[1] ?? "free";

  if (tier === "free") {
    return NextResponse.json({ error: "This feature is available on Core or Premium plans." }, { status: 403 });
  }

  const body = await request.json();

  const workoutPlan = await generateWorkoutPlan({
    goal: body.goal ?? "general fitness",
    fitnessLevel: body.fitnessLevel ?? "beginner",
    daysPerWeek: Number(body.daysPerWeek ?? 4),
    sessionMinutes: Number(body.sessionMinutes ?? 30),
    equipment: Array.isArray(body.equipment) ? body.equipment : [],
    constraints: body.constraints ?? "",
    injuries: body.injuries ?? ""
  });

  return NextResponse.json(
    { workoutPlan },
    {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
        Expires: "0"
      }
    }
  );
}
