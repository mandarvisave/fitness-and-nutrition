"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type WaterEntry = { amount: number; unit: "ml"; timestamp: string };
export type SleepEntry = { bedtime: string; waketime: string; hours: number; quality: number; notes?: string };
export type WorkoutEntry = {
  type: "Cardio" | "Strength" | "Sports";
  name: string;
  duration: number;
  intensity: "Light" | "Moderate" | "Vigorous";
  calories: number;
  notes?: string;
  timestamp: string;
};

export type DailyWellnessLog = {
  userId: string;
  date: string;
  water: WaterEntry[];
  sleep: SleepEntry | null;
  workouts: WorkoutEntry[];
};

type WellnessStore = {
  logsByDate: Record<string, DailyWellnessLog>;
  upsertWater: (date: string, userId: string, entry: WaterEntry) => void;
  updateWater: (date: string, index: number, entry: WaterEntry) => void;
  deleteWater: (date: string, index: number) => void;
  upsertSleep: (date: string, userId: string, sleep: SleepEntry) => void;
  clearSleep: (date: string) => void;
  addWorkout: (date: string, userId: string, workout: WorkoutEntry) => void;
  updateWorkout: (date: string, index: number, workout: WorkoutEntry) => void;
  deleteWorkout: (date: string, index: number) => void;
  copyDateLog: (sourceDate: string, targetDate: string, userId: string, replaceTarget?: boolean) => void;
};

function createEmptyLog(date: string, userId: string): DailyWellnessLog {
  return { userId, date, water: [], sleep: null, workouts: [] };
}

export function getDateKey(d = new Date()) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const useWellnessLogsStore = create<WellnessStore>()(
  persist(
    (set) => ({
      logsByDate: {},
      upsertWater: (date, userId, entry) =>
        set((state) => {
          const existing = state.logsByDate[date] ?? createEmptyLog(date, userId);
          return {
            logsByDate: {
              ...state.logsByDate,
              [date]: { ...existing, userId, water: [...existing.water, entry] }
            }
          };
        }),
      updateWater: (date, index, entry) =>
        set((state) => {
          const existing = state.logsByDate[date];
          if (!existing) return state;
          const next = [...existing.water];
          next[index] = entry;
          return {
            logsByDate: {
              ...state.logsByDate,
              [date]: { ...existing, water: next }
            }
          };
        }),
      deleteWater: (date, index) =>
        set((state) => {
          const existing = state.logsByDate[date];
          if (!existing) return state;
          return {
            logsByDate: {
              ...state.logsByDate,
              [date]: { ...existing, water: existing.water.filter((_, i) => i !== index) }
            }
          };
        }),
      upsertSleep: (date, userId, sleep) =>
        set((state) => {
          const existing = state.logsByDate[date] ?? createEmptyLog(date, userId);
          return {
            logsByDate: {
              ...state.logsByDate,
              [date]: { ...existing, userId, sleep }
            }
          };
        }),
      clearSleep: (date) =>
        set((state) => {
          const existing = state.logsByDate[date];
          if (!existing) return state;
          return {
            logsByDate: {
              ...state.logsByDate,
              [date]: { ...existing, sleep: null }
            }
          };
        }),
      addWorkout: (date, userId, workout) =>
        set((state) => {
          const existing = state.logsByDate[date] ?? createEmptyLog(date, userId);
          return {
            logsByDate: {
              ...state.logsByDate,
              [date]: { ...existing, userId, workouts: [...existing.workouts, workout] }
            }
          };
        }),
      updateWorkout: (date, index, workout) =>
        set((state) => {
          const existing = state.logsByDate[date];
          if (!existing) return state;
          const next = [...existing.workouts];
          next[index] = workout;
          return {
            logsByDate: { ...state.logsByDate, [date]: { ...existing, workouts: next } }
          };
        }),
      deleteWorkout: (date, index) =>
        set((state) => {
          const existing = state.logsByDate[date];
          if (!existing) return state;
          return {
            logsByDate: {
              ...state.logsByDate,
              [date]: { ...existing, workouts: existing.workouts.filter((_, i) => i !== index) }
            }
          };
        }),
      copyDateLog: (sourceDate, targetDate, userId, replaceTarget = true) =>
        set((state) => {
          const source = state.logsByDate[sourceDate];
          if (!source) return state;

          const nextLogs = { ...state.logsByDate };
          if (replaceTarget || !nextLogs[targetDate]) {
            nextLogs[targetDate] = {
              userId,
              date: targetDate,
              water: source.water.map((entry) => ({ ...entry, timestamp: new Date().toISOString() })),
              sleep: source.sleep ? { ...source.sleep } : null,
              workouts: source.workouts.map((w) => ({ ...w, timestamp: new Date().toISOString() }))
            };
          }

          return { logsByDate: nextLogs };
        })
    }),
    { name: "fitfamily-wellness-logs", storage: createJSONStorage(() => localStorage) }
  )
);
