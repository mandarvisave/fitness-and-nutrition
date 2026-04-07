import { FestivalModeToggle } from "@/components/nutrition/FestivalModeToggle";
import { FoodDiary } from "@/components/nutrition/FoodDiary";
import { FoodSearchBar } from "@/components/nutrition/FoodSearchBar";
import { MacroRing } from "@/components/nutrition/MacroRing";
import { Sidebar } from "@/components/layout/Sidebar";
import { WellnessLogsPanel } from "@/components/nutrition/WellnessLogsPanel";
import { LogsCalendarPanel } from "@/components/nutrition/LogsCalendarPanel";

type NutritionPageProps = {
  searchParams?: {
    quickLog?: string;
  };
};

export default function NutritionPage({ searchParams }: NutritionPageProps) {
  const quickLog = searchParams?.quickLog;
  const quickLogType = quickLog === "water" || quickLog === "sleep" || quickLog === "workout" || quickLog === "meal" ? quickLog : undefined;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 pb-24 sm:px-6">
        <FoodSearchBar autoFocusOnMount={quickLogType === "meal"} />
        <FestivalModeToggle />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <FoodDiary />
          <MacroRing />
        </div>
        <WellnessLogsPanel initialQuickLog={quickLogType} />
        <LogsCalendarPanel />
      </main>
    </div>
  );
}
