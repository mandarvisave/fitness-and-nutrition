import crypto from "crypto";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const signature = request.headers.get("x-razorpay-signature") ?? "";
  const payload = await request.text();
  const digest = crypto.createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET ?? "").update(payload).digest("hex");

  if (signature !== digest) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(payload) as { event: string; payload: { payment?: { entity?: { notes?: { userId?: string } } }; subscription?: { entity?: { notes?: { userId?: string } } } } };
  const userId = event.payload.payment?.entity?.notes?.userId ?? event.payload.subscription?.entity?.notes?.userId;

  try {
    const supabase = createServerSupabaseClient();
    if (event.event === "payment.captured" && userId) {
      await supabase.from("profiles").update({ subscription_tier: "core" }).eq("id", userId);
    }
    if (event.event === "subscription.activated" && userId) {
      await supabase.from("subscriptions").update({ status: "active" }).eq("user_id", userId);
    }
    if (event.event === "subscription.cancelled" && userId) {
      await supabase.from("subscriptions").update({ status: "cancelled" }).eq("user_id", userId);
    }
  } catch {}

  return NextResponse.json({ received: true });
}
