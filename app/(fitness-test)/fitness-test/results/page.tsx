"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { GoalSplitResult } from "@/components/fitness-test/GoalSplitResult";
import { ScoreReport } from "@/components/fitness-test/ScoreReport";
import { Button } from "@/components/ui/button";

interface ResultData {
  assessmentId: string;
  score: number;
  level: string;
  goal: string;
  reportData: {
    plan: string;
    reportText: string;
  };
}

export default function FitnessTestResultsPage() {
  const params = useSearchParams();
  const [result, setResult] = useState<ResultData | null>(null);

  useEffect(() => {
    const cached = localStorage.getItem("fitfamily-last-result");
    if (cached) setResult(JSON.parse(cached));
  }, [params]);

  if (!result) {
    return <main className="mx-auto max-w-3xl px-4 py-10">Loading your result...</main>;
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <ScoreReport score={result.score} level={result.level} plan={result.reportData.plan} goal={result.goal} reportText={result.reportData.reportText} />
      <GoalSplitResult />
      <div className="rounded-lg border bg-white p-5 shadow-soft">
        <h2 className="text-xl font-semibold">Save your result permanently</h2>
        <p className="mt-2 text-sm text-stone-600">You can take the test without logging in. Create an account to store the report, sync family members, and unlock progress tracking.</p>
        <div className="mt-4 flex gap-3">
          <Button asChild><Link href="/signup">Create account</Link></Button>
          <Button variant="secondary" asChild><Link href="/pricing">View plans</Link></Button>
        </div>
      </div>
    </main>
  );
}
