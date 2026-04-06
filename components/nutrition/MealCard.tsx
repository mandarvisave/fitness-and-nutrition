import type { MealEntry } from "@/types/nutrition";

export function MealCard({ meal }: { meal: MealEntry }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <div className="font-medium">{meal.name_en}</div>
        <div className="text-sm text-stone-500">{meal.calories} kcal</div>
      </div>
      <div className="mt-2 text-sm text-stone-600">Protein: {meal.protein_g}g</div>
    </div>
  );
}
