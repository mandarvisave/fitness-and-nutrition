import Link from "next/link";
import { HeartPulse, Home, Salad, Settings, Trophy, Users, Dumbbell } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/nutrition", label: "Nutrition", icon: Salad },
  { href: "/workouts", label: "Workouts", icon: Dumbbell },
  { href: "/workouts/diary", label: "Exercise Diary", icon: Dumbbell },
  { href: "/health-score", label: "Health Score", icon: Trophy },
  { href: "/community", label: "Community", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function Sidebar() {
  return (
    <aside className="hidden w-72 shrink-0 border-r bg-card lg:block">
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="rounded-full bg-primary/10 p-3 text-primary">
          <HeartPulse className="h-6 w-6" />
        </div>
        <div>
          <div className="font-semibold">FitFamily India</div>
          <p className="text-sm text-muted-foreground">Family wellness cockpit</p>
        </div>
      </div>
      <nav className="space-y-2 px-4 pb-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className="flex min-h-11 items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground">
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
