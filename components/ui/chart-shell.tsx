"use client";

import { ResponsiveContainer } from "recharts";

export function ChartShell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}
