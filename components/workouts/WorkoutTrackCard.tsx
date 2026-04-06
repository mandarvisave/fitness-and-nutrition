import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkoutTrackDetail } from "@/lib/workout-plans";

export function WorkoutTrackCard({ track }: { track: WorkoutTrackDetail }) {
  return (
    <Card className="border-stone-200 bg-white/95">
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex w-fit rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
            {track.kind === "goal" ? "Goal plan" : "Lifestyle track"}
          </span>
          <span className="text-sm font-medium text-stone-500">{track.weeks}</span>
        </div>
        <CardTitle className="text-xl">{track.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-stone-600">{track.description}</p>
        <div className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-700">
          <div className="font-semibold text-stone-900">Best for</div>
          <p className="mt-1">{track.bestFor}</p>
        </div>
        <div className="space-y-2 text-sm text-stone-600">
          {track.highlights.slice(0, 2).map((highlight) => (
            <div key={highlight} className="flex gap-2">
              <span className="mt-0.5 text-orange-600">•</span>
              <span>{highlight}</span>
            </div>
          ))}
        </div>
        <Button asChild variant="secondary">
          <Link href={`/workouts/${track.slug}`}>View Plan</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
