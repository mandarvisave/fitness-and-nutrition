import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const authProtectedPrefixes = [
  "/dashboard",
  "/nutrition",
  "/workouts",
  "/health-score",
  "/progress",
  "/coaching",
  "/settings"
];

const paidOnlyRoutes = [
  "/coaching/book",
  "/coaching/dashboard",
  "/nutrition/meal-planner",
  "/nutrition/grocery-list",
  "/progress/weekly-report",
  "/workouts/builder"
];

const publicRoutes = ["/", "/fitness-test", "/blog", "/pricing", "/about", "/how-it-works", "/community/myths"];

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const response = await updateSession(request);

  if (publicRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return response;
  }

  if (!authProtectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return response;
  }

  const isAuthenticated = Boolean(request.cookies.get("sb-access-token") || request.cookies.get("sb:token"));

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (paidOnlyRoutes.some((route) => pathname.startsWith(route))) {
    const tier = request.cookies.get("fitfamily-tier")?.value ?? "free";
    if (tier === "free") {
      return NextResponse.redirect(new URL("/pricing", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js).*)"]
};
