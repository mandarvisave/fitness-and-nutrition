export function ExerciseCard({ name, details }: { name: string; details: string }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-soft">
      <div className="font-semibold">{name}</div>
      <p className="mt-2 text-sm text-stone-600">{details}</p>
    </div>
  );
}
