"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutDemoSession } from "@/lib/logout";

const links = [
  { href: "/settings", label: "Profile & Preferences" },
  { href: "/settings/goals", label: "Member Goals" },
  { href: "/settings/subscription", label: "Subscription" }
];

export function SettingsNav({ currentPath }: { currentPath: string }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      setLogoutError(null);
      await logoutDemoSession();
      router.push("/login");
      router.refresh();
    } catch {
      setLogoutError("Unable to log out right now. Please try again.");
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="space-y-2 rounded-lg border bg-card p-3 shadow-soft">
      <nav className="grid gap-2 md:grid-cols-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex min-h-11 items-center justify-center rounded-lg px-4 py-3 text-sm font-medium transition",
              currentPath === link.href ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-border"
            )}
          >
            {link.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 py-3 text-sm font-medium text-accent-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </nav>
      {logoutError ? <p className="px-1 text-sm text-red-600">{logoutError}</p> : null}
    </div>
  );
}
