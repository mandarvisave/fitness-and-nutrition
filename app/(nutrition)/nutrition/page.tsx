import { FestivalModeToggle } from "@/components/nutrition/FestivalModeToggle";
import { FoodDiary } from "@/components/nutrition/FoodDiary";
import { FoodSearchBar } from "@/components/nutrition/FoodSearchBar";
import { MacroRing } from "@/components/nutrition/MacroRing";
import { Sidebar } from "@/components/layout/Sidebar";

export default function NutritionPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 pb-24 sm:px-6">
        <FoodSearchBar />
        <FestivalModeToggle />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <FoodDiary />
          <MacroRing />
        </div>
      </main>
    </div>
  );
}
