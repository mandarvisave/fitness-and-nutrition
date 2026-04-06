import { FestivalModeToggle } from "@/components/nutrition/FestivalModeToggle";
import { FoodDiary } from "@/components/nutrition/FoodDiary";

export default function NutritionDiaryPage() {
  return <main className="mx-auto max-w-4xl space-y-6 px-4 py-10"><FestivalModeToggle /><FoodDiary /></main>;
}
