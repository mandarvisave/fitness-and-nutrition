import { notFound } from "next/navigation";
import { ExerciseCard } from "@/components/workouts/ExerciseCard";
import { workoutTrackMap } from "@/lib/workout-plans";

export default function WorkoutTrackDetailPage({ params }: { params: { track: string } }) {
  const track = workoutTrackMap[params.track as keyof typeof workoutTrackMap];

  if (!track) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">
      <section className="rounded-[2rem] border border-stone-200 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.18),_transparent_34%),linear-gradient(180deg,_#ffffff,_#fafaf9)] p-6 shadow-soft sm:p-8">
        <div className="max-w-3xl">
          <span className="inline-flex rounded-full bg-orange-100 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
            {track.weeks}
          </span>
          <h1 className="mt-4 text-3xl font-bold text-stone-950 sm:text-4xl">{track.title}</h1>
          <p className="mt-3 text-lg text-stone-600">{track.description}</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-white p-4 shadow-soft">
            <div className="text-sm font-semibold text-stone-950">Goal</div>
            <p className="mt-2 text-sm text-stone-600">{track.goal}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-soft">
            <div className="text-sm font-semibold text-stone-950">Best for</div>
            <p className="mt-2 text-sm text-stone-600">{track.bestFor}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-soft">
            <div className="text-sm font-semibold text-stone-950">Weekly schedule</div>
            <p className="mt-2 text-sm text-stone-600">{track.schedule}</p>
          </div>
          <div className="rounded-2xl bg-white p-4 shadow-soft">
            <div className="text-sm font-semibold text-stone-950">Equipment</div>
            <p className="mt-2 text-sm text-stone-600">{track.equipment}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-semibold text-stone-950">What this plan emphasizes</h2>
          <div className="mt-4 space-y-3">
            {track.highlights.map((highlight) => (
              <div key={highlight} className="rounded-2xl bg-stone-50 p-4 text-sm leading-6 text-stone-700">
                {highlight}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-stone-950">Workout menu</h2>
          {track.plans.map((plan) => (
            <ExerciseCard key={plan.name} name={plan.name} details={`${plan.focus}. Duration: ${plan.duration}. Level: ${plan.level}.`} />
          ))}
        </div>
      </section>
    </main>
  );
}
