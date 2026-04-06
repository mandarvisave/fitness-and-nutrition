"use client";

import { PieChart, Pie, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartShell } from "@/components/ui/chart-shell";

export function DailySummaryRing({ caloriesIn, caloriesOut }: { caloriesIn: number; caloriesOut: number }) {
  const data = [
    { name: "Calories In", value: caloriesIn },
    { name: "Calories Out", value: caloriesOut }
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
          <div className="rounded-lg bg-orange-50 p-3">In: {caloriesIn} kcal</div>
          <div className="rounded-lg bg-green-50 p-3">Out: {caloriesOut} kcal</div>
        </div>
      </CardContent>
    </Card>
  );
}
