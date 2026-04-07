import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const foodsPath = path.join(root, "dataset", "normalized", "foods_master.tsv");
const aliasesPath = path.join(root, "dataset", "normalized", "food_aliases.tsv");
const servingsPath = path.join(root, "dataset", "normalized", "serving_conversions.tsv");

function parseTsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (lines.length === 0) return { header: [], rows: [] };
  const header = lines[0].split("\t").map((s) => s.trim());
  const rows = lines.slice(1).map((line) => {
    const cols = line.split("\t").map((s) => s.trim());
    const record = {};
    for (let i = 0; i < header.length; i += 1) {
      record[header[i]] = cols[i] ?? "";
    }
    return record;
  });
  return { header, rows };
}

function toNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : NaN;
}

function normalize(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

async function run() {
  const [foodsRaw, aliasesRaw, servingsRaw] = await Promise.all([
    fs.readFile(foodsPath, "utf8"),
    fs.readFile(aliasesPath, "utf8"),
    fs.readFile(servingsPath, "utf8")
  ]);

  const foods = parseTsv(foodsRaw);
  const aliases = parseTsv(aliasesRaw);
  const servings = parseTsv(servingsRaw);

  const requiredFoodCols = [
    "food_id",
    "canonical_name",
    "calories_per_100g",
    "protein_per_100g",
    "carbs_per_100g",
    "fat_per_100g",
    "source",
    "confidence"
  ];
  for (const col of requiredFoodCols) {
    assert(foods.header.includes(col), `foods_master.tsv missing required column: ${col}`);
  }

  const foodIds = new Set();
  const foodRows = foods.rows.map((row) => {
    const foodId = row.food_id;
    assert(foodId.length > 0, "foods_master.tsv contains row with empty food_id");
    assert(!foodIds.has(foodId), `Duplicate food_id in foods_master.tsv: ${foodId}`);
    foodIds.add(foodId);

    const cals = toNumber(row.calories_per_100g);
    const protein = toNumber(row.protein_per_100g);
    const carbs = toNumber(row.carbs_per_100g);
    const fat = toNumber(row.fat_per_100g);
    assert(cals >= 0, `Invalid calories_per_100g for ${foodId}`);
    assert(protein >= 0, `Invalid protein_per_100g for ${foodId}`);
    assert(carbs >= 0, `Invalid carbs_per_100g for ${foodId}`);
    assert(fat >= 0, `Invalid fat_per_100g for ${foodId}`);
    assert(["verified", "inferred"].includes(row.source), `Invalid source for ${foodId}: ${row.source}`);
    assert(["high", "medium", "low"].includes(row.confidence), `Invalid confidence for ${foodId}: ${row.confidence}`);
    return row;
  });

  for (const row of aliases.rows) {
    assert(foodIds.has(row.food_id), `Alias references unknown food_id: ${row.food_id}`);
    assert(row.alias.length > 0, `Alias row has empty alias for food_id ${row.food_id}`);
  }

  const servingsByFoodId = new Map();
  for (const row of servings.rows) {
    assert(foodIds.has(row.food_id), `Serving conversion references unknown food_id: ${row.food_id}`);
    assert(row.serving_label.length > 0, `Serving row has empty label for food_id ${row.food_id}`);
    const grams = toNumber(row.grams);
    assert(grams > 0, `Serving grams must be > 0 for food_id ${row.food_id}`);
    servingsByFoodId.set(row.food_id, true);
  }

  for (const id of foodIds) {
    assert(servingsByFoodId.has(id), `Missing serving conversion for food_id ${id}`);
  }

  // Search behavior checks (alias + canonical)
  const aliasesByFoodId = new Map();
  for (const row of aliases.rows) {
    const arr = aliasesByFoodId.get(row.food_id) ?? [];
    arr.push(normalize(row.alias));
    aliasesByFoodId.set(row.food_id, arr);
  }

  const rankedFoods = foodRows.map((row) => ({
    id: row.food_id,
    name: normalize(row.canonical_name),
    aliases: aliasesByFoodId.get(row.food_id) ?? []
  }));

  function topMatch(query) {
    const q = normalize(query);
    const scored = rankedFoods
      .map((food) => {
        const idxName = food.name.indexOf(q);
        const idxAlias = food.aliases.reduce((best, alias) => {
          const i = alias.indexOf(q);
          if (i === -1) return best;
          return best === -1 ? i : Math.min(best, i);
        }, -1);
        const idx = idxName === -1 ? idxAlias : idxAlias === -1 ? idxName : Math.min(idxName, idxAlias);
        if (idx === -1) return { id: food.id, score: Number.POSITIVE_INFINITY };
        const exact = food.name === q || food.aliases.includes(q);
        const starts = food.name.startsWith(q) || food.aliases.some((a) => a.startsWith(q));
        const score = (exact ? -1000 : 0) + (starts ? -200 : 0) + idx;
        return { id: food.id, score };
      })
      .filter((x) => Number.isFinite(x.score))
      .sort((a, b) => a.score - b.score);
    return scored[0]?.id;
  }

  assert(topMatch("aloo") === "FF001", "Alias search failed: 'aloo' should match FF001");
  assert(topMatch("pyaz") === "FF003", "Alias search failed: 'pyaz' should match FF003");
  assert(topMatch("paneer") === "FF004", "Canonical search failed: 'paneer' should match FF004");
  assert(topMatch("roti") === "FF005", "Alias search failed: 'roti' should match FF005");

  // Nutrient math sanity check (per 100g to serving)
  const paneer = foodRows.find((f) => f.food_id === "FF004");
  assert(Boolean(paneer), "FF004 missing for nutrient math check");
  const paneerCals100 = toNumber(paneer.calories_per_100g);
  const paneerServing = servings.rows.find((s) => s.food_id === "FF004");
  assert(Boolean(paneerServing), "FF004 serving missing for nutrient math check");
  const paneerServingGrams = toNumber(paneerServing.grams);
  const paneerServingCals = (paneerCals100 * paneerServingGrams) / 100;
  assert(paneerServingCals > 0, "Nutrient serving conversion produced invalid calories");

  console.log("foods-quality-check: OK");
  console.log(`Validated ${foodRows.length} foods, ${aliases.rows.length} aliases, ${servings.rows.length} serving conversions.`);
}

run().catch((error) => {
  console.error("foods-quality-check: FAILED");
  console.error(error.message);
  process.exit(1);
});
