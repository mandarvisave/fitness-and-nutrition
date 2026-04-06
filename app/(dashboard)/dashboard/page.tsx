import { AINudgeCard } from "@/components/dashboard/AINudgeCard";
import { DailySummaryRing } from "@/components/dashboard/DailySummaryRing";
import { FamilyHealthScoreCard } from "@/components/dashboard/FamilyHealthScoreCard";
import { MemberScoreCard } from "@/components/dashboard/MemberScoreCard";
import { QuickLogPanel } from "@/components/dashboard/QuickLogPanel";
import { TransformationPlanCard } from "@/components/dashboard/TransformationPlanCard";
import { WeakestCategoryAlert } from "@/components/dashboard/WeakestCategoryAlert";
import { Sidebar } from "@/components/layout/Sidebar";
import { dashboardData } from "@/lib/site-data";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 pb-24 sm:px-6">
        <FamilyHealthScoreCard score={dashboardData.familyScore} />
        <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            <WeakestCategoryAlert {...dashboardData.weakest} />
            <TransformationPlanCard />
            <div className="grid gap-4 md:grid-cols-3">
              {dashboardData.members.map((member) => (
                <MemberScoreCard key={member.id} member={member} />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <DailySummaryRing caloriesIn={dashboardData.summary.in} caloriesOut={dashboardData.summary.out} />
            <QuickLogPanel />
            <AINudgeCard message={dashboardData.dailyNudge} />
          </div>
        </div>
      </main>
    </div>
  );
}
