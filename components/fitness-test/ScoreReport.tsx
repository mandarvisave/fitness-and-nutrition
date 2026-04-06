import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ScoreReport({ score, level, plan, goal, reportText }: { score: number; level: string; plan: string; goal: string; reportText: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{level} - {score}/100</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-stone-600">
        <p><span className="font-semibold text-stone-900">Primary goal:</span> {goal}</p>
        <p><span className="font-semibold text-stone-900">Recommended plan:</span> {plan}</p>
        <p>{reportText}</p>
      </CardContent>
    </Card>
  );
}
