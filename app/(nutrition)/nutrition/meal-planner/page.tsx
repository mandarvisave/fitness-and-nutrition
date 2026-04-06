import { MealCard } from "@/components/nutrition/MealCard";
import { mealPlanSample } from "@/lib/site-data";

export default function MealPlannerPage() {
  return <main className="mx-auto max-w-4xl space-y-4 px-4 py-10">{mealPlanSample[0].meals.map((meal) => <MealCard key={meal.type} meal={meal} />)}</main>;
}
