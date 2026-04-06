export const DEMO_EMAIL = "demo@fitfamilyindia.com";
export const DEMO_PASSWORD = "Demo@12345";
export const DEMO_NAME = "FitFamily Demo User";

export function isDemoModeEnabled() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const invalidUrl = !url || url === "your_supabase_url" || (!url.startsWith("http://") && !url.startsWith("https://"));
  const invalidAnonKey = !anonKey || anonKey === "your_supabase_anon_key";

  return invalidUrl || invalidAnonKey;
}
