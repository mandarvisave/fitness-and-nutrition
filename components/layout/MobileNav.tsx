"use client";

import Link from "next/link";
import { Dumbbell, Home, Salad, Trophy } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/nutrition", label: "Food", icon: Salad },
  { href: "/workouts", label: "Move", icon: Dumbbell },
  { href: "/health-score", label: "Score", icon: Trophy }
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-card/95 px-3 py-2 backdrop-blur lg:hidden">
      <div className="grid grid-cols-4 gap-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex min-h-11 flex-col items-center justify-center rounded-lg text-xs font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <Icon className="mb-1 h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
