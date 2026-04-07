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
};

type ParsedDataset = {
  foods: FoodDatasetItem[];
  byId: Map<string, FoodDatasetItem>;
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
      serving_grams: toNumberOrNull(cols[idx.serving_grams])
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
      serving_grams: null
    });
  }

  return foods;
}

export async function getFoodDataset(): Promise<ParsedDataset> {
  if (global.__fitfamilyFoodDataset) return global.__fitfamilyFoodDataset;

  const repoRoot = process.cwd();
  const foodsFromFoodsTsv = await loadFoodsFromFoodsTsv(repoRoot);
  const foods = foodsFromFoodsTsv ?? (await loadFoodsFromItemsTsv(repoRoot));

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

  global.__fitfamilyFoodDataset = { foods: finalFoods, byId };
  return global.__fitfamilyFoodDataset;
}

export function searchFoods(foods: FoodDatasetItem[], query: string, limit = 20): FoodDatasetItem[] {
  const q = normalizeName(query);
  if (!q) return [];

  const scored = foods
    .map((food) => {
      const name = normalizeName(food.name);
      const idx = name.indexOf(q);
      const score = idx === -1 ? Infinity : idx;
      return { food, score, name };
    })
    .filter((x) => Number.isFinite(x.score))
    .sort((a, b) => a.score - b.score || a.name.localeCompare(b.name))
    .slice(0, limit)
    .map((x) => x.food);

  return scored;
}
