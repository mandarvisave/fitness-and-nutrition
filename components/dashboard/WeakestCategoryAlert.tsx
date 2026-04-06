import { Card, CardContent } from "@/components/ui/card";

export function WeakestCategoryAlert({ category, score, max }: { category: string; score: number; max: number }) {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardContent className="p-5 text-sm text-amber-900">
        <span className="font-semibold">Your family&apos;s weakest area this week: {category} ({score}/{max}).</span> Here&apos;s how to fix it: add one protein source to breakfast and plan two shared home-cooked dinners before Friday.
      </CardContent>
    </Card>
  );
}
