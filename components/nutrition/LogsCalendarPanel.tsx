"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FoodLogModal, type FoodSearchResult } from "@/components/nutrition/FoodLogModal";
import { sumMacros, useFoodLogStore, type LoggedFood, type MealType } from "@/lib/store/useFoodLogStore";
import { getDateKey, useWellnessLogsStore, type SleepEntry, type WaterEntry, type WorkoutEntry } from "@/lib/store/useWellnessLogsStore";

type ViewMode = "month" | "week";
type UndoPayload =
  | { kind: "meal"; entry: LoggedFood }
  | { kind: "water"; date: string; entry: WaterEntry }
  | { kind: "workout"; date: string; entry: WorkoutEntry }
  | { kind: "sleep"; date: string; entry: SleepEntry };

function toDateKey(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function parseDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function addDays(key: string, days: number) {
  const d = parseDateKey(key);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

function formatDateLabel(key: string) {
  return parseDateKey(key).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

function parseDemoUser() {
  if (typeof document === "undefined") return "local-user";
  const cookie = document.cookie.split("; ").find((c) => c.startsWith("fitfamily-demo-user="));
  if (!cookie) return "local-user";
  try {
    const parsed = JSON.parse(decodeURIComponent(cookie.split("=")[1])) as { email?: string };
    return parsed.email ?? "local-user";
  } catch {
    return "local-user";
  }
}

function buildMonthGrid(selectedDate: string) {
  const base = parseDateKey(selectedDate);
  const first = new Date(base.getFullYear(), base.getMonth(), 1);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());

  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

async function searchFoods(query: string) {
  const response = await fetch(`/api/foods/search?q=${encodeURIComponent(query)}&limit=10`);
  const data = (await response.json()) as { results: FoodSearchResult[] };
  return Array.isArray(data.results) ? data.results : [];
}

export function LogsCalendarPanel() {
  const [selectedDate, setSelectedDate] = useState(getDateKey());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [monthValue, setMonthValue] = useState(selectedDate.slice(0, 7));
  const [undo, setUndo] = useState<UndoPayload | null>(null);
  const [copyFromDate, setCopyFromDate] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const mealEntries = useFoodLogStore((s) => s.entries);
  const addMealEntry = useFoodLogStore((s) => s.addEntry);
  const updateMealEntry = useFoodLogStore((s) => s.updateEntry);
  const deleteMealEntry = useFoodLogStore((s) => s.deleteEntry);
  const copyMealDateEntries = useFoodLogStore((s) => s.copyDateEntries);

  const logsByDate = useWellnessLogsStore((s) => s.logsByDate);
  const upsertWater = useWellnessLogsStore((s) => s.upsertWater);
  const updateWater = useWellnessLogsStore((s) => s.updateWater);
  const deleteWater = useWellnessLogsStore((s) => s.deleteWater);
  const upsertSleep = useWellnessLogsStore((s) => s.upsertSleep);
  const clearSleep = useWellnessLogsStore((s) => s.clearSleep);
  const addWorkout = useWellnessLogsStore((s) => s.addWorkout);
  const updateWorkout = useWellnessLogsStore((s) => s.updateWorkout);
  const deleteWorkout = useWellnessLogsStore((s) => s.deleteWorkout);
  const copyDateLog = useWellnessLogsStore((s) => s.copyDateLog);

  const [mealQuery, setMealQuery] = useState("");
  const [mealResults, setMealResults] = useState<FoodSearchResult[]>([]);
  const [mealLoading, setMealLoading] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodSearchResult | null>(null);
  const [editingMeal, setEditingMeal] = useState<LoggedFood | null>(null);
  const [sleepEdit, setSleepEdit] = useState<SleepEntry | null>(null);
  const [waterEdit, setWaterEdit] = useState<{ index: number; amount: number } | null>(null);
  const [workoutEdit, setWorkoutEdit] = useState<{ index: number; entry: WorkoutEntry } | null>(null);

  const userId = parseDemoUser();
  const selectedMeals = useMemo(
    () => mealEntries.filter((entry) => (entry.date ? entry.date === selectedDate : entry.createdAt.slice(0, 10) === selectedDate)),
    [mealEntries, selectedDate]
  );
  const selectedWellness = logsByDate[selectedDate] ?? { userId, date: selectedDate, water: [], sleep: null, workouts: [] };
  const summary = useMemo(() => {
    const meal = sumMacros(selectedMeals);
    const water = selectedWellness.water.reduce((a, b) => a + b.amount, 0);
    const workoutCalories = selectedWellness.workouts.reduce((a, b) => a + b.calories, 0);
    return { meal, water, workoutCalories };
  }, [selectedMeals, selectedWellness]);

  const indicators = useMemo(() => {
    const map = new Map<string, { meal: boolean; water: boolean; workout: boolean; sleep: boolean }>();
    const ensure = (key: string) => {
      if (!map.has(key)) map.set(key, { meal: false, water: false, workout: false, sleep: false });
      return map.get(key)!;
    };

    mealEntries.forEach((entry) => {
      const key = entry.date ?? entry.createdAt.slice(0, 10);
      ensure(key).meal = true;
    });
    Object.keys(logsByDate).forEach((k) => {
      const bucket = ensure(k);
      if ((logsByDate[k]?.water.length ?? 0) > 0) bucket.water = true;
      if ((logsByDate[k]?.workouts.length ?? 0) > 0) bucket.workout = true;
      if (Boolean(logsByDate[k]?.sleep)) bucket.sleep = true;
    });
    return map;
  }, [mealEntries, logsByDate]);

  const calendarDays = useMemo(() => buildMonthGrid(selectedDate), [selectedDate]);
  const weekDays = useMemo(() => {
    const d = parseDateKey(selectedDate);
    const start = new Date(d);
    start.setDate(d.getDate() - d.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      return date;
    });
  }, [selectedDate]);

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  async function runMealSearch() {
    const q = mealQuery.trim();
    if (q.length < 2) return;
    setMealLoading(true);
    try {
      setMealResults(await searchFoods(q));
    } finally {
      setMealLoading(false);
    }
  }

  function handleDeleteMeal(entry: LoggedFood) {
    if (!window.confirm("Delete this meal entry?")) return;
    deleteMealEntry(entry.id);
    setUndo({ kind: "meal", entry });
    flash("Meal deleted");
  }

  function handleDeleteWater(entry: WaterEntry, index: number) {
    if (!window.confirm("Delete this water entry?")) return;
    deleteWater(selectedDate, index);
    setUndo({ kind: "water", date: selectedDate, entry });
    flash("Water deleted");
  }

  function handleDeleteWorkout(entry: WorkoutEntry, index: number) {
    if (!window.confirm("Delete this workout entry?")) return;
    deleteWorkout(selectedDate, index);
    setUndo({ kind: "workout", date: selectedDate, entry });
    flash("Workout deleted");
  }

  function handleDeleteSleep(entry: SleepEntry) {
    if (!window.confirm("Delete sleep data for this date?")) return;
    clearSleep(selectedDate);
    setUndo({ kind: "sleep", date: selectedDate, entry });
    flash("Sleep deleted");
  }

  function undoDelete() {
    if (!undo) return;
    if (undo.kind === "meal") addMealEntry({ ...undo.entry, date: undo.entry.date });
    if (undo.kind === "water") upsertWater(undo.date, userId, undo.entry);
    if (undo.kind === "workout") addWorkout(undo.date, userId, undo.entry);
    if (undo.kind === "sleep") upsertSleep(undo.date, userId, undo.entry);
    setUndo(null);
    flash("Undo complete");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logs Calendar</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {toast ? <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{toast}</div> : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" onClick={() => setSelectedDate(addDays(selectedDate, -1))}>Prev</Button>
          <Button variant="secondary" onClick={() => setSelectedDate(addDays(selectedDate, 1))}>Next</Button>
          <Button onClick={() => setSelectedDate(getDateKey())}>Today</Button>
          <select value={viewMode} onChange={(e) => setViewMode(e.target.value as ViewMode)} className="h-11 rounded-md border bg-white px-3 text-sm">
            <option value="month">Month view</option>
            <option value="week">Week view</option>
          </select>
          <Input
            type="month"
            value={monthValue}
            onChange={(e) => {
              setMonthValue(e.target.value);
              const [yy, mm] = e.target.value.split("-").map(Number);
              if (!yy || !mm) return;
              setSelectedDate(`${yy}-${String(mm).padStart(2, "0")}-01`);
            }}
            className="w-44"
          />
        </div>

        <div className="rounded-lg border p-3">
          <div className="mb-2 text-sm font-medium text-stone-700">Selected date: {formatDateLabel(selectedDate)}</div>
          <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-stone-600">
            <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-orange-500" /> Meal</span>
            <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Water</span>
            <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-green-600" /> Workout</span>
            <span className="inline-flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-violet-600" /> Sleep</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-stone-500">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {(viewMode === "month" ? calendarDays : weekDays).map((d) => {
              const key = toDateKey(d);
              const selected = key === selectedDate;
              const marker = indicators.get(key);
              const inMonth = d.getMonth() === parseDateKey(selectedDate).getMonth();
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={`relative rounded-md border px-1 py-2 text-sm ${selected ? "bg-orange-500 text-white" : inMonth ? "bg-white" : "bg-stone-50 text-stone-400"}`}
                >
                  {d.getDate()}
                  <span className="absolute bottom-1 left-1/2 flex -translate-x-1/2 items-center gap-0.5">
                    {marker?.meal ? <span className={`h-1.5 w-1.5 rounded-full ${selected ? "bg-white" : "bg-orange-500"}`} /> : null}
                    {marker?.water ? <span className={`h-1.5 w-1.5 rounded-full ${selected ? "bg-white" : "bg-blue-500"}`} /> : null}
                    {marker?.workout ? <span className={`h-1.5 w-1.5 rounded-full ${selected ? "bg-white" : "bg-green-600"}`} /> : null}
                    {marker?.sleep ? <span className={`h-1.5 w-1.5 rounded-full ${selected ? "bg-white" : "bg-violet-600"}`} /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          <div className="rounded-lg bg-orange-50 p-3 text-sm">Meals: <strong>{Math.round(summary.meal.calories_kcal)} kcal</strong></div>
          <div className="rounded-lg bg-blue-50 p-3 text-sm">Water: <strong>{summary.water} ml</strong></div>
          <div className="rounded-lg bg-green-50 p-3 text-sm">Workouts: <strong>{selectedWellness.workouts.length}</strong></div>
          <div className="rounded-lg bg-violet-50 p-3 text-sm">Sleep: <strong>{selectedWellness.sleep ? `${selectedWellness.sleep.hours} h` : "—"}</strong></div>
        </div>

        <div className="rounded-lg border p-3">
          <div className="mb-2 font-medium">Copy logs from another date</div>
          <div className="flex flex-wrap items-center gap-2">
            <Input type="date" value={copyFromDate} onChange={(e) => setCopyFromDate(e.target.value)} className="w-52" />
            <Button
              variant="secondary"
              onClick={() => {
                if (!copyFromDate) return;
                copyMealDateEntries(copyFromDate, selectedDate, true);
                copyDateLog(copyFromDate, selectedDate, userId, true);
                flash(`Copied logs from ${copyFromDate}`);
              }}
            >
              Copy to selected date
            </Button>
          </div>
        </div>

        {undo ? (
          <div className="flex items-center justify-between rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm">
            <span>Entry deleted.</span>
            <Button variant="secondary" onClick={undoDelete}>Undo</Button>
          </div>
        ) : null}

        <div className="space-y-4">
          <div className="rounded-lg border p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="font-medium">Meals</div>
            </div>
            <div className="flex gap-2">
              <Input value={mealQuery} onChange={(e) => setMealQuery(e.target.value)} placeholder="Search food to add for selected date" />
              <Button variant="secondary" onClick={runMealSearch}>{mealLoading ? "..." : "Search"}</Button>
            </div>
            {mealResults.length > 0 ? (
              <div className="mt-2 space-y-1">
                {mealResults.map((food) => (
                  <button key={food.id} className="w-full rounded-md border px-3 py-2 text-left text-sm hover:bg-muted" onClick={() => setSelectedFood(food)}>
                    {food.name} · {food.calories_kcal ?? "—"} kcal
                  </button>
                ))}
              </div>
            ) : null}
            <div className="mt-2 space-y-2">
              {selectedMeals.length === 0 ? <div className="text-sm text-stone-500">No meal logs for this date.</div> : selectedMeals.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <div>{entry.meal} · {entry.name} · {Math.round(entry.macros.calories_kcal)} kcal</div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setEditingMeal(entry)}>Edit</Button>
                    <Button variant="secondary" onClick={() => handleDeleteMeal(entry)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border p-3">
            <div className="font-medium">Water</div>
            <div className="mt-2 flex gap-2">
              {[250, 500, 750, 1000].map((v) => (
                <Button key={v} variant="secondary" onClick={() => upsertWater(selectedDate, userId, { amount: v, unit: "ml", timestamp: new Date().toISOString() })}>
                  {v === 1000 ? "1L" : `${v}ml`}
                </Button>
              ))}
            </div>
            <div className="mt-2 space-y-1">
              {selectedWellness.water.length === 0 ? <div className="text-sm text-stone-500">No water logs.</div> : selectedWellness.water.map((entry, i) => (
                <div key={`${entry.timestamp}-${i}`} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <div>{entry.amount} ml</div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setWaterEdit({ index: i, amount: entry.amount })}>Edit</Button>
                    <Button variant="secondary" onClick={() => handleDeleteWater(entry, i)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border p-3">
            <div className="font-medium">Workouts</div>
            <div className="mt-2">
              <Button
                variant="secondary"
                onClick={() =>
                  addWorkout(selectedDate, userId, {
                    type: "Cardio",
                    name: "Quick walk",
                    duration: 20,
                    intensity: "Moderate",
                    calories: 140,
                    timestamp: new Date().toISOString()
                  })
                }
              >
                Add quick workout
              </Button>
            </div>
            <div className="mt-2 space-y-1">
              {selectedWellness.workouts.length === 0 ? <div className="text-sm text-stone-500">No workout logs.</div> : selectedWellness.workouts.map((entry, i) => (
                <div key={`${entry.timestamp}-${i}`} className="flex items-center justify-between rounded-md border p-2 text-sm">
                  <div>{entry.type} · {entry.name} · {entry.duration} min</div>
                  <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setWorkoutEdit({ index: i, entry: { ...entry } })}>Edit</Button>
                    <Button variant="secondary" onClick={() => handleDeleteWorkout(entry, i)}>Delete</Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border p-3">
            <div className="font-medium">Sleep</div>
            {selectedWellness.sleep ? (
              <div className="mt-2 space-y-2">
                <div className="text-sm">{selectedWellness.sleep.bedtime} - {selectedWellness.sleep.waketime} ({selectedWellness.sleep.hours}h)</div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setSleepEdit(selectedWellness.sleep)}>Edit</Button>
                  <Button variant="secondary" onClick={() => handleDeleteSleep(selectedWellness.sleep!)}>Delete</Button>
                </div>
              </div>
            ) : (
              <Button
                className="mt-2"
                variant="secondary"
                onClick={() => setSleepEdit({ bedtime: "23:00", waketime: "07:00", hours: 8, quality: 4 })}
              >
                Add sleep data
              </Button>
            )}
          </div>
        </div>

        <FoodLogModal
          open={Boolean(selectedFood)}
          mode="add"
          food={selectedFood}
          onClose={() => setSelectedFood(null)}
          onConfirm={({ meal, servingLabel, servingGrams, quantity }) => {
            const scale = servingGrams / (selectedFood?.serving_grams ?? 100);
            const q = Number(quantity) || 1;
            addMealEntry({
              date: selectedDate,
              foodId: selectedFood?.id ?? "unknown",
              name: selectedFood?.name ?? "Food",
              hasNutrition: selectedFood?.calories_kcal != null,
              nutritionSource: selectedFood?.source ?? "inferred",
              nutritionConfidence: selectedFood?.confidence ?? "low",
              meal,
              servingLabel,
              servingGrams,
              quantity: q,
              macros: {
                calories_kcal: (selectedFood?.calories_kcal ?? 0) * scale * q,
                protein_g: (selectedFood?.protein_g ?? 0) * scale * q,
                carbs_g: (selectedFood?.carbs_g ?? 0) * scale * q,
                fat_g: (selectedFood?.fat_g ?? 0) * scale * q
              }
            });
            setSelectedFood(null);
            setMealQuery("");
            setMealResults([]);
            flash("Meal added");
          }}
        />

        <FoodLogModal
          open={Boolean(editingMeal)}
          mode="edit"
          food={
            editingMeal
              ? {
                  id: editingMeal.foodId,
                  name: editingMeal.name,
                  calories_kcal: null,
                  protein_g: null,
                  carbs_g: null,
                  fat_g: null,
                  serving_label: editingMeal.servingLabel,
                  serving_grams: editingMeal.servingGrams
                }
              : null
          }
          initialMeal={editingMeal?.meal}
          initialServingLabel={editingMeal?.servingLabel}
          initialServingGrams={editingMeal?.servingGrams}
          initialQuantity={editingMeal?.quantity}
          onClose={() => setEditingMeal(null)}
          onConfirm={({ meal, servingLabel, servingGrams, quantity }) => {
            if (!editingMeal) return;
            const q = Number(quantity) || 1;
            const scale = servingGrams / (editingMeal.servingGrams || 100);
            updateMealEntry(editingMeal.id, {
              meal,
              servingLabel,
              servingGrams,
              quantity: q,
              macros: {
                calories_kcal: (editingMeal.macros.calories_kcal / (editingMeal.quantity || 1)) * scale * q,
                protein_g: (editingMeal.macros.protein_g / (editingMeal.quantity || 1)) * scale * q,
                carbs_g: (editingMeal.macros.carbs_g / (editingMeal.quantity || 1)) * scale * q,
                fat_g: (editingMeal.macros.fat_g / (editingMeal.quantity || 1)) * scale * q
              }
            });
            setEditingMeal(null);
            flash("Meal updated");
          }}
        />

        {sleepEdit ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <Card className="w-full max-w-md p-4 space-y-2">
              <div className="font-semibold">Edit Sleep</div>
              <Input type="time" value={sleepEdit.bedtime} onChange={(e) => setSleepEdit({ ...sleepEdit, bedtime: e.target.value })} />
              <Input type="time" value={sleepEdit.waketime} onChange={(e) => setSleepEdit({ ...sleepEdit, waketime: e.target.value })} />
              <Input type="number" min={0} step={0.1} value={sleepEdit.hours} onChange={(e) => setSleepEdit({ ...sleepEdit, hours: Number(e.target.value) })} />
              <Input type="number" min={1} max={5} value={sleepEdit.quality} onChange={(e) => setSleepEdit({ ...sleepEdit, quality: Number(e.target.value) })} />
              <Textarea value={sleepEdit.notes ?? ""} onChange={(e) => setSleepEdit({ ...sleepEdit, notes: e.target.value })} placeholder="Notes" />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    upsertSleep(selectedDate, userId, sleepEdit);
                    setSleepEdit(null);
                    flash("Sleep saved");
                  }}
                >
                  Save
                </Button>
                <Button variant="secondary" onClick={() => setSleepEdit(null)}>Cancel</Button>
              </div>
            </Card>
          </div>
        ) : null}

        {waterEdit ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <Card className="w-full max-w-sm p-4 space-y-2">
              <div className="font-semibold">Edit Water Entry</div>
              <Input type="number" min={1} value={waterEdit.amount} onChange={(e) => setWaterEdit({ ...waterEdit, amount: Number(e.target.value) })} />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    updateWater(selectedDate, waterEdit.index, { amount: waterEdit.amount, unit: "ml", timestamp: new Date().toISOString() });
                    setWaterEdit(null);
                    flash("Water updated");
                  }}
                >
                  Save
                </Button>
                <Button variant="secondary" onClick={() => setWaterEdit(null)}>Cancel</Button>
              </div>
            </Card>
          </div>
        ) : null}

        {workoutEdit ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <Card className="w-full max-w-md p-4 space-y-2">
              <div className="font-semibold">Edit Workout</div>
              <select
                value={workoutEdit.entry.type}
                onChange={(e) => setWorkoutEdit({ ...workoutEdit, entry: { ...workoutEdit.entry, type: e.target.value as WorkoutEntry["type"] } })}
                className="h-11 w-full rounded-md border bg-white px-3 text-sm"
              >
                <option>Cardio</option><option>Strength</option><option>Sports</option>
              </select>
              <Input value={workoutEdit.entry.name} onChange={(e) => setWorkoutEdit({ ...workoutEdit, entry: { ...workoutEdit.entry, name: e.target.value } })} />
              <Input type="number" min={1} value={workoutEdit.entry.duration} onChange={(e) => setWorkoutEdit({ ...workoutEdit, entry: { ...workoutEdit.entry, duration: Number(e.target.value) } })} />
              <select
                value={workoutEdit.entry.intensity}
                onChange={(e) => setWorkoutEdit({ ...workoutEdit, entry: { ...workoutEdit.entry, intensity: e.target.value as WorkoutEntry["intensity"] } })}
                className="h-11 w-full rounded-md border bg-white px-3 text-sm"
              >
                <option>Light</option><option>Moderate</option><option>Vigorous</option>
              </select>
              <Input type="number" min={0} value={workoutEdit.entry.calories} onChange={(e) => setWorkoutEdit({ ...workoutEdit, entry: { ...workoutEdit.entry, calories: Number(e.target.value) } })} />
              <Textarea value={workoutEdit.entry.notes ?? ""} onChange={(e) => setWorkoutEdit({ ...workoutEdit, entry: { ...workoutEdit.entry, notes: e.target.value } })} />
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    updateWorkout(selectedDate, workoutEdit.index, { ...workoutEdit.entry, timestamp: new Date().toISOString() });
                    setWorkoutEdit(null);
                    flash("Workout updated");
                  }}
                >
                  Save
                </Button>
                <Button variant="secondary" onClick={() => setWorkoutEdit(null)}>Cancel</Button>
              </div>
            </Card>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
