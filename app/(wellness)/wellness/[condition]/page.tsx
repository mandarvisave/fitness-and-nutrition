export default function ConditionPage({ params }: { params: { condition: string } }) {
  return <main className="mx-auto max-w-4xl px-4 py-10"><div className="rounded-lg border bg-white p-6 shadow-soft">Guidance for <span className="font-semibold capitalize">{params.condition.replace("_", " ")}</span>: gentle movement, meal suggestions, and adherence tips.</div></main>;
}
