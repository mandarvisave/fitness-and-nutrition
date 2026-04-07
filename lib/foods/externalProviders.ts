type FoodSearchApiResult = {
  id: string;
  name: string;
  calories_kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  serving_label: string | null;
  serving_grams: number | null;
  source: "verified" | "inferred";
  confidence: "high" | "medium" | "low";
};

function toNumberOrNull(value: unknown): number | null {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function searchOpenFoodFacts(query: string, limit = 8): Promise<FoodSearchApiResult[]> {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=${Math.min(20, limit)}&fields=code,product_name,nutriments,serving_size`;

  const response = await fetch(url, {
    headers: {
      // Recommended by Open Food Facts for user agents.
      "User-Agent": "FitFamilyIndia/1.0 (nutrition-search)"
    },
    cache: "no-store"
  });
  if (!response.ok) return [];

  const data = (await response.json()) as {
    products?: Array<{
      code?: string;
      product_name?: string;
      serving_size?: string;
      nutriments?: {
        "energy-kcal_100g"?: number;
        proteins_100g?: number;
        carbohydrates_100g?: number;
        fat_100g?: number;
      };
    }>;
  };

  const products = data.products ?? [];
  return products
    .filter((p) => Boolean(p.product_name?.trim()))
    .slice(0, limit)
    .map((p) => ({
      id: `off-${p.code ?? Math.random().toString(36).slice(2)}`,
      name: p.product_name!.trim(),
      calories_kcal: toNumberOrNull(p.nutriments?.["energy-kcal_100g"]),
      protein_g: toNumberOrNull(p.nutriments?.proteins_100g),
      carbs_g: toNumberOrNull(p.nutriments?.carbohydrates_100g),
      fat_g: toNumberOrNull(p.nutriments?.fat_100g),
      serving_label: p.serving_size?.trim() || "100 g",
      serving_grams: 100,
      source: "verified",
      confidence: "medium"
    }));
}

export async function searchUsdaFoodDataCentral(query: string, apiKey: string, limit = 8): Promise<FoodSearchApiResult[]> {
  if (!apiKey) return [];
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      pageSize: Math.min(20, limit),
      dataType: ["Foundation", "SR Legacy", "Survey (FNDDS)", "Branded"]
    }),
    cache: "no-store"
  });
  if (!response.ok) return [];

  const data = (await response.json()) as {
    foods?: Array<{
      fdcId?: number;
      description?: string;
      foodNutrients?: Array<{ nutrientName?: string; value?: number }>;
    }>;
  };

  const foods = data.foods ?? [];
  return foods
    .filter((f) => Boolean(f.description?.trim()))
    .slice(0, limit)
    .map((f) => {
      const nutrients = f.foodNutrients ?? [];
      const get = (name: string) => toNumberOrNull(nutrients.find((n) => n.nutrientName === name)?.value);
      return {
        id: `usda-${f.fdcId ?? Math.random().toString(36).slice(2)}`,
        name: f.description!.trim(),
        calories_kcal: get("Energy"),
        protein_g: get("Protein"),
        carbs_g: get("Carbohydrate, by difference"),
        fat_g: get("Total lipid (fat)"),
        serving_label: "100 g",
        serving_grams: 100,
        source: "verified" as const,
        confidence: "high" as const
      };
    });
}

export type { FoodSearchApiResult };
