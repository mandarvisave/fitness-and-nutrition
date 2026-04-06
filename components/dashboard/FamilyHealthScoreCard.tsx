import { getFHSLevel } from "@/lib/scoring/calculateFHS";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FamilyHealthScoreCard({ score }: { score: number }) {
  const meta = getFHSLevel(score);
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-white to-orange-50">
      <CardHeader>
        <CardTitle>Family Health Score</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
        <div className="flex h-40 w-40 items-center justify-center rounded-full border-[14px] border-primary/20 bg-white text-center shadow-soft">
          <div>
            <div className="text-5xl font-bold text-primary">{score}</div>
            <div className="text-sm text-stone-500">out of 100</div>
          </div>
        </div>
        <div className="max-w-sm">
          <div className="text-sm uppercase tracking-[0.2em] text-stone-500">{meta.level}</div>
          <p className="mt-3 text-lg font-medium">{meta.message}</p>
          <p className="mt-2 text-sm text-stone-600">Your family is strongest when meals, steps, sleep, and hydration happen together across the week.</p>
        </div>
      </CardContent>
    </Card>
  );
}
