const steps = [
  ["Take the Free Fitness Test", "Answer 20 questions to uncover your level, risk, and primary goal."],
  ["Get Your Family Plan", "We tailor home workouts, Indian meals, and condition-specific guidance for each member."],
  ["Track Together & Win", "Log meals, workouts, and habits daily to raise your Family Health Score."]
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-10 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">How It Works</p>
        <h2 className="mt-2 text-3xl font-bold">Simple enough for busy homes. Powerful enough to create momentum.</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map(([title, text], index) => (
          <div key={title} className="rounded-lg border bg-white p-6 shadow-soft">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-lg font-semibold text-white">{index + 1}</div>
            <h3 className="text-xl font-semibold">{title}</h3>
            <p className="mt-3 text-sm text-stone-600">{text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
