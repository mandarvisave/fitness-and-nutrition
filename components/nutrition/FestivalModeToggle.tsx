"use client";

import { useState } from "react";

export function FestivalModeToggle() {
  const [enabled, setEnabled] = useState(true);
  return (
    <button onClick={() => setEnabled((value) => !value)} className="flex min-h-11 w-full items-center justify-between rounded-lg border bg-white px-4 py-3 text-left shadow-soft">
      <div>
        <div className="font-medium">Festival Mode</div>
        <div className="text-sm text-stone-500">Relax calories by 15%, suggest smarter swaps, and protect streaks.</div>
      </div>
      <div className={`ml-4 rounded-pill px-3 py-1 text-xs font-semibold ${enabled ? "bg-secondary text-white" : "bg-muted text-stone-600"}`}>{enabled ? "ON" : "OFF"}</div>
    </button>
  );
}
