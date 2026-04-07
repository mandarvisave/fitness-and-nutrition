"use client";

import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import type { GeneratedWorkoutPlan } from "@/lib/ai/generateWorkoutPlan";
import Link from "next/link";

const equipmentOptions = ["No equipment", "Dumbbells", "Resistance bands", "Kettlebell", "Pull-up bar", "Yoga mat"];

export default function WorkoutBuilderPage() {
  const tier = useSettingsStore((state) => state.subscription.tier);
  const [goal, setGoal] = useState("Weight loss");
  const [fitnessLevel, setFitnessLevel] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [daysPerWeek, setDaysPerWeek] = useState(4);
  const [sessionMinutes, setSessionMinutes] = useState(30);
  const [equipment, setEquipment] = useState<string[]>(["No equipment"]);
  const [constraints, setConstraints] = useState("");
  const [injuries, setInjuries] = useState("");
  const [plan, setPlan] = useState<GeneratedWorkoutPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPaidTier = useMemo(() => tier === "core" || tier === "premium", [tier]);

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const isPrintShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "p";
      const isSaveShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s";
      if (isPrintShortcut || isSaveShortcut) {
        event.preventDefault();
      }
    };

    const handleBeforePrint = () => {
      alert("Printing and PDF export are disabled for this protected content.");
    };

    const handleContextMenu = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("[data-protected-content='true']")) {
        event.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    window.addEventListener("beforeprint", handleBeforePrint);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("beforeprint", handleBeforePrint);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  function toggleEquipment(value: string) {
    setEquipment((prev) => (prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]));
  }

  async function onGenerate() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/workout-planner/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal,
          fitnessLevel,
          daysPerWeek,
          sessionMinutes,
          equipment,
          constraints,
          injuries
        })
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Failed to generate workout plan.");
      }

      const data = (await response.json()) as { workoutPlan: GeneratedWorkoutPlan };
      setPlan(data.workoutPlan);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 pb-24 sm:px-6">
        <section className="rounded-[2rem] border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50 p-6 shadow-soft sm:p-8">
          <span className="inline-flex rounded-full bg-orange-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white">
            AI Planner
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-950 sm:text-4xl">Customized Workout Plans</h1>
          <p className="mt-3 max-w-3xl text-stone-600">
            Generate a weekly training plan tailored to your goal, fitness level, available days, and home equipment. This feature is part of the Core paid plan.
          </p>
        </section>

        {!isPaidTier ? (
          <Card>
            <CardHeader>
              <CardTitle>Upgrade Required</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-stone-600">The AI Planner is available for Core and Premium members. Upgrade to unlock personalized workout programming.</p>
              <Button asChild>
                <Link href="/pricing">View Core Plan</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <Card>
              <CardHeader>
                <CardTitle>Your Inputs</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input value={goal} onChange={(event) => setGoal(event.target.value)} placeholder="Goal (e.g., weight loss, muscle gain)" />
                <select value={fitnessLevel} onChange={(event) => setFitnessLevel(event.target.value as "beginner" | "intermediate" | "advanced")} className="h-11 w-full rounded-md border bg-white px-4 text-sm">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <div className="grid grid-cols-2 gap-3">
                  <Input type="number" min={2} max={7} value={daysPerWeek} onChange={(event) => setDaysPerWeek(Number(event.target.value))} placeholder="Days per week" />
                  <Input type="number" min={15} max={90} value={sessionMinutes} onChange={(event) => setSessionMinutes(Number(event.target.value))} placeholder="Minutes per session" />
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-stone-700">Equipment</p>
                  <div className="grid grid-cols-2 gap-2">
                    {equipmentOptions.map((item) => (
                      <label key={item} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                        <input type="checkbox" checked={equipment.includes(item)} onChange={() => toggleEquipment(item)} className="h-4 w-4 accent-orange-600" />
                        {item}
                      </label>
                    ))}
                  </div>
                </div>

                <Textarea value={constraints} onChange={(event) => setConstraints(event.target.value)} placeholder="Constraints (e.g., only evenings, apartment noise limits)" />
                <Textarea value={injuries} onChange={(event) => setInjuries(event.target.value)} placeholder="Injuries or limitations (e.g., knee pain, lower back discomfort)" />

                <Button onClick={onGenerate} disabled={loading} className="w-full">
                  {loading ? "Generating..." : "Generate AI Workout Plan"}
                </Button>
                {error ? <p className="text-sm text-red-600">{error}</p> : null}
              </CardContent>
            </Card>

            <Card data-protected-content="true" className="select-none">
              <CardHeader>
                <CardTitle>Plan Output</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
                  Protected view: print, save shortcuts, and right-click are disabled on this plan.
                </p>
                {!plan ? (
                  <p className="text-sm text-stone-500">Your generated plan will appear here.</p>
                ) : (
                  <>
                    <div>
                      <h3 className="text-xl font-semibold text-stone-900">{plan.title}</h3>
                      <p className="mt-1 text-sm text-stone-600">{plan.weeklySummary}</p>
                    </div>
                    <div className="rounded-lg border bg-stone-50 p-3 text-sm text-stone-700">
                      <div><strong>Progression:</strong> {plan.progressionTip}</div>
                      <div className="mt-1"><strong>Recovery:</strong> {plan.recoveryTip}</div>
                    </div>
                    <div className="space-y-3">
                      {plan.days.map((day) => (
                        <div key={day.day} className="rounded-lg border p-3">
                          <div className="font-semibold text-stone-900">{day.day}: {day.focus}</div>
                          <div className="mt-2 text-sm">
                            <strong>Warm-up:</strong> {day.warmup.join(", ")}
                          </div>
                          <div className="mt-2 space-y-1 text-sm">
                            <strong>Main:</strong>
                            {day.main.map((exercise) => (
                              <div key={`${day.day}-${exercise.name}`} className="text-stone-700">
                                {exercise.name} - {exercise.reps}, rest {exercise.rest}. {exercise.notes}
                              </div>
                            ))}
                          </div>
                          <div className="mt-2 text-sm"><strong>Finisher:</strong> {day.finisher}</div>
                          <div className="mt-1 text-sm"><strong>Cooldown:</strong> {day.cooldown.join(", ")}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
