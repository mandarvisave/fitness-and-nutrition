"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getDateKey, useWellnessLogsStore, type SleepEntry, type WorkoutEntry } from "@/lib/store/useWellnessLogsStore";

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

function sleepHours(bedtime: string, waketime: string) {
  if (!bedtime || !waketime) return 0;
  const [bh, bm] = bedtime.split(":").map(Number);
  const [wh, wm] = waketime.split(":").map(Number);
  const bed = bh * 60 + bm;
  const wake = wh * 60 + wm;
  const diff = wake >= bed ? wake - bed : 24 * 60 - bed + wake;
  return Math.round((diff / 60) * 10) / 10;
}

function calcWorkoutCalories(duration: number, intensity: WorkoutEntry["intensity"]) {
  const perMin = intensity === "Light" ? 4 : intensity === "Moderate" ? 7 : 10;
  return Math.round(duration * perMin);
}

export function WellnessLogsPanel({ initialQuickLog }: { initialQuickLog?: "water" | "sleep" | "workout" | "meal" }) {
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    // Keep this component client-only after mount to avoid hydration mismatch from cookie/local time derived UI.
    setIsHydrated(true);
  }, []);

  const date = getDateKey();
  const userId = parseDemoUser();
  const logsByDate = useWellnessLogsStore((s) => s.logsByDate);
  const log = useMemo(
    () => logsByDate[date] ?? { userId, date, water: [], sleep: null, workouts: [] },
    [logsByDate, date, userId]
  );
  const upsertWater = useWellnessLogsStore((s) => s.upsertWater);
  const updateWater = useWellnessLogsStore((s) => s.updateWater);
  const deleteWater = useWellnessLogsStore((s) => s.deleteWater);
  const upsertSleep = useWellnessLogsStore((s) => s.upsertSleep);
  const clearSleep = useWellnessLogsStore((s) => s.clearSleep);
  const addWorkout = useWellnessLogsStore((s) => s.addWorkout);
  const updateWorkout = useWellnessLogsStore((s) => s.updateWorkout);
  const deleteWorkout = useWellnessLogsStore((s) => s.deleteWorkout);

  const [toast, setToast] = useState<string | null>(null);
  const [waterOpen, setWaterOpen] = useState(false);
  const [sleepOpen, setSleepOpen] = useState(false);
  const [workoutOpen, setWorkoutOpen] = useState(false);
  const [customWater, setCustomWater] = useState(300);
  const [editingWaterIndex, setEditingWaterIndex] = useState<number | null>(null);
  const [bedtime, setBedtime] = useState("23:00");
  const [waketime, setWaketime] = useState("07:00");
  const [quality, setQuality] = useState(4);
  const [sleepNotes, setSleepNotes] = useState("");
  const [isSleepEditMode, setIsSleepEditMode] = useState(false);
  const [type, setType] = useState<WorkoutEntry["type"]>("Cardio");
  const [name, setName] = useState("");
  const [duration, setDuration] = useState(30);
  const [intensity, setIntensity] = useState<WorkoutEntry["intensity"]>("Moderate");
  const [wNotes, setWNotes] = useState("");
  const [editingWorkoutIndex, setEditingWorkoutIndex] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "saved" | "failed">("idle");

  useEffect(() => {
    if (!isHydrated) return;
    if (initialQuickLog === "water") setWaterOpen(true);
    if (initialQuickLog === "sleep") setSleepOpen(true);
    if (initialQuickLog === "workout") setWorkoutOpen(true);
  }, [initialQuickLog, isHydrated]);

  const waterTotalMl = useMemo(() => log.water.reduce((a, b) => a + b.amount, 0), [log.water]);
  const waterGoalMl = 2000;
  const waterPct = Math.min(100, Math.round((waterTotalMl / waterGoalMl) * 100));
  const sleep = log.sleep;

  const weeklySleepAvg = useMemo(() => {
    const keys = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return getDateKey(d);
    });
    const vals = keys.map((k) => logsByDate[k]?.sleep?.hours).filter((v): v is number => typeof v === "number");
    if (vals.length === 0) return 0;
    return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10;
  }, [logsByDate]);

  const weeklyWorkoutMinutes = useMemo(() => {
    const keys = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return getDateKey(d);
    });
    return keys.reduce((sum, k) => sum + (logsByDate[k]?.workouts ?? []).reduce((s, w) => s + w.duration, 0), 0);
  }, [logsByDate]);

  async function syncToDb() {
    const payload = useWellnessLogsStore.getState().logsByDate[date];
    setSyncStatus("syncing");
    try {
      const response = await fetch("/api/user-logs/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        setSyncStatus("failed");
        return;
      }
      setSyncStatus("saved");
    } catch {
      setSyncStatus("failed");
    }
  }

  function notify(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  }

  if (!isHydrated) {
    return (
      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card><CardHeader><CardTitle>Water Log</CardTitle></CardHeader><CardContent className="text-sm text-stone-500">Loading...</CardContent></Card>
          <Card><CardHeader><CardTitle>Sleep Log</CardTitle></CardHeader><CardContent className="text-sm text-stone-500">Loading...</CardContent></Card>
          <Card><CardHeader><CardTitle>Workout Log</CardTitle></CardHeader><CardContent className="text-sm text-stone-500">Loading...</CardContent></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast ? <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">{toast}</div> : null}
      <div className={`rounded-md border px-3 py-2 text-xs ${
        syncStatus === "syncing"
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : syncStatus === "saved"
            ? "border-green-200 bg-green-50 text-green-700"
            : syncStatus === "failed"
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-stone-200 bg-stone-50 text-stone-600"
      }`}>
        Sync status: {syncStatus === "idle" ? "Local only (not synced yet)" : syncStatus}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Water Log</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-stone-600">Today: <strong>{waterTotalMl} ml</strong> ({(waterTotalMl / 1000).toFixed(2)} L)</div>
            <div className="h-3 rounded-full bg-stone-100"><div className="h-3 rounded-full bg-blue-500" style={{ width: `${waterPct}%` }} /></div>
            <div className="text-xs text-stone-500">Goal: 2000 ml (2L) · {waterPct}%</div>
            <Button onClick={() => setWaterOpen(true)} className="w-full">Log Water</Button>
            {log.water.length > 0 ? (
              <div className="space-y-2 pt-1">
                {log.water.map((entry, index) => (
                  <div key={`${entry.timestamp}-${index}`} className="flex items-center justify-between rounded-md border p-2 text-xs">
                    <div>{entry.amount}ml · {new Date(entry.timestamp).toLocaleTimeString()}</div>
                    <div className="flex gap-1">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setCustomWater(entry.amount);
                          setEditingWaterIndex(index);
                          setWaterOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          deleteWater(date, index);
                          syncToDb();
                          notify("Water entry deleted");
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sleep Log</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>Last night: <strong>{sleep?.hours?.toFixed(1) ?? "0.0"} h</strong> {sleep ? `(quality ${sleep.quality}/5)` : ""}</div>
            <div>Weekly average: <strong>{weeklySleepAvg.toFixed(1)} h</strong></div>
            <div className={sleep && sleep.hours >= 8 ? "text-green-700" : "text-amber-700"}>Goal: 8h {sleep && sleep.hours >= 8 ? "met" : "not met"}</div>
            <Button onClick={() => setSleepOpen(true)} className="w-full">Log Sleep</Button>
            {sleep ? (
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    setBedtime(sleep.bedtime);
                    setWaketime(sleep.waketime);
                    setQuality(sleep.quality);
                    setSleepNotes(sleep.notes ?? "");
                    setIsSleepEditMode(true);
                    setSleepOpen(true);
                  }}
                >
                  Edit Sleep
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => {
                    clearSleep(date);
                    syncToDb();
                    notify("Sleep entry deleted");
                  }}
                >
                  Delete Sleep
                </Button>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Workout Log</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>Today: <strong>{log.workouts.length}</strong> workouts</div>
            <div>Weekly total: <strong>{weeklyWorkoutMinutes}</strong> min</div>
            <Button onClick={() => setWorkoutOpen(true)} className="w-full">Log Workout</Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Today's Workouts</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {log.workouts.length === 0 ? <div className="text-sm text-stone-500">No workouts logged yet.</div> : log.workouts.map((w, i) => (
            <div key={`${w.timestamp}-${i}`} className="flex items-center justify-between rounded-lg border p-3 text-sm">
              <div>{w.type} · <strong>{w.name}</strong> · {w.duration} min · {w.intensity} · {w.calories} kcal</div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setType(w.type);
                    setName(w.name);
                    setDuration(w.duration);
                    setIntensity(w.intensity);
                    setWNotes(w.notes ?? "");
                    setEditingWorkoutIndex(i);
                    setWorkoutOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => { deleteWorkout(date, i); syncToDb(); notify("Workout deleted"); }}>Delete</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {waterOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <Card className="w-full max-w-md p-5">
            <div className="text-lg font-semibold">Add Water</div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {[250, 500, 750, 1000].map((amt) => <Button key={amt} variant="secondary" onClick={() => { upsertWater(date, userId, { amount: amt, unit: "ml", timestamp: new Date().toISOString() }); syncToDb(); notify(`Added ${amt} ml`); }}>{amt === 1000 ? "1L" : `${amt}ml`}</Button>)}
            </div>
            <div className="mt-3">
              <Input type="number" value={customWater} onChange={(e) => setCustomWater(Number(e.target.value))} min={1} />
              <Button
                className="mt-2 w-full"
                onClick={() => {
                  if (customWater < 1) return;
                  const payload = { amount: customWater, unit: "ml" as const, timestamp: new Date().toISOString() };
                  if (editingWaterIndex === null) {
                    upsertWater(date, userId, payload);
                    notify("Custom water added");
                  } else {
                    updateWater(date, editingWaterIndex, payload);
                    notify("Water entry updated");
                  }
                  syncToDb();
                  setEditingWaterIndex(null);
                  setWaterOpen(false);
                }}
              >
                {editingWaterIndex === null ? "Add custom (ml)" : "Save water edit"}
              </Button>
            </div>
            <Button className="mt-3 w-full" variant="secondary" onClick={() => { setEditingWaterIndex(null); setWaterOpen(false); }}>Close</Button>
          </Card>
        </div>
      ) : null}

      {sleepOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <Card className="w-full max-w-md p-5 space-y-3">
            <div className="text-lg font-semibold">Log Sleep</div>
            <Input type="time" value={bedtime} onChange={(e) => setBedtime(e.target.value)} />
            <Input type="time" value={waketime} onChange={(e) => setWaketime(e.target.value)} />
            <div className="text-sm">Total: <strong>{sleepHours(bedtime, waketime).toFixed(1)} h</strong></div>
            <select value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="h-11 w-full rounded-md border bg-white px-4 text-sm">
              {[1, 2, 3, 4, 5].map((v) => <option key={v} value={v}>{`${"★".repeat(v)}${"☆".repeat(5 - v)}`}</option>)}
            </select>
            <Textarea value={sleepNotes} onChange={(e) => setSleepNotes(e.target.value)} placeholder="Optional notes" />
            <Button onClick={() => {
              const hours = sleepHours(bedtime, waketime);
              if (!bedtime || !waketime || hours <= 0) return;
              const payload: SleepEntry = { bedtime, waketime, hours, quality, notes: sleepNotes || undefined };
              upsertSleep(date, userId, payload);
              syncToDb();
              notify(isSleepEditMode ? "Sleep updated" : "Sleep logged");
              setIsSleepEditMode(false);
              setSleepOpen(false);
            }}>{isSleepEditMode ? "Save Sleep Edit" : "Save Sleep"}</Button>
            <Button variant="secondary" onClick={() => { setIsSleepEditMode(false); setSleepOpen(false); }}>Close</Button>
          </Card>
        </div>
      ) : null}

      {workoutOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <Card className="w-full max-w-md p-5 space-y-3">
            <div className="text-lg font-semibold">Log Workout</div>
            <select value={type} onChange={(e) => setType(e.target.value as WorkoutEntry["type"])} className="h-11 w-full rounded-md border bg-white px-4 text-sm">
              <option>Cardio</option><option>Strength</option><option>Sports</option>
            </select>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Exercise name" />
            <Input type="number" value={duration} min={1} onChange={(e) => setDuration(Number(e.target.value))} placeholder="Duration (minutes)" />
            <select value={intensity} onChange={(e) => setIntensity(e.target.value as WorkoutEntry["intensity"])} className="h-11 w-full rounded-md border bg-white px-4 text-sm">
              <option>Light</option><option>Moderate</option><option>Vigorous</option>
            </select>
            <div className="text-sm">Estimated calories: <strong>{calcWorkoutCalories(duration, intensity)} kcal</strong></div>
            <Textarea value={wNotes} onChange={(e) => setWNotes(e.target.value)} placeholder="Optional notes" />
            <Button onClick={() => {
              if (!name.trim() || duration <= 0) return;
              const workoutPayload = {
                type,
                name: name.trim(),
                duration,
                intensity,
                calories: calcWorkoutCalories(duration, intensity),
                notes: wNotes || undefined,
                timestamp: new Date().toISOString()
              } satisfies WorkoutEntry;
              if (editingWorkoutIndex === null) {
                addWorkout(date, userId, workoutPayload);
                notify("Workout logged");
              } else {
                updateWorkout(date, editingWorkoutIndex, workoutPayload);
                notify("Workout updated");
              }
              syncToDb();
              setWorkoutOpen(false);
              setEditingWorkoutIndex(null);
              setName("");
              setWNotes("");
            }}>{editingWorkoutIndex === null ? "Save Workout" : "Save Workout Edit"}</Button>
            <Button variant="secondary" onClick={() => { setWorkoutOpen(false); setEditingWorkoutIndex(null); }}>Close</Button>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
