"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartShell } from "@/components/ui/chart-shell";
import { getEntriesWithKnownNutrition, sumMacros, todayKey, useFoodLogStore } from "@/lib/store/useFoodLogStore";
import { getDateKey, useWellnessLogsStore } from "@/lib/store/useWellnessLogsStore";

export function DailySummaryRing({ caloriesIn, caloriesOut }: { caloriesIn: number; caloriesOut: number }) {
  const mealEntries = useFoodLogStore((s) => s.entries);
  const logsByDate = useWellnessLogsStore((s) => s.logsByDate);
  const today = getDateKey();

  const caloriesInLive = useMemo(() => {
    const todayFromMeals = todayKey();
    const todaysEntries = mealEntries.filter((entry) => entry.date ? entry.date === todayFromMeals : entry.createdAt.slice(0, 10) === todayFromMeals);
    return Math.round(sumMacros(getEntriesWithKnownNutrition(todaysEntries)).calories_kcal);
  }, [mealEntries]);
  const caloriesOutLive = useMemo(
    () => Math.round((logsByDate[today]?.workouts ?? []).reduce((sum, w) => sum + w.calories, 0)),
    [logsByDate, today]
  );

  const inValue = caloriesInLive > 0 ? caloriesInLive : caloriesIn;
  const outValue = caloriesOutLive > 0 ? caloriesOutLive : caloriesOut;

  const data = [
    { name: "Calories In", value: inValue },
    { name: "Calories Out", value: outValue }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Summary Ring</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-56">
          <ChartShell>
            <PieChart>
              <Pie data={data} dataKey="value" innerRadius={60} outerRadius={85} paddingAngle={5}>
                <Cell fill="#F97316" />
                <Cell fill="#16A34A" />
              </Pie>
            </PieChart>
          </ChartShell>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-orange-50 p-3">In: {inValue} kcal</div>
          <div className="rounded-lg bg-green-50 p-3">Out: {outValue} kcal</div>
        </div>
      </CardContent>
    </Card>
  );
}
