import { BadgeGrid } from "@/components/health-score/BadgeGrid";
import { CategoryBreakdown } from "@/components/health-score/CategoryBreakdown";
import { ScoreGauge } from "@/components/health-score/ScoreGauge";
import { WeeklyChallenge } from "@/components/health-score/WeeklyChallenge";
import { Sidebar } from "@/components/layout/Sidebar";

export default function HealthScorePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 pb-24 sm:px-6">
        <ScoreGauge score={82} />
        <div className="rounded-lg border bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold">Category Breakdown</h2>
          <div className="mt-6">
            <CategoryBreakdown />
          </div>
        </div>
        <div className="rounded-lg border bg-white p-6 shadow-soft">
          <h2 className="text-xl font-semibold">Recent Badges</h2>
          <div className="mt-4">
            <BadgeGrid />
          </div>
        </div>
        <WeeklyChallenge />
      </main>
    </div>
  );
}
