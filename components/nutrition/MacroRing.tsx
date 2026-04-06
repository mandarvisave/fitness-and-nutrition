export function MacroRing() {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-soft">
      <div className="text-sm text-stone-500">Macro split</div>
      <div className="mt-3 grid grid-cols-3 gap-3 text-center text-sm">
        <div className="rounded-lg bg-orange-50 p-3">Protein 28%</div>
        <div className="rounded-lg bg-green-50 p-3">Carbs 46%</div>
        <div className="rounded-lg bg-blue-50 p-3">Fat 26%</div>
      </div>
    </div>
  );
}
