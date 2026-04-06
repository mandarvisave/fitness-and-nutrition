"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { applyTransformationPlan, bodyProfileLabel, calculateBMI, generateTransformationPlan } from "@/lib/transformation/calculateBodyProfile";
import { useSettingsStore } from "@/lib/store/useSettingsStore";

const wizardMemberSchema = z.object({
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

const wizardSchema = z.object({
  members: z.array(wizardMemberSchema).min(1)
});

function toFormMember(member: ReturnType<typeof useSettingsStore.getState>["memberGoals"][number]) {
  return {
    ...member,
    bodyFatPct: member.bodyFatPct ?? undefined,
    targetWeightKg: member.targetWeightKg ?? undefined
  };
}

function toStoredMember(member: z.infer<typeof wizardMemberSchema>) {
  return {
    ...member,
    bodyFatPct: typeof member.bodyFatPct === "number" && Number.isNaN(member.bodyFatPct) ? null : member.bodyFatPct ?? null,
    targetWeightKg: typeof member.targetWeightKg === "number" && Number.isNaN(member.targetWeightKg) ? null : member.targetWeightKg ?? null
  };
}

export default function GoalWizardPage() {
  const router = useRouter();
  const { hydrated, memberGoals, replaceMemberGoals } = useSettingsStore();
  const [saved, setSaved] = useState(false);
  const form = useForm<z.infer<typeof wizardSchema>>({
    resolver: zodResolver(wizardSchema),
    defaultValues: { members: memberGoals.map(toFormMember) }
  });
  const { fields } = useFieldArray({
    control: form.control,
    name: "members"
  });

  useEffect(() => {
    if (hydrated) {
      form.reset({ members: memberGoals.map(toFormMember) });
    }
  }, [hydrated, memberGoals, form]);

  if (!hydrated) {
    return <main className="mx-auto max-w-4xl px-4 py-10"><div className="rounded-lg border bg-white p-6 shadow-soft">Loading wizard...</div></main>;
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Body Profile & Transformation Wizard</h1>
        <p className="text-stone-600">Enter height, weight, and optional body-fat percentage. We&apos;ll infer the current body profile and generate a starter transformation plan for each family member.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Body Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit((values) => {
              replaceMemberGoals(values.members.map(toStoredMember));
              setSaved(true);
              setTimeout(() => setSaved(false), 1800);
              router.push("/dashboard");
              router.refresh();
            })}
          >
            {fields.map((field, index) => {
              const livePlan = generateTransformationPlan({
                role: form.watch(`members.${index}.role`),
                gender: form.watch(`members.${index}.gender`),
                age: Number(form.watch(`members.${index}.age`) || 0),
                heightCm: Number(form.watch(`members.${index}.heightCm`) || 0),
                weightKg: Number(form.watch(`members.${index}.weightKg`) || 0),
                bodyFatPct: form.watch(`members.${index}.bodyFatPct`) ? Number(form.watch(`members.${index}.bodyFatPct`)) : null
              });

              return (
                <div key={field.id} className="rounded-lg border p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">{form.watch(`members.${index}.name`) || `Member ${index + 1}`}</h2>
                    <span className="rounded-pill bg-orange-50 px-3 py-1 text-sm font-medium text-orange-800">
                      {bodyProfileLabel(livePlan.bodyProfile)}
                    </span>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Input {...form.register(`members.${index}.name`)} placeholder="Name" />
                    <Input {...form.register(`members.${index}.age`)} type="number" placeholder="Age" />
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
                    <Input {...form.register(`members.${index}.heightCm`)} type="number" placeholder="Height (cm)" />
                    <Input {...form.register(`members.${index}.weightKg`)} type="number" placeholder="Weight (kg)" />
                    <Input {...form.register(`members.${index}.bodyFatPct`)} type="number" placeholder="Body fat % (optional)" />
                  </div>

                  <div className="mt-4 rounded-lg bg-muted p-4 text-sm text-stone-700">
                    <div className="flex flex-wrap gap-3">
                      <span className="rounded-pill bg-white px-3 py-1 font-medium shadow-soft">BMI {calculateBMI(Number(form.watch(`members.${index}.heightCm`) || 0), Number(form.watch(`members.${index}.weightKg`) || 0))}</span>
                      <span className="rounded-pill bg-white px-3 py-1 font-medium shadow-soft">Goal: {livePlan.goal.replace("_", " ")}</span>
                      <span className="rounded-pill bg-white px-3 py-1 font-medium shadow-soft">Track: {livePlan.workoutTrack}</span>
                    </div>
                    <p className="mt-3">{livePlan.summary}</p>
                    <p className="mt-2">Suggested targets: {livePlan.calorieTarget} kcal, {livePlan.proteinTarget}g protein, {livePlan.hydrationTarget}ml water, {livePlan.targetTimelineWeeks} weeks.</p>
                  </div>
                </div>
              );
            })}

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={() => {
                  fields.forEach((_, index) => {
                    const current: z.infer<typeof wizardMemberSchema> = form.getValues(`members.${index}`);
                    const generated = applyTransformationPlan({
                      ...current,
                      bodyFatPct: current.bodyFatPct ? Number(current.bodyFatPct) : null,
                      targetWeightKg: current.targetWeightKg ? Number(current.targetWeightKg) : null
                    });

                    const nextMember: z.infer<typeof wizardMemberSchema> = {
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
                Generate Transformation Plans
              </Button>
              <Button type="submit" variant="secondary">Save And Continue</Button>
              {saved ? <span className="text-sm text-green-700">Plans saved</span> : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
