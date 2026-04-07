import { NextResponse } from "next/server";
import { getFoodDataset, searchFoods } from "@/lib/foods/foodDataset";
import { searchOpenFoodFacts, searchUsdaFoodDataCentral } from "@/lib/foods/externalProviders";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") ?? "";
  const limit = Number(url.searchParams.get("limit") ?? 20);

  if (q.trim().length < 2) {
    return NextResponse.json({ results: [] as unknown[] });
  }

  const safeLimit = Math.max(1, Math.min(50, limit));

  // 1) External sources (best quality/coverage)
  const usdaApiKey = process.env.USDA_API_KEY ?? "";
  const [usdaResult, offResult] = await Promise.allSettled([
    usdaApiKey ? searchUsdaFoodDataCentral(q, usdaApiKey, Math.min(15, safeLimit)) : Promise.resolve([]),
    searchOpenFoodFacts(q, Math.min(15, safeLimit))
  ]);
  const usdaResults = usdaResult.status === "fulfilled" ? usdaResult.value : [];
  const offResults = offResult.status === "fulfilled" ? offResult.value : [];

  // 2) Local normalized/fallback dataset
  const { foods } = await getFoodDataset();
  const localResults = searchFoods(foods, q, safeLimit).map((food) => ({
    id: food.id,
    name: food.name,
    calories_kcal: food.calories_kcal,
    protein_g: food.protein_g,
    carbs_g: food.carbs_g,
    fat_g: food.fat_g,
    serving_label: food.serving_label,
    serving_grams: food.serving_grams,
    source: food.source,
    confidence: food.confidence
  }));

  // Merge and de-duplicate by normalized name, preferring higher confidence.
  const all = [...usdaResults, ...offResults, ...localResults];
  const rank = { high: 3, medium: 2, low: 1 } as const;
  const byName = new Map<string, (typeof all)[number]>();
  for (const item of all) {
    const key = item.name.toLowerCase().trim();
    const current = byName.get(key);
    if (!current) {
      byName.set(key, item);
      continue;
    }
    const currentRank = rank[current.confidence] + (current.source === "verified" ? 1 : 0);
    const nextRank = rank[item.confidence] + (item.source === "verified" ? 1 : 0);
    if (nextRank > currentRank) byName.set(key, item);
  }
  const results = Array.from(byName.values()).slice(0, safeLimit);

  return NextResponse.json(
    { results },
    {
      headers: {
        "Cache-Control": "public, max-age=60"
      }
    }
  );
}
