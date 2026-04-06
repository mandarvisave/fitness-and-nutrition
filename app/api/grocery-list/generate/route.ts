import { NextResponse } from "next/server";
import { generateGroceryList } from "@/lib/ai/generateGroceryList";

export async function POST(request: Request) {
  const body = await request.json();
  const groceryList = await generateGroceryList(body.mealPlan);
  return NextResponse.json({ groceryList });
}
