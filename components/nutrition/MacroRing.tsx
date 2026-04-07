"use client";

import { useMemo } from "react";
import { getEntriesWithKnownNutrition, round1, sumMacros, todayKey, useFoodLogStore } from "@/lib/store/useFoodLogStore";

export function MacroRing() {
  const entries = useFoodLogStore((s) => s.entries);
  const totals = useMemo(() => {
    const today = todayKey();
    const todaysEntries = entries.filter((entry) => entry.date ? entry.date === today : entry.createdAt.slice(0, 10) === today);
    return sumMacros(getEntriesWithKnownNutrition(todaysEntries));
  }, [entries]);
  const grams = totals.protein_g + totals.carbs_g + totals.fat_g;
  const proteinPct = grams > 0 ? Math.round((totals.protein_g / grams) * 100) : 0;
  const carbsPct = grams > 0 ? Math.round((totals.carbs_g / grams) * 100) : 0;
  const fatPct = grams > 0 ? Math.round((totals.fat_g / grams) * 100) : 0;

  return (
    <div className="rounded-lg border bg-white p-5 shadow-soft">
      <div className="text-sm text-stone-500">Macro split</div>
      <div className="mt-2 text-sm text-stone-700">
        <span className="font-semibold">{Math.round(totals.calories_kcal)}</span> kcal · P {round1(totals.protein_g)} g · C {round1(totals.carbs_g)} g · F {round1(totals.fat_g)} g
      </div>
      <div className="mt-3 grid grid-cols-3 gap-3 text-center text-sm">
        <div className="rounded-lg bg-orange-50 p-3">Protein {proteinPct}%</div>
        <div className="rounded-lg bg-green-50 p-3">Carbs {carbsPct}%</div>
        <div className="rounded-lg bg-blue-50 p-3">Fat {fatPct}%</div>
      </div>
    </div>
  );
}
