export function calculateFHS(memberScores: number[], familySyncScore: number): number {
  if (memberScores.length === 0) return 0;
  const avg = memberScores.reduce((a, b) => a + b, 0) / memberScores.length;
  return Math.min(100, avg + familySyncScore);
}

export function getFHSLevel(score: number): {
  level: string;
  color: string;
  message: string;
} {
  if (score >= 90) return { level: "Elite Family", color: "green", message: "Highly optimized — keep it up!" };
  if (score >= 75) return { level: "Fit Family", color: "blue", message: "On track — stay consistent!" };
  if (score >= 50) return { level: "Improving", color: "amber", message: "Needs more consistency" };
  return { level: "At Risk", color: "red", message: "Your family needs attention now" };
}
