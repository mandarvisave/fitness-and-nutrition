import { openai } from "@/lib/ai/openai";

export async function generateNudge(input: { language: "en" | "hi"; category: string }) {
  try {
    const response = await openai.responses.create({
      model: "gpt-4o",
      input: `Write a short motivational family fitness tip in ${input.language === "hi" ? "Hindi" : "English"} focused on ${input.category}. Return one sentence and a 2-word action label.`
    });
    const text = response.output_text;
    return {
      nudge: text,
      category: input.category,
      actionLabel: input.language === "hi" ? "आज करें" : "Fix Today"
    };
  } catch {
    return {
      nudge: input.language === "hi" ? "आज पूरे परिवार के लिए नाश्ते में प्रोटीन जोड़ें और पानी की बोतल साथ रखें।" : "Add one protein source to breakfast for everyone today and keep water bottles visible.",
      category: input.category,
      actionLabel: input.language === "hi" ? "आज करें" : "Fix Today"
    };
  }
}
