import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

export const dynamic = "force-dynamic";

type RecipeDetails = {
    "Recipe ID": string;
    "Title": string;
    "Source": string;
    "Cuisine": string;
};

type RecipeIngredient = {
    "Recipe ID": string;
    "Original Ingredient Name": string;
    "Ingredient Name": string;
};

// Global cache for the parsed CSVs
declare global {
  var __culinaryRecipes: RecipeDetails[] | undefined;
  var __culinaryIngredients: Record<string, string[]> | undefined;
}

function loadDataset() {
    if (global.__culinaryRecipes && global.__culinaryIngredients) {
        return;
    }

    try {
        const recipesPath = path.join(process.cwd(), "dataset", "CulinaryDB", "01_Recipe_Details.csv");
        const recipesCsv = fs.readFileSync(recipesPath, "utf-8");
        const parsedRecipes = Papa.parse(recipesCsv, { header: true, skipEmptyLines: true }).data as RecipeDetails[];
        global.__culinaryRecipes = parsedRecipes;

        const aliasesPath = path.join(process.cwd(), "dataset", "CulinaryDB", "04_Recipe-Ingredients_Aliases.csv");
        const aliasesCsv = fs.readFileSync(aliasesPath, "utf-8");
        const parsedAliases = Papa.parse(aliasesCsv, { header: true, skipEmptyLines: true }).data as RecipeIngredient[];

        const ingredientsMap: Record<string, string[]> = {};
        for (const row of parsedAliases) {
            const rId = row["Recipe ID"];
            if (!rId) continue;
            if (!ingredientsMap[rId]) ingredientsMap[rId] = [];
            ingredientsMap[rId].push(row["Ingredient Name"]);
        }
        global.__culinaryIngredients = ingredientsMap;

    } catch (error) {
        console.error("Error loading CulinaryDB:", error);
    }
}

export async function GET(request: Request) {
  loadDataset();
  
  if (!global.__culinaryRecipes) {
     return NextResponse.json({ error: "Failed to load dataset." }, { status: 500 });
  }

  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.toLowerCase() || "";
  const cuisine = url.searchParams.get("cuisine")?.toLowerCase() || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 24;

  let results = global.__culinaryRecipes;

  if (cuisine && cuisine !== "all") {
      results = results.filter(r => r["Cuisine"]?.toLowerCase() === cuisine);
  }

  if (q) {
      results = results.filter(r => 
          r["Title"]?.toLowerCase().includes(q) || 
          global.__culinaryIngredients?.[r["Recipe ID"]]?.some(i => i.toLowerCase().includes(q))
      );
  }

  const total = results.length;
  const startIndex = (page - 1) * limit;
  const paginated = results.slice(startIndex, startIndex + limit);

  // Attach ingredients
  const responseData = paginated.map(r => ({
      id: r["Recipe ID"],
      title: r["Title"],
      source: r["Source"],
      cuisine: r["Cuisine"],
      ingredients: global.__culinaryIngredients?.[r["Recipe ID"]] || []
  }));

  // Fetch unique cuisines for filters
  const cuisines = Array.from(new Set(global.__culinaryRecipes.map(r => r["Cuisine"]))).filter(Boolean).sort();

  return NextResponse.json({
      data: responseData,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      cuisines
  });
}
