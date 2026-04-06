import { pillars } from "@/lib/site-data";

export function CategoryBreakdown() {
  return (
    <div className="space-y-4">
      {pillars.map((pillar) => (
        <div key={pillar.label}>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>{pillar.label}</span>
            <span>{pillar.score}</span>
          </div>
          <div className="h-3 rounded-full bg-muted">
            <div className="h-3 rounded-full bg-primary" style={{ width: `${Math.min(100, pillar.score * 3)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
