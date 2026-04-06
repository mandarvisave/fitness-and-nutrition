import { NextResponse } from "next/server";
import { generateMealPlan } from "@/lib/ai/generateMealPlan";

export async function POST(request: Request) {
  const body = await request.json();
  const mealPlan = await generateMealPlan({
    familyMembers: body.familyMembers ?? [],
    goal: body.goals?.[0] ?? "general fitness",
    preferences: body.preferences ?? [],
    budget: body.budget ?? "budget-conscious",
    calories: body.calories ?? 1800
  });
  return NextResponse.json({ mealPlan });
}
