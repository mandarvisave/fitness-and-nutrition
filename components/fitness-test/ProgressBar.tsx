import { Progress } from "@/components/ui/progress";

export function TestProgressBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="space-y-2">
      <div className="text-sm text-stone-500">Question {current} of {total}</div>
      <Progress value={(current / total) * 100} />
    </div>
  );
}
