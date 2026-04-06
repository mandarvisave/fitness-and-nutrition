import { pillars } from "@/lib/site-data";

export function SolutionSection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">Meet FitFamily India</p>
            <h2 className="mt-2 text-3xl font-bold">One scorecard for the whole household.</h2>
            <p className="mt-4 text-stone-600">Our 7-pillar Family Health Score turns workouts, meals, sleep, water, and shared routines into one simple number that every generation can understand.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {pillars.map((pillar) => (
              <div key={pillar.label} className="rounded-lg border bg-background p-4 shadow-soft">
                <div className="text-sm text-stone-500">{pillar.label}</div>
                <div className="mt-2 text-2xl font-semibold">{pillar.score}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
