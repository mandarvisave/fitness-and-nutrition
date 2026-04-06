type SingleQuestion = {
  id: number;
  text: string;
  type: "single" | "goal";
  options: string[];
  scores: number[];
};

type BooleanQuestion = {
  id: number;
  text: string;
  type: "boolean";
  scores: {
    yes: number;
    no: number;
  };
};

type ScaleQuestion = {
  id: number;
  text: string;
  type: "scale";
  min: number;
  max: number;
};

export type FitnessQuestion = SingleQuestion | BooleanQuestion | ScaleQuestion;

export const questions: FitnessQuestion[] = [
  { id: 1, text: "How many days per week do you currently exercise?", type: "single", options: ["0 days", "1-2 days", "3-4 days", "5+ days"], scores: [0, 3, 7, 10] },
  { id: 2, text: "Can you complete 10 push-ups without stopping?", type: "boolean", scores: { yes: 8, no: 0 } },
  { id: 3, text: "Can you walk 30 minutes without feeling breathless?", type: "boolean", scores: { yes: 6, no: 0 } },
  { id: 4, text: "How many hours of sleep do you get per night?", type: "single", options: ["Less than 5", "5-6 hours", "7-8 hours", "More than 8"], scores: [0, 3, 8, 5] },
  { id: 5, text: "Do you drink at least 2 litres of water daily?", type: "boolean", scores: { yes: 5, no: 0 } },
  { id: 6, text: "How would you rate your daily energy levels?", type: "scale", min: 1, max: 10 },
  { id: 7, text: "Do you eat 3 balanced meals a day?", type: "boolean", scores: { yes: 5, no: 0 } },
  { id: 8, text: "Do you consume protein (dal, eggs, paneer, chicken) in every meal?", type: "boolean", scores: { yes: 7, no: 0 } },
  { id: 9, text: "Do you experience back pain or joint pain regularly?", type: "boolean", scores: { yes: 0, no: 5 } },
  { id: 10, text: "How often do you eat outside food or junk food per week?", type: "single", options: ["Daily", "3-4 times", "1-2 times", "Rarely"], scores: [0, 2, 5, 8] },
  { id: 11, text: "Do you currently track your steps or physical activity?", type: "boolean", scores: { yes: 4, no: 0 } },
  { id: 12, text: "Can you hold a plank for 30 seconds?", type: "boolean", scores: { yes: 7, no: 0 } },
  { id: 13, text: "How motivated do you feel to exercise?", type: "scale", min: 1, max: 10 },
  { id: 14, text: "Have you tried and quit a fitness routine before?", type: "boolean", scores: { yes: 0, no: 6 } },
  { id: 15, text: "Do you have any medical condition that limits exercise?", type: "boolean", scores: { yes: 0, no: 5 } },
  { id: 16, text: "Do you eat breakfast every day?", type: "boolean", scores: { yes: 4, no: 0 } },
  { id: 17, text: "Do you sit for more than 6 hours per day?", type: "boolean", scores: { yes: 0, no: 5 } },
  { id: 18, text: "Do you feel stressed most days of the week?", type: "boolean", scores: { yes: 0, no: 5 } },
  { id: 19, text: "Does anyone in your family exercise regularly?", type: "boolean", scores: { yes: 4, no: 0 } },
  { id: 20, text: "What is your primary fitness goal?", type: "goal", options: ["Weight loss", "Muscle gain", "Energy boost", "General health", "Body recomposition"], scores: [0, 0, 0, 0, 0] }
];

export function calculateTestScore(answers: Record<number, string | number>): number {
  return questions.reduce((total, question) => {
    const answer = answers[question.id];
    if (answer === undefined) return total;

    if (question.type === "single" || question.type === "goal") {
      const index = question.options.indexOf(String(answer));
      return total + (index >= 0 ? question.scores[index] : 0);
    }

    if (question.type === "boolean") {
      return total + question.scores[String(answer).toLowerCase() as "yes" | "no"];
    }

    if (question.type === "scale") {
      return total + Number(answer);
    }

    return total;
  }, 0);
}

export function getTestResult(score: number, goal: string) {
  let level: string;
  let plan: string;
  if (score < 30) {
    level = "Beginner";
    plan = "Start with foundational habits";
  } else if (score < 70) {
    level = "Intermediate";
    plan = "Build consistency & upgrade nutrition";
  } else {
    level = "Advanced";
    plan = "Optimise performance & progressive overload";
  }
  return { score, level, plan, goal };
}
