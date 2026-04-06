export interface MealEntry {
  type: "breakfast" | "lunch" | "dinner" | "snack";
  name_en: string;
  name_hi?: string;
  calories: number;
  protein_g: number;
  recipe_url?: string;
  festival?: boolean;
}

export interface MealPlanDay {
  day: string;
  meals: MealEntry[];
}

export interface FoodItem {
  id: string;
  name_en: string;
  name_hi?: string | null;
  category?: string | null;
  calories_per_100g?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
}
