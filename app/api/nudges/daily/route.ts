import { NextResponse } from "next/server";
import { generateNudge } from "@/lib/ai/generateNudge";

export async function GET() {
  const nudge = await generateNudge({ language: "en", category: "Hydration" });
  return NextResponse.json(nudge);
}
