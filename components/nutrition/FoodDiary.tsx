"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FoodLogModal, type FoodSearchResult } from "@/components/nutrition/FoodLogModal";
import { round1, sumMacros, useFoodLogStore, type LoggedFood, type MealType } from "@/lib/store/useFoodLogStore";
import { useMemo, useState } from "react";

export function FoodDiary() {
  const entries = useFoodLogStore((s) => s.entries);
  const deleteEntry = useFoodLogStore((s) => s.deleteEntry);
  const updateEntry = useFoodLogStore((s) => s.updateEntry);
  const clearAll = useFoodLogStore((s) => s.clearAll);

  const [editing, setEditing] = useState<LoggedFood | null>(null);

  const grouped = useMemo(() => {
    const meals: Record<MealType, LoggedFood[]> = { breakfast: [], lunch: [], dinner: [], snacks: [] };
    for (const entry of entries) meals[entry.meal].push(entry);
    return meals;
  }, [entries]);

  const totals = useMemo(() => sumMacros(entries), [entries]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Today&apos;s Diary</CardTitle>
            <div className="mt-1 text-sm text-stone-600">
              {Math.round(totals.calories_kcal)} kcal · P {round1(totals.protein_g)} g · C {round1(totals.carbs_g)} g · F {round1(totals.fat_g)} g
            </div>
          </div>
          <Button variant="secondary" onClick={clearAll} disabled={entries.length === 0}>
            Clear
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {(["breakfast", "lunch", "dinner", "snacks"] as MealType[]).map((meal) => {
          const items = grouped[meal];
          const mealTotals = sumMacros(items);
          return (
            <div key={meal} className="rounded-xl border bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold capitalize text-stone-950">{meal}</div>
                <div className="text-xs text-stone-600">
                  {Math.round(mealTotals.calories_kcal)} kcal · P {round1(mealTotals.protein_g)} · C {round1(mealTotals.carbs_g)} · F {round1(mealTotals.fat_g)}
                </div>
              </div>

              {items.length === 0 ? (
                <div className="mt-3 text-sm text-stone-500">No foods logged.</div>
              ) : (
                <div className="mt-3 space-y-2">
                  {items.map((entry) => (
                    <div key={entry.id} className="flex flex-col gap-2 rounded-lg bg-muted p-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="font-medium text-stone-900">{entry.name}</div>
                        <div className="text-xs text-stone-600">
                          {entry.quantity} × {entry.servingLabel} ({entry.servingGrams}g)
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <div className="text-xs text-stone-700">
                          <span className="font-semibold">{Math.round(entry.macros.calories_kcal)}</span> kcal · P {round1(entry.macros.protein_g)} · C {round1(entry.macros.carbs_g)} · F {round1(entry.macros.fat_g)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="secondary" onClick={() => setEditing(entry)}>Edit</Button>
                          <Button variant="secondary" onClick={() => deleteEntry(entry.id)}>Delete</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </CardContent>

      <FoodLogModal
        open={Boolean(editing)}
        mode="edit"
        food={
          editing
            ? ({
                id: editing.foodId,
                name: editing.name,
                calories_kcal: null,
                protein_g: null,
                carbs_g: null,
                fat_g: null,
                serving_label: editing.servingLabel,
                serving_grams: editing.servingGrams
              } satisfies FoodSearchResult)
            : null
        }
        initialMeal={editing?.meal}
        initialServingLabel={editing?.servingLabel}
        initialServingGrams={editing?.servingGrams}
        initialQuantity={editing?.quantity}
        onClose={() => setEditing(null)}
        onConfirm={({ meal, servingLabel, servingGrams, quantity }) => {
          if (!editing) return;
          const q = Number(quantity) || 1;
          const perUnitScale = servingGrams / (editing.servingGrams || 100);
          const perUnit = {
            calories_kcal: (editing.macros.calories_kcal / (editing.quantity || 1)) * perUnitScale,
            protein_g: (editing.macros.protein_g / (editing.quantity || 1)) * perUnitScale,
            carbs_g: (editing.macros.carbs_g / (editing.quantity || 1)) * perUnitScale,
            fat_g: (editing.macros.fat_g / (editing.quantity || 1)) * perUnitScale
          };
          updateEntry(editing.id, {
            meal,
            servingLabel,
            servingGrams,
            quantity: q,
            macros: {
              calories_kcal: perUnit.calories_kcal * q,
              protein_g: perUnit.protein_g * q,
              carbs_g: perUnit.carbs_g * q,
              fat_g: perUnit.fat_g * q
            }
          });
          setEditing(null);
        }}
      />
    </Card>
  );
}
