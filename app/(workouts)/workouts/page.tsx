import { Sidebar } from "@/components/layout/Sidebar";
import { WorkoutTrackCard } from "@/components/workouts/WorkoutTrackCard";
import { Button } from "@/components/ui/button";
import { goalWorkoutTracks, lifestyleWorkoutTracks, workoutTrackMap } from "@/lib/workout-plans";
import Link from "next/link";

export default function WorkoutsPage() {
  const bodyRecompositionPlan = workoutTrackMap["body-recomposition"];

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-6 pb-24 sm:px-6">
        <section className="overflow-hidden rounded-[2rem] border border-stone-200 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.24),_transparent_35%),linear-gradient(135deg,_#fff7ed,_#ffffff_55%,_#f5f5f4)] p-6 shadow-soft sm:p-8">
          <div className="max-w-3xl">
            <span className="inline-flex rounded-full bg-white px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-orange-700 shadow-soft">
              Goal-based workout menu
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">Pick a workout plan that matches the result you actually want.</h1>
            <p className="mt-3 text-base text-stone-600 sm:text-lg">
              The workout menu is now organized by fitness goal so users can jump straight into weight loss, muscle gain, general fitness, energy boost, or body recomposition plans.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-stone-950">Goal workout menu</h2>
            <p className="mt-2 text-stone-600">Each plan includes a clear training focus, weekly structure, and at-home progression path.</p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {goalWorkoutTracks.map((track) => <WorkoutTrackCard key={track.slug} track={track} />)}
          </div>
        </section>

        <section className="grid gap-6 overflow-hidden rounded-[2rem] border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6 shadow-soft lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <span className="inline-flex rounded-full bg-orange-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
              New section
            </span>
            <h2 className="mt-4 text-2xl font-bold text-stone-950 sm:text-3xl">Body recomposition plan</h2>
            <p className="mt-3 text-stone-600">
              This new section is built for users who want to lose fat and gain muscle together. It combines strength-first training, strategic finishers, and recovery support so the plan feels more athletic than a typical weight-loss routine.
            </p>
            <div className="mt-5 grid gap-3 text-sm text-stone-700 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 shadow-soft">
                <div className="font-semibold text-stone-950">Ideal goal</div>
                <p className="mt-1">{bodyRecompositionPlan.goal}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-soft">
                <div className="font-semibold text-stone-950">Weekly split</div>
                <p className="mt-1">{bodyRecompositionPlan.schedule}</p>
              </div>
            </div>
            <Button asChild className="mt-6">
              <Link href="/workouts/body-recomposition">Explore Body Recomposition</Link>
            </Button>
          </div>
          <div className="space-y-3 rounded-[1.5rem] bg-stone-950 p-5 text-stone-100">
            <div className="text-sm uppercase tracking-[0.2em] text-orange-300">Why it works</div>
            {bodyRecompositionPlan.highlights.map((highlight) => (
              <div key={highlight} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6">
                {highlight}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-stone-950">Supportive lifestyle tracks</h2>
            <p className="mt-2 text-stone-600">These options help families build consistency around the main goal-based plans.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {lifestyleWorkoutTracks.map((track) => <WorkoutTrackCard key={track.slug} track={track} />)}
          </div>
        </section>
      </main>
    </div>
  );
}
