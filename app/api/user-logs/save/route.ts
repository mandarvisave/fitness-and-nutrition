import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = await request.json();

  let dbSaved = false;
  try {
    const supabase = createServerSupabaseClient();
    await supabase.from("user_logs").upsert(
      {
        user_id: body.userId,
        date: body.date,
        water: body.water ?? [],
        sleep: body.sleep ?? null,
        workouts: body.workouts ?? []
      },
      { onConflict: "user_id,date" }
    );
    dbSaved = true;
  } catch {
    dbSaved = false;
  }

  return NextResponse.json({ ok: true, dbSaved });
}
