import { mealPlanSample } from "@/lib/site-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FoodDiary() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today&apos;s Diary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {mealPlanSample[0].meals.map((meal) => (
          <div key={meal.type} className="rounded-lg bg-muted p-4">
            <div className="flex items-center justify-between">
              <span className="font-medium capitalize">{meal.type}</span>
              <span className="text-sm text-stone-500">{meal.calories} kcal</span>
            </div>
            <p className="mt-2 text-sm text-stone-700">{meal.name_en} {meal.name_hi ? `(${meal.name_hi})` : ""}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
