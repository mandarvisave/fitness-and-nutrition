import { NextResponse } from "next/server";
import { DEMO_EMAIL, DEMO_NAME, DEMO_PASSWORD, isDemoModeEnabled } from "@/lib/demo-auth";

export async function GET() {
  return NextResponse.json({
    ok: true,
    demoMode: isDemoModeEnabled(),
    demoCredentials: {
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD
    }
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const action = body.action as "login" | "signup" | "logout";
  const demoMode = isDemoModeEnabled();

  if (!demoMode) {
    return NextResponse.json({ ok: false, error: "Real Supabase auth is not wired in this route." }, { status: 501 });
  }

  const response = NextResponse.json({
    ok: true,
    demoMode: true,
    user: {
      email: body.email ?? DEMO_EMAIL,
      fullName: body.fullName ?? DEMO_NAME,
      language: body.language ?? "en",
      subscriptionTier: "premium"
    }
  });

  if (action === "logout") {
    response.cookies.set("sb-access-token", "", { path: "/", expires: new Date(0) });
    response.cookies.set("fitfamily-tier", "", { path: "/", expires: new Date(0) });
    response.cookies.set("fitfamily-demo-user", "", { path: "/", expires: new Date(0) });
    return response;
  }

  if (action === "login") {
    const email = String(body.email ?? "").toLowerCase().trim();
    const password = String(body.password ?? "");

    if (email !== DEMO_EMAIL || password !== DEMO_PASSWORD) {
      return NextResponse.json(
        {
          ok: false,
          error: "Use the demo credentials shown on the login screen."
        },
        { status: 401 }
      );
    }
  }

  response.cookies.set("sb-access-token", "demo-session-token", {
    path: "/",
    httpOnly: false,
    sameSite: "lax"
  });
  response.cookies.set("fitfamily-tier", "premium", {
    path: "/",
    httpOnly: false,
    sameSite: "lax"
  });
  response.cookies.set(
    "fitfamily-demo-user",
    JSON.stringify({
      email: body.email ?? DEMO_EMAIL,
      fullName: body.fullName ?? DEMO_NAME,
      language: body.language ?? "en"
    }),
    {
      path: "/",
      httpOnly: false,
      sameSite: "lax"
    }
  );

  return response;
}
