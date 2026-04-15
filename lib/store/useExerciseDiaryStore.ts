import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";

export interface CardioExerciseLog {
  id: string;
  name: string;
  minutes: number;
  calories: number;
}

export interface StrengthSet {
  id: string;
  reps: number;
  weight: number;
}

export interface StrengthExerciseLog {
  id: string;
  name: string;
  trackingSets: StrengthSet[];
}

export interface DailyExerciseData {
  cardio: CardioExerciseLog[];
  strength: StrengthExerciseLog[];
  notes: string;
}

interface ExerciseDiaryState {
  dates: Record<string, DailyExerciseData>;
  dailyGoalMinutes: number;
  weeklyGoalMinutes: number;
  
  // Actions
  addCardio: (date: string, exercise: Omit<CardioExerciseLog, "id">) => void;
  removeCardio: (date: string, id: string) => void;
  addStrength: (date: string, exercise: Omit<StrengthExerciseLog, "id">) => void;
  removeStrength: (date: string, id: string) => void;
  updateNotes: (date: string, notes: string) => void;
  copyWorkout: (sourceDate: string, targetDate: string) => void;
  getRecentCardio: () => CardioExerciseLog[];
  getRecentStrength: () => StrengthExerciseLog[];
}

const defaultDailyData: DailyExerciseData = {
  cardio: [],
  strength: [],
  notes: ""
};

export const useExerciseDiaryStore = create<ExerciseDiaryState>()(
  persist(
    (set, get) => ({
      dates: {},
      dailyGoalMinutes: 75,
      weeklyGoalMinutes: 375,

      addCardio: (date, exercise) => set((state) => {
        const currentData = state.dates[date] || { ...defaultDailyData };
        return {
          dates: {
            ...state.dates,
            [date]: {
              ...currentData,
              cardio: [...currentData.cardio, { ...exercise, id: uuidv4() }]
            }
          }
        };
      }),

      removeCardio: (date, id) => set((state) => {
        const currentData = state.dates[date];
        if (!currentData) return state;
        return {
          dates: {
            ...state.dates,
            [date]: {
              ...currentData,
              cardio: currentData.cardio.filter((ex) => ex.id !== id)
            }
          }
        };
      }),

      addStrength: (date, exercise) => set((state) => {
        const currentData = state.dates[date] || { ...defaultDailyData };
        return {
          dates: {
            ...state.dates,
            [date]: {
              ...currentData,
              strength: [...currentData.strength, { ...exercise, id: uuidv4() }]
            }
          }
        };
      }),

      removeStrength: (date, id) => set((state) => {
        const currentData = state.dates[date];
        if (!currentData) return state;
        return {
          dates: {
            ...state.dates,
            [date]: {
              ...currentData,
              strength: currentData.strength.filter((ex) => ex.id !== id)
            }
          }
        };
      }),

      updateNotes: (date, notes) => set((state) => {
        const currentData = state.dates[date] || { ...defaultDailyData };
        return {
          dates: {
            ...state.dates,
            [date]: { ...currentData, notes }
          }
        };
      }),

      copyWorkout: (sourceDate, targetDate) => set((state) => {
        const sourceData = state.dates[sourceDate];
        if (!sourceData) return state;
        
        const targetData = state.dates[targetDate] || { ...defaultDailyData };
        
        // Map to new IDs to prevent dupes
        const newCardio = sourceData.cardio.map(c => ({ ...c, id: uuidv4() }));
        const newStrength = sourceData.strength.map(s => ({ ...s, id: uuidv4() }));

        return {
          dates: {
            ...state.dates,
            [targetDate]: {
              ...targetData,
              cardio: [...targetData.cardio, ...newCardio],
              strength: [...targetData.strength, ...newStrength]
            }
          }
        };
      }),

      getRecentCardio: () => {
        const state = get();
        const allCardio = Object.values(state.dates).flatMap(d => d.cardio);
        // De-duplicate by name, keep most recent. (Since Record keys order is approx chronological, this is a simple approximation. For true recency, we'd sort by date)
        const unique = new Map<string, CardioExerciseLog>();
        allCardio.forEach(c => unique.set(c.name, c));
        return Array.from(unique.values()).reverse().slice(0, 10);
      },

      getRecentStrength: () => {
        const state = get();
        const allStrength = Object.values(state.dates).flatMap(d => d.strength);
        const unique = new Map<string, StrengthExerciseLog>();
        allStrength.forEach(c => unique.set(c.name, c));
        return Array.from(unique.values()).reverse().slice(0, 10);
      }
    }),
    {
      name: "fitfamily-exercise-diary"
    }
  )
);
