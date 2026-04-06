"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function WorkoutTimer() {
  const [seconds, setSeconds] = useState(900);

  return (
    <div className="rounded-lg border bg-white p-5 shadow-soft">
      <div className="text-sm text-stone-500">Workout timer</div>
      <div className="mt-2 text-4xl font-bold">{Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}</div>
      <div className="mt-4">
        <Button onClick={() => setSeconds((value) => Math.max(0, value - 60))}>- 1 min</Button>
      </div>
    </div>
  );
}
