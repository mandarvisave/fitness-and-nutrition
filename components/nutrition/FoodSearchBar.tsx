"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { FoodLogModal, type FoodSearchResult } from "@/components/nutrition/FoodLogModal";
import { useFoodLogStore } from "@/lib/store/useFoodLogStore";

export function FoodSearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<FoodSearchResult | null>(null);
  const addEntry = useFoodLogStore((s) => s.addEntry);
  const abortRef = useRef<AbortController | null>(null);

  const showDropdown = useMemo(() => query.trim().length >= 2 && (loading || results.length > 0), [query, loading, results.length]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setLoading(false);
      abortRef.current?.abort();
      abortRef.current = null;
      return;
    }

    setLoading(true);
    const controller = new AbortController();
    abortRef.current?.abort();
    abortRef.current = controller;

    const handle = setTimeout(async () => {
      try {
        const response = await fetch(`/api/foods/search?q=${encodeURIComponent(q)}&limit=15`, {
          signal: controller.signal
        });
        const data = (await response.json()) as { results: FoodSearchResult[] };
        setResults(Array.isArray(data.results) ? data.results : []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 120);

    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div className="relative">
      <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search foods, e.g. idli, rajma, poha" />

      {showDropdown ? (
        <Card className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-40 overflow-hidden border bg-white shadow-soft">
          <div className="max-h-72 overflow-auto">
            {loading ? (
              <div className="px-4 py-3 text-sm text-stone-500">Searching...</div>
            ) : results.length === 0 ? (
              <div className="px-4 py-3 text-sm text-stone-500">No results.</div>
            ) : (
              results.map((food) => (
                <button
                  key={food.id}
                  className="flex w-full items-center justify-between gap-4 border-b px-4 py-3 text-left text-sm hover:bg-muted"
                  onClick={() => {
                    setSelected(food);
                    setOpen(true);
                  }}
                >
                  <div className="font-medium text-stone-900">{food.name}</div>
                  <div className="shrink-0 text-xs text-stone-600">
                    {food.calories_kcal == null ? "—" : `${Math.round(food.calories_kcal)} kcal`} · P {food.protein_g ?? "—"} · C {food.carbs_g ?? "—"} · F {food.fat_g ?? "—"}
                  </div>
                </button>
              ))
            )}
          </div>
        </Card>
      ) : null}

      <FoodLogModal
        open={open}
        mode="add"
        food={selected}
        onClose={() => setOpen(false)}
        onConfirm={({ meal, servingLabel, servingGrams, quantity }) => {
          const scale = servingGrams / (selected?.serving_grams ?? 100);
          const perServing = {
            calories_kcal: (selected?.calories_kcal ?? 0) * scale,
            protein_g: (selected?.protein_g ?? 0) * scale,
            carbs_g: (selected?.carbs_g ?? 0) * scale,
            fat_g: (selected?.fat_g ?? 0) * scale
          };
          const q = Number(quantity) || 1;
          addEntry({
            foodId: selected?.id ?? "unknown",
            name: selected?.name ?? "Food",
            meal,
            servingLabel,
            servingGrams,
            quantity: q,
            macros: {
              calories_kcal: perServing.calories_kcal * q,
              protein_g: perServing.protein_g * q,
              carbs_g: perServing.carbs_g * q,
              fat_g: perServing.fat_g * q
            }
          });
          setOpen(false);
          setQuery("");
          setResults([]);
        }}
      />
    </div>
  );
}
