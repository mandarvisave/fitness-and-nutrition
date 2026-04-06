import { Sidebar } from "@/components/layout/Sidebar";
import { CategoryBreakdown } from "@/components/health-score/CategoryBreakdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardInsightsPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 pb-24 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle>Family Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-stone-600">Your household performs best on weekday breakfast consistency and shared evening walks. Weekend snacking and sleep drift are the main score suppressors.</p>
            <CategoryBreakdown />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
