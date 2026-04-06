"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSettingsStore } from "@/lib/store/useSettingsStore";
import { bodyProfileLabel, calculateBMI, generateTransformationPlan } from "@/lib/transformation/calculateBodyProfile";

export function TransformationPlanCard() {
  const { hydrated, memberGoals } = useSettingsStore();

  const primaryMember = useMemo(() => memberGoals.find((member) => member.role === "parent") ?? memberGoals[0], [memberGoals]);

  if (!hydrated || !primaryMember) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transformation Plan</CardTitle>
        </CardHeader>
        <CardContent>Loading your plan...</CardContent>
      </Card>
    );
  }

  const plan = generateTransformationPlan({
    role: primaryMember.role,
    gender: primaryMember.gender,
    age: primaryMember.age,
    heightCm: primaryMember.heightCm,
    weightKg: primaryMember.weightKg,
    bodyFatPct: primaryMember.bodyFatPct
  });

  return (
    <Card className="bg-gradient-to-br from-green-50 to-white">
      <CardHeader>
        <CardTitle>Transformation Plan</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-stone-700">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-pill bg-white px-3 py-1 font-medium shadow-soft">{primaryMember.name}</span>
          <span className="rounded-pill bg-white px-3 py-1 font-medium shadow-soft">{bodyProfileLabel(plan.bodyProfile)}</span>
          <span className="rounded-pill bg-white px-3 py-1 font-medium shadow-soft">BMI {calculateBMI(primaryMember.heightCm, primaryMember.weightKg)}</span>
        </div>
        <p>{plan.summary}</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-white p-3 shadow-soft">Calories: {primaryMember.calorieTarget} kcal</div>
          <div className="rounded-lg bg-white p-3 shadow-soft">Protein: {primaryMember.proteinTarget}g</div>
          <div className="rounded-lg bg-white p-3 shadow-soft">Track: {primaryMember.workoutTrack}</div>
          <div className="rounded-lg bg-white p-3 shadow-soft">Timeline: {primaryMember.targetTimelineWeeks} weeks</div>
        </div>
      </CardContent>
    </Card>
  );
}
