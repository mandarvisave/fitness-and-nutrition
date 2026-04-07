"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { MealType } from "@/lib/store/useFoodLogStore";

export type FoodSearchResult = {
  id: string;
  name: string;
  calories_kcal: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  serving_label: string | null;
  serving_grams: number | null;
};

export type FoodLogModalMode = "add" | "edit";

export function FoodLogModal(props: {
  open: boolean;
  mode: FoodLogModalMode;
  food: FoodSearchResult | null;
  initialMeal?: MealType;
  initialServingLabel?: string;
  initialServingGrams?: number;
  initialQuantity?: number;
  onClose: () => void;
  onConfirm: (payload: { meal: MealType; servingLabel: string; servingGrams: number; quantity: number }) => void;
}) {
  const {
    open,
    mode,
    food,
    initialMeal = "breakfast",
    initialServingLabel,
    initialServingGrams,
    initialQuantity,
    onClose,
    onConfirm
  } = props;

  const [meal, setMeal] = useState<MealType>(initialMeal);
  const [servingLabel, setServingLabel] = useState(initialServingLabel ?? food?.serving_label ?? "100 g");
  const [servingGrams, setServingGrams] = useState<number>(initialServingGrams ?? food?.serving_grams ?? 100);
  const [quantity, setQuantity] = useState<number>(initialQuantity ?? 1);

  useEffect(() => {
    if (!open) return;
    setMeal(initialMeal);
    setServingLabel(initialServingLabel ?? food?.serving_label ?? "100 g");
    setServingGrams(initialServingGrams ?? food?.serving_grams ?? 100);
    setQuantity(initialQuantity ?? 1);
  }, [open, initialMeal, initialServingLabel, initialServingGrams, initialQuantity, food]);

  const perServing = useMemo(() => {
    const scale = (servingGrams ?? 100) / (food?.serving_grams ?? 100);
    const calories = (food?.calories_kcal ?? 0) * scale;
    const protein = (food?.protein_g ?? 0) * scale;
    const carbs = (food?.carbs_g ?? 0) * scale;
    const fat = (food?.fat_g ?? 0) * scale;
    return { calories, protein, carbs, fat };
  }, [food, servingGrams]);

  const total = useMemo(() => {
    const q = Number(quantity) || 1;
    return {
      calories: perServing.calories * q,
      protein: perServing.protein * q,
      carbs: perServing.carbs * q,
      fat: perServing.fat * q
    };
  }, [perServing, quantity]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open || !food) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <Card className="w-full max-w-xl p-5 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-stone-950">{food.name}</div>
            <div className="mt-1 text-sm text-stone-600">
              {food.calories_kcal == null ? "Nutrition unknown in dataset (you can still log it)." : "Nutrition from dataset."}
            </div>
          </div>
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-sm font-medium text-stone-700">Meal</div>
            <select value={meal} onChange={(e) => setMeal(e.target.value as MealType)} className="h-11 w-full rounded-md border bg-white px-4 text-sm">
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snacks">Snacks</option>
            </select>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-stone-700">Quantity</div>
            <Input type="number" min={0.25} step={0.25} value={quantity} onChange={(e) => setQuantity(Number(e.target.value))} />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-stone-700">Serving label</div>
            <Input value={servingLabel} onChange={(e) => setServingLabel(e.target.value)} placeholder="e.g., 1 bowl" />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-stone-700">Serving grams</div>
            <Input type="number" min={1} step={1} value={servingGrams} onChange={(e) => setServingGrams(Number(e.target.value))} />
          </div>
        </div>

        <div className="mt-4 rounded-lg border bg-stone-50 p-4 text-sm text-stone-700">
          <div className="font-medium text-stone-900">Totals for this log</div>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div><span className="text-stone-500">Calories</span><div className="font-semibold">{Math.round(total.calories)} kcal</div></div>
            <div><span className="text-stone-500">Protein</span><div className="font-semibold">{total.protein.toFixed(1)} g</div></div>
            <div><span className="text-stone-500">Carbs</span><div className="font-semibold">{total.carbs.toFixed(1)} g</div></div>
            <div><span className="text-stone-500">Fat</span><div className="font-semibold">{total.fat.toFixed(1)} g</div></div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button
            onClick={() => onConfirm({ meal, servingLabel: servingLabel || "Serving", servingGrams: Number(servingGrams) || 100, quantity: Number(quantity) || 1 })}
          >
            {mode === "edit" ? "Save changes" : "Add to diary"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
