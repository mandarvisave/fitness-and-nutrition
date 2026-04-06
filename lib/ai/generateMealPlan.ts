import { openai } from "@/lib/ai/openai";
import type { MealPlanDay } from "@/types/nutrition";

export async function generateMealPlan(input: {
  familyMembers: string[];
  goal: string;
  preferences: string[];
  budget: string;
  calories: number;
}): Promise<MealPlanDay[]> {
  const prompt = `You are a certified Indian nutritionist. Generate a practical, affordable 7-day meal plan using common Indian ingredients.
Include: breakfast, lunch, dinner, snacks.
Goals: ${input.goal}. Calorie target: ${input.calories}.
Constraints: ${input.budget}, ${input.preferences.join(", ")}.
Format as JSON: { day: string, meals: { type, name_en, name_hi, calories, protein_g, recipe_url } }`;

  try {
    const response = await openai.responses.create({
      model: "gpt-4o",
      input: prompt
    });
    const text = response.output_text;
    return JSON.parse(text) as MealPlanDay[];
  } catch {
    return [
      {
        day: "Monday",
        meals: [
          { type: "breakfast", name_en: "Besan chilla with curd", name_hi: "बेसन चीला", calories: 320, protein_g: 17 },
          { type: "lunch", name_en: "Dal rice with cucumber salad", name_hi: "दाल चावल", calories: 520, protein_g: 19 },
          { type: "dinner", name_en: "Paneer tikka roti wrap", name_hi: "पनीर टिक्का रैप", calories: 470, protein_g: 28 }
        ]
      }
    ];
  }
}
