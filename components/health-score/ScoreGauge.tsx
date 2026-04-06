import { getFHSLevel } from "@/lib/scoring/calculateFHS";

export function ScoreGauge({ score }: { score: number }) {
  const meta = getFHSLevel(score);
  return (
    <div className="rounded-[28px] border bg-white p-8 shadow-soft">
      <div className="mx-auto flex h-52 w-52 items-center justify-center rounded-full border-[18px] border-secondary/20 bg-green-50">
        <div className="text-center">
          <div className="text-6xl font-bold text-secondary">{score}</div>
          <div className="mt-2 text-sm text-stone-500">{meta.level}</div>
        </div>
      </div>
      <p className="mt-6 text-center text-sm text-stone-600">{meta.message}</p>
    </div>
  );
}
