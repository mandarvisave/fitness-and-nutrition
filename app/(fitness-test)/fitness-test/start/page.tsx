"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { QuestionCard } from "@/components/fitness-test/QuestionCard";
import { TestProgressBar } from "@/components/fitness-test/ProgressBar";
import { Button } from "@/components/ui/button";
import { questions } from "@/lib/fitness-test/questions";

type AnswerMap = Record<number, string | number>;

export default function FitnessTestStartPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [index, setIndex] = useState(0);
  const [isPending, startTransition] = useTransition();

  const question = questions[index];

  function handleAnswer(value: string | number) {
    const nextAnswers = { ...answers, [question.id]: value };
    setAnswers(nextAnswers);

    if (index < questions.length - 1) {
      setIndex((current) => current + 1);
      return;
    }

    startTransition(async () => {
      localStorage.setItem("fitfamily-fitness-test", JSON.stringify(nextAnswers));
      const response = await fetch("/api/fitness-test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: null, answers: nextAnswers })
      });
      const data = await response.json();
      localStorage.setItem("fitfamily-last-result", JSON.stringify(data));
      router.push(`/fitness-test/results?id=${data.assessmentId}`);
    });
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <TestProgressBar current={index + 1} total={questions.length} />
      <QuestionCard title={question.text}>
        <div className="space-y-3">
          {"options" in question && question.options ? question.options.map((option) => (
            <Button key={option} variant="secondary" className="w-full justify-start" onClick={() => handleAnswer(option)}>
              {option}
            </Button>
          )) : null}
          {question.type === "boolean" ? (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => handleAnswer("yes")}>Yes</Button>
              <Button variant="secondary" onClick={() => handleAnswer("no")}>No</Button>
            </div>
          ) : null}
          {question.type === "scale" ? (
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 10 }, (_, value) => value + 1).map((value) => (
                <Button key={value} variant="secondary" onClick={() => handleAnswer(value)}>{value}</Button>
              ))}
            </div>
          ) : null}
        </div>
        {isPending ? <p className="mt-4 text-sm text-stone-500">Generating your personalised report...</p> : null}
      </QuestionCard>
    </main>
  );
}
