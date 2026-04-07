import { NextResponse } from "next/server";
import { getFoodDataset, searchFoods } from "@/lib/foods/foodDataset";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const limit = Number(url.searchParams.get("limit") ?? 20);

  if (q.trim().length < 2) {
    return NextResponse.json({ results: [] as unknown[] });
  }

  const { foods } = await getFoodDataset();
  const results = searchFoods(foods, q, Math.max(1, Math.min(50, limit))).map((food) => ({
    id: food.id,
    name: food.name,
    calories_kcal: food.calories_kcal,
    protein_g: food.protein_g,
    carbs_g: food.carbs_g,
    fat_g: food.fat_g,
    serving_label: food.serving_label,
    serving_grams: food.serving_grams
  }));

  return NextResponse.json(
    { results },
    {
      headers: {
        "Cache-Control": "public, max-age=60"
      }
    }
  );
}
