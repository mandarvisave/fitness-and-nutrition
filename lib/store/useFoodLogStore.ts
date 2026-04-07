"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type MealType = "breakfast" | "lunch" | "dinner" | "snacks";

export type FoodMacros = {
  calories_kcal: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
};

export type LoggedFood = {
  id: string;
  foodId: string;
  date: string;
  name: string;
  hasNutrition?: boolean;
  nutritionSource?: "verified" | "inferred";
  nutritionConfidence?: "high" | "medium" | "low";
  meal: MealType;
  servingLabel: string;
  servingGrams: number;
  quantity: number;
  macros: FoodMacros;
  createdAt: string;
};

type FoodLogState = {
  dateKey: string;
  entries: LoggedFood[];
  setDateKey: (dateKey: string) => void;
  addEntry: (entry: Omit<LoggedFood, "id" | "createdAt" | "date"> & { date?: string }) => void;
  updateEntry: (id: string, patch: Partial<Omit<LoggedFood, "id" | "createdAt">>) => void;
  deleteEntry: (id: string) => void;
  clearAll: () => void;
  clearByDate: (date: string) => void;
  copyDateEntries: (sourceDate: string, targetDate: string, replaceTarget?: boolean) => void;
};

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function todayKey() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function round1(n: number) {
  return Math.round(n * 10) / 10;
}

export function sumMacros(items: Array<{ macros: FoodMacros }>): FoodMacros {
  return items.reduce(
    (acc, item) => ({
      calories_kcal: acc.calories_kcal + item.macros.calories_kcal,
      protein_g: acc.protein_g + item.macros.protein_g,
      carbs_g: acc.carbs_g + item.macros.carbs_g,
      fat_g: acc.fat_g + item.macros.fat_g
    }),
    { calories_kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  );
}

export function getEntriesWithKnownNutrition<T extends { hasNutrition?: boolean }>(items: T[]) {
  return items.filter((item) => item.hasNutrition !== false);
}

export const useFoodLogStore = create<FoodLogState>()(
  persist(
    (set, get) => ({
      dateKey: todayKey(),
      entries: [],
      setDateKey: (dateKey) => set({ dateKey }),
      addEntry: (entry) =>
        set((state) => ({
          entries: [
            ...state.entries,
            {
              ...entry,
              date: entry.date ?? state.dateKey ?? todayKey(),
              id: uid(),
              createdAt: new Date().toISOString()
            }
          ]
        })),
      updateEntry: (id, patch) =>
        set((state) => ({
          entries: state.entries.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry))
        })),
      deleteEntry: (id) => set((state) => ({ entries: state.entries.filter((e) => e.id !== id) })),
      clearAll: () => set({ entries: [] }),
      clearByDate: (date) => set((state) => ({ entries: state.entries.filter((e) => e.date !== date) })),
      copyDateEntries: (sourceDate, targetDate, replaceTarget = false) =>
        set((state) => {
          const sourceEntries = state.entries.filter((entry) => entry.date === sourceDate);
          if (sourceEntries.length === 0) return state;

          const targetKept = replaceTarget ? state.entries.filter((entry) => entry.date !== targetDate) : state.entries;
          const cloned = sourceEntries.map((entry) => ({
            ...entry,
            id: uid(),
            date: targetDate,
            createdAt: new Date().toISOString()
          }));
          return { entries: [...targetKept, ...cloned] };
        })
    }),
    {
      name: "fitfamily-food-log",
      storage: createJSONStorage(() => localStorage)
    }
  )
);
