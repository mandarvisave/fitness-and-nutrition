import { NextResponse } from "next/server";
import { openai } from "@/lib/ai/openai";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { calculateTestScore, getTestResult } from "@/lib/fitness-test/questions";

export async function POST(request: Request) {
  const body = await request.json();
  const answers = body.answers as Record<number, string | number>;
  const score = calculateTestScore(answers);
  const goal = String(answers[20] ?? "General health");
  const result = getTestResult(score, goal);

  let reportText = `You are starting from a ${result.level.toLowerCase()} base. Focus on one repeatable meal upgrade, three short movement sessions, and one shared family habit this week.`;

  try {
    const response = await openai.responses.create({
      model: "gpt-4o",
      input: `Write a short personalised fitness report for an Indian family app user. Score: ${score}. Level: ${result.level}. Goal: ${goal}. Keep it supportive and practical in 3 sentences.`
    });
    reportText = response.output_text || reportText;
  } catch {}

  const reportData = { plan: result.plan, reportText };

  try {
    const supabase = createServerSupabaseClient();
    const { data } = await supabase.from("assessments").insert({
      user_id: body.userId,
      answers,
      total_score: score,
      level: result.level.toLowerCase(),
      goal,
      report_data: reportData
    }).select("id").single();

    return NextResponse.json({
      assessmentId: data?.id ?? crypto.randomUUID(),
      score,
      level: result.level,
      goal,
      reportData
    });
  } catch {
    return NextResponse.json({
      assessmentId: crypto.randomUUID(),
      score,
      level: result.level,
      goal,
      reportData
    });
  }
}
