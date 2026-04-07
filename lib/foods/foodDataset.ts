import fs from "node:fs/promises";
import path from "node:path";

export type FoodDatasetItem = {
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
  aliases?: string[];
};

type ParsedDataset = {
  foods: FoodDatasetItem[];
  byId: Map<string, FoodDatasetItem>;
  aliasesByFoodId: Map<string, string[]>;
};

declare global {
  // eslint-disable-next-line no-var
  var __fitfamilyFoodDataset: ParsedDataset | undefined;
}

function parseTsvLine(line: string): string[] {
  return line.split("\t").map((v) => v.trim());
}

function toNumberOrNull(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalizeName(name: string) {
  return name
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function loadFoodsFromFoodsTsv(repoRoot: string): Promise<FoodDatasetItem[] | null> {
  const filePath = path.join(repoRoot, "dataset", "foods.tsv");
  let content: string;
  try {
    content = await fs.readFile(filePath, "utf8");
  } catch {
    return null;
  }

  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [];
  const header = parseTsvLine(lines[0]);

  const idx = Object.fromEntries(header.map((key, i) => [key, i])) as Record<string, number>;
  if (idx.id === undefined || idx.name === undefined) return [];

  const foods: FoodDatasetItem[] = [];
  for (const line of lines.slice(1)) {
    const cols = parseTsvLine(line);
    const item: FoodDatasetItem = {
      id: cols[idx.id] ?? "",
      name: cols[idx.name] ?? "",
      calories_kcal: toNumberOrNull(cols[idx.calories_kcal]),
      protein_g: toNumberOrNull(cols[idx.protein_g]),
      carbs_g: toNumberOrNull(cols[idx.carbs_g]),
      fat_g: toNumberOrNull(cols[idx.fat_g]),
      serving_label: cols[idx.serving_label] ?? null,
      serving_grams: toNumberOrNull(cols[idx.serving_grams]),
      source: "verified",
      confidence: "high",
      aliases: []
    };
    if (!item.id || !item.name) continue;
    foods.push(item);
  }

  return foods;
}

async function loadFoodsFromItemsTsv(repoRoot: string, limit = 25000): Promise<FoodDatasetItem[]> {
  const filePath = path.join(repoRoot, "dataset", "items.tsv", "items.tsv");
  let content: string;
  try {
    content = await fs.readFile(filePath, "utf8");
  } catch {
    return [];
  }

  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return [];

  const foods: FoodDatasetItem[] = [];
  for (const line of lines.slice(1, limit + 1)) {
    const [id, raw] = parseTsvLine(line);
    if (!id || !raw) continue;

    // Pick a human-ish name from the taxonomy string.
    const first = raw.split(",")[0] ?? raw;
    const lastPart = first.split("__").pop() ?? first;
    const name = lastPart.replace(/_/g, " ").trim();

    foods.push({
      id,
      name,
      calories_kcal: null,
      protein_g: null,
      carbs_g: null,
      fat_g: null,
      serving_label: null,
      serving_grams: null,
      source: "inferred",
      confidence: "low",
      aliases: []
    });
  }

  return foods;
}

async function loadNormalizedDataset(repoRoot: string): Promise<{ foods: FoodDatasetItem[]; aliasesByFoodId: Map<string, string[]> } | null> {
  const foodsPath = path.join(repoRoot, "dataset", "normalized", "foods_master.tsv");
  const aliasesPath = path.join(repoRoot, "dataset", "normalized", "food_aliases.tsv");
  const servingsPath = path.join(repoRoot, "dataset", "normalized", "serving_conversions.tsv");

  let foodsContent: string;
  try {
    foodsContent = await fs.readFile(foodsPath, "utf8");
  } catch {
    return null;
  }

  const aliasesByFoodId = new Map<string, string[]>();
  try {
    const aliasesContent = await fs.readFile(aliasesPath, "utf8");
    const aliasLines = aliasesContent.split(/\r?\n/).filter(Boolean);
    const aliasHeader = parseTsvLine(aliasLines[0] ?? "");
    const idx = Object.fromEntries(aliasHeader.map((key, i) => [key, i])) as Record<string, number>;
    for (const line of aliasLines.slice(1)) {
      const cols = parseTsvLine(line);
      const foodId = cols[idx.food_id];
      const alias = cols[idx.alias];
      if (!foodId || !alias) continue;
      const arr = aliasesByFoodId.get(foodId) ?? [];
      arr.push(alias);
      aliasesByFoodId.set(foodId, arr);
    }
  } catch {}

  const servingsByFoodId = new Map<string, { serving_label: string; serving_grams: number }>();
  try {
    const servingsContent = await fs.readFile(servingsPath, "utf8");
    const servingLines = servingsContent.split(/\r?\n/).filter(Boolean);
    const servingHeader = parseTsvLine(servingLines[0] ?? "");
    const idx = Object.fromEntries(servingHeader.map((key, i) => [key, i])) as Record<string, number>;
    for (const line of servingLines.slice(1)) {
      const cols = parseTsvLine(line);
      const foodId = cols[idx.food_id];
      const servingLabel = cols[idx.serving_label];
      const grams = toNumberOrNull(cols[idx.grams]);
      if (!foodId || !servingLabel || grams == null) continue;
      if (!servingsByFoodId.has(foodId)) {
        servingsByFoodId.set(foodId, { serving_label: servingLabel, serving_grams: grams });
      }
    }
  } catch {}

  const lines = foodsContent.split(/\r?\n/).filter(Boolean);
  if (lines.length <= 1) return null;
  const header = parseTsvLine(lines[0]);
  const idx = Object.fromEntries(header.map((key, i) => [key, i])) as Record<string, number>;

  const foods: FoodDatasetItem[] = [];
  for (const line of lines.slice(1)) {
    const cols = parseTsvLine(line);
    const id = cols[idx.food_id] ?? "";
    const name = cols[idx.canonical_name] ?? "";
    if (!id || !name) continue;
    const serving = servingsByFoodId.get(id);
    foods.push({
      id,
      name,
      calories_kcal: toNumberOrNull(cols[idx.calories_per_100g]),
      protein_g: toNumberOrNull(cols[idx.protein_per_100g]),
      carbs_g: toNumberOrNull(cols[idx.carbs_per_100g]),
      fat_g: toNumberOrNull(cols[idx.fat_per_100g]),
      serving_label: serving?.serving_label ?? "100 g",
      serving_grams: serving?.serving_grams ?? 100,
      source: (cols[idx.source] as "verified" | "inferred") ?? "verified",
      confidence: (cols[idx.confidence] as "high" | "medium" | "low") ?? "high",
      aliases: aliasesByFoodId.get(id) ?? []
    });
  }

  return { foods, aliasesByFoodId };
}

export async function getFoodDataset(): Promise<ParsedDataset> {
  if (process.env.NODE_ENV !== "development" && global.__fitfamilyFoodDataset) return global.__fitfamilyFoodDataset;

  const repoRoot = process.cwd();
  const normalized = await loadNormalizedDataset(repoRoot);
  if (normalized && normalized.foods.length > 0) {
    const byId = new Map(normalized.foods.map((f) => [String(f.id), f]));
    const parsed = { foods: normalized.foods, byId, aliasesByFoodId: normalized.aliasesByFoodId };
    global.__fitfamilyFoodDataset = parsed;
    return parsed;
  }

  const foodsFromFoodsTsv = await loadFoodsFromFoodsTsv(repoRoot);
  const fallbackFoods = await loadFoodsFromItemsTsv(repoRoot);
  const foods = [...(foodsFromFoodsTsv ?? []), ...fallbackFoods];

  const normalizedFoods = foods
    .map((food) => ({ ...food, name: food.name.trim() }))
    .filter((food) => food.name.length > 0);

  // De-dupe by normalized name, prefer entries with calories.
  const bestByName = new Map<string, FoodDatasetItem>();
  for (const food of normalizedFoods) {
    const key = normalizeName(food.name);
    const current = bestByName.get(key);
    if (!current) {
      bestByName.set(key, food);
      continue;
    }
    const currentScore = (current.calories_kcal ?? -1) >= 0 ? 1 : 0;
    const nextScore = (food.calories_kcal ?? -1) >= 0 ? 1 : 0;
    if (nextScore > currentScore) bestByName.set(key, food);
  }

  const finalFoods = Array.from(bestByName.values());
  const byId = new Map(finalFoods.map((f) => [String(f.id), f]));
  const aliasesByFoodId = new Map<string, string[]>();

  const parsed = { foods: finalFoods, byId, aliasesByFoodId };
  global.__fitfamilyFoodDataset = parsed;
  return parsed;
}

export function searchFoods(foods: FoodDatasetItem[], query: string, limit = 20): FoodDatasetItem[] {
  const q = normalizeName(query);
  if (!q) return [];

  const scored = foods
    .map((food) => {
      const name = normalizeName(food.name);
      const aliasHits = (food.aliases ?? []).map(normalizeName);
      const aliasIdx = aliasHits.reduce((best, alias) => {
        const i = alias.indexOf(q);
        if (i === -1) return best;
        return best === -1 ? i : Math.min(best, i);
      }, -1);
      const idx = name.indexOf(q);
      const bestIdx = idx === -1 ? aliasIdx : aliasIdx === -1 ? idx : Math.min(idx, aliasIdx);
      if (bestIdx === -1) return { food, score: Infinity, name };

      const startsWith = name.startsWith(q);
      const aliasStartsWith = aliasHits.some((alias) => alias.startsWith(q));
      const exact = name === q;
      const aliasExact = aliasHits.includes(q);
      const tokenStart = name.split(" ").some((token) => token.startsWith(q));
      const hasNutrition = food.calories_kcal != null;
      const qualityBoost = hasNutrition ? -8 : 0;
      const sourceBoost = food.source === "verified" ? -4 : 0;
      const rank =
        (exact || aliasExact ? -1000 : 0) +
        (startsWith || aliasStartsWith ? -200 : 0) +
        (tokenStart ? -60 : 0) +
        bestIdx +
        qualityBoost +
        sourceBoost;
      return { food, score: rank, name };
    })
    .filter((x) => Number.isFinite(x.score))
    .sort((a, b) => a.score - b.score || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((x) => x.food);

  return scored;
}
