import { openai } from "@/lib/ai/openai";

export async function generateGroceryList(mealPlan: unknown) {
  try {
    const response = await openai.responses.create({
      model: "gpt-4o",
      input: `Convert this Indian family meal plan into a consolidated weekly grocery list JSON: ${JSON.stringify(mealPlan)}`
    });
    return JSON.parse(response.output_text);
  } catch {
    return {
      vegetables: ["Onion", "Tomato", "Spinach"],
      protein: ["Paneer", "Eggs", "Moong dal"],
      staples: ["Rice", "Atta", "Poha"]
    };
  }
}
