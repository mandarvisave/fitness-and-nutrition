"use client";

import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { SettingsLayout } from "@/components/settings/SettingsLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { applyTransformationPlan, bodyProfileLabel, calculateBMI, generateTransformationPlan } from "@/lib/transformation/calculateBodyProfile";
import { useSettingsStore } from "@/lib/store/useSettingsStore";

const memberSchema = z.object({
  id: z.string(),
  name: z.string().min(2),
  role: z.enum(["parent", "child", "senior"]),
  gender: z.enum(["male", "female", "other"]),
  age: z.coerce.number().min(5).max(100),
  heightCm: z.coerce.number().min(80).max(230),
  weightKg: z.coerce.number().min(15).max(250),
  bodyFatPct: z.union([z.coerce.number().min(3).max(60), z.nan()]).optional(),
  targetWeightKg: z.union([z.coerce.number().min(15).max(250), z.nan()]).optional(),
  targetTimelineWeeks: z.coerce.number().min(4).max(52),
  bodyProfile: z.enum([
    "lean-build",
    "balanced-build",
    "fat-loss-priority",
    "muscle-gain-priority",
    "recomposition-candidate",
    "mobility-first"
  ]),
  goal: z.enum(["weight_loss", "muscle_gain", "general_fitness", "energy_boost", "body_recomposition"]),
  calorieTarget: z.coerce.number().min(1000).max(5000),
  proteinTarget: z.coerce.number().min(20).max(250),
  hydrationTarget: z.coerce.number().min(500).max(5000),
  workoutTrack: z.enum(["weight-loss", "muscle-gain", "general-fitness", "energy-boost", "body-recomposition", "family-fit", "morning-routine", "seniors"]),
  focusHabit: z.string().min(3)
});

const goalsSchema = z.object({
  members: z.array(memberSchema).min(1)
});

function toFormMember(member: ReturnType<typeof useSettingsStore.getState>["memberGoals"][number]) {
  return {
    ...member,
    bodyFatPct: member.bodyFatPct ?? undefined,
    targetWeightKg: member.targetWeightKg ?? undefined
  };
}

function toStoredMember(member: z.infer<typeof memberSchema>) {
  return {
    ...member,
    bodyFatPct: typeof member.bodyFatPct === "number" && Number.isNaN(member.bodyFatPct) ? null : member.bodyFatPct ?? null,
    targetWeightKg: typeof member.targetWeightKg === "number" && Number.isNaN(member.targetWeightKg) ? null : member.targetWeightKg ?? null
  };
}

export default function SettingsGoalsPage() {
  const { hydrated, memberGoals, replaceMemberGoals } = useSettingsStore();
  const [saved, setSaved] = useState(false);
  const form = useForm<z.infer<typeof goalsSchema>>({
    resolver: zodResolver(goalsSchema),
    defaultValues: { members: memberGoals.map(toFormMember) }
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "members"
  });

  useEffect(() => {
    if (hydrated) {
      form.reset({ members: memberGoals.map(toFormMember) });
    }
  }, [hydrated, memberGoals, form]);

  if (!hydrated) {
    return (
      <SettingsLayout currentPath="/settings/goals" title="Member Goals" description="Loading member goals...">
        <div className="rounded-lg border bg-white p-6 shadow-soft">Loading goals...</div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout currentPath="/settings/goals" title="Member Goals" description="Set calorie, protein, hydration, and workout targets for each family member.">
      <Card>
        <CardHeader>
          <CardTitle>Family Goal Builder</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit((values) => {
              replaceMemberGoals(values.members.map(toStoredMember));
              setSaved(true);
              setTimeout(() => setSaved(false), 1800);
            })}
          >
            <div className="space-y-5">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-lg border p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Member {index + 1}</h3>
                    {fields.length > 1 ? (
                      <Button type="button" variant="outline" onClick={() => remove(index)}>
                        Remove
                      </Button>
                    ) : null}
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input {...form.register(`members.${index}.name`)} placeholder="Member name" />

                    <select {...form.register(`members.${index}.role`)} className="h-11 w-full rounded-md border bg-white px-4 text-sm">
                      <option value="parent">Parent</option>
                      <option value="child">Child</option>
                      <option value="senior">Senior</option>
                    </select>

                    <select {...form.register(`members.${index}.gender`)} className="h-11 w-full rounded-md border bg-white px-4 text-sm">
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>

                    <Input {...form.register(`members.${index}.age`)} type="number" placeholder="Age" />
                    <Input {...form.register(`members.${index}.heightCm`)} type="number" placeholder="Height (cm)" />
                    <Input {...form.register(`members.${index}.weightKg`)} type="number" placeholder="Weight (kg)" />
                    <Input {...form.register(`members.${index}.bodyFatPct`)} type="number" placeholder="Body fat % (optional)" />

                    <select {...form.register(`members.${index}.goal`)} className="h-11 w-full rounded-md border bg-white px-4 text-sm">
                      <option value="weight_loss">Weight loss</option>
                      <option value="muscle_gain">Muscle gain</option>
                      <option value="general_fitness">General fitness</option>
                      <option value="energy_boost">Energy boost</option>
                      <option value="body_recomposition">Body recomposition</option>
                    </select>

                    <select {...form.register(`members.${index}.workoutTrack`)} className="h-11 w-full rounded-md border bg-white px-4 text-sm">
                      <option value="weight-loss">Weight Loss</option>
                      <option value="muscle-gain">Muscle Gain</option>
                      <option value="general-fitness">General Fitness</option>
                      <option value="energy-boost">Energy Boost</option>
                      <option value="body-recomposition">Body Recomposition</option>
                      <option value="family-fit">Family Fit</option>
                      <option value="morning-routine">Morning Routine</option>
                      <option value="seniors">Seniors</option>
                    </select>

                    <Input {...form.register(`members.${index}.calorieTarget`)} type="number" placeholder="Calories" />
                    <Input {...form.register(`members.${index}.proteinTarget`)} type="number" placeholder="Protein (g)" />
                    <Input {...form.register(`members.${index}.hydrationTarget`)} type="number" placeholder="Water (ml)" />
                    <Input {...form.register(`members.${index}.targetWeightKg`)} type="number" placeholder="Target weight (kg)" />
                    <Input {...form.register(`members.${index}.targetTimelineWeeks`)} type="number" placeholder="Timeline (weeks)" />
                    <Input {...form.register(`members.${index}.focusHabit`)} placeholder="Focus habit" />
                  </div>

                  <div className="mt-4 rounded-lg bg-muted p-4 text-sm text-stone-700">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="rounded-pill bg-white px-3 py-1 font-medium shadow-soft">
                        BMI {calculateBMI(
                          Number(form.watch(`members.${index}.heightCm`) || 0),
                          Number(form.watch(`members.${index}.weightKg`) || 0)
                        )}
                      </span>
                      <span className="rounded-pill bg-white px-3 py-1 font-medium shadow-soft">
                        {bodyProfileLabel(form.watch(`members.${index}.bodyProfile`))}
                      </span>
                    </div>
                    <p className="mt-3">
                      {generateTransformationPlan({
                        role: form.watch(`members.${index}.role`),
                        gender: form.watch(`members.${index}.gender`),
                        age: Number(form.watch(`members.${index}.age`) || 0),
                        heightCm: Number(form.watch(`members.${index}.heightCm`) || 0),
                        weightKg: Number(form.watch(`members.${index}.weightKg`) || 0),
                        bodyFatPct: form.watch(`members.${index}.bodyFatPct`) ? Number(form.watch(`members.${index}.bodyFatPct`)) : null
                      }).summary}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={() => {
                  fields.forEach((_, index) => {
                    const current: z.infer<typeof memberSchema> = form.getValues(`members.${index}`);
                    const generated = applyTransformationPlan({
                      ...current,
                      bodyFatPct: current.bodyFatPct ? Number(current.bodyFatPct) : null,
                      targetWeightKg: current.targetWeightKg ? Number(current.targetWeightKg) : null
                    });

                    const nextMember: z.infer<typeof memberSchema> = {
                      ...current,
                      ...generated,
                      id: current.id,
                      name: current.name,
                      bodyFatPct: generated.bodyFatPct ?? undefined,
                      targetWeightKg: generated.targetWeightKg ?? undefined
                    };

                    form.setValue(`members.${index}`, nextMember);
                  });
                }}
              >
                Generate Plans From Body Metrics
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() =>
                  append({
                    id: `member-${Date.now()}`,
                    name: "",
                    role: "child",
                    gender: "other",
                    age: 12,
                    heightCm: 145,
                    weightKg: 40,
                    bodyFatPct: undefined,
                    targetWeightKg: undefined,
                    targetTimelineWeeks: 10,
                    bodyProfile: "balanced-build",
                    goal: "general_fitness",
                    calorieTarget: 1600,
                    proteinTarget: 60,
                    hydrationTarget: 1800,
                    workoutTrack: "family-fit",
                    focusHabit: "Log one healthy snack"
                  })
                }
              >
                Add Member
              </Button>
              <Button type="submit">Save Goals</Button>
              {saved ? <span className="text-sm text-green-700">Goals saved</span> : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </SettingsLayout>
  );
}
