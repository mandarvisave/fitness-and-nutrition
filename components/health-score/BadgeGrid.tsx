import { badges } from "@/lib/site-data";
import { Badge } from "@/components/ui/badge";

export function BadgeGrid() {
  return (
    <div className="flex flex-wrap gap-3">
      {badges.slice(0, 6).map((badge) => (
        <Badge key={badge} variant="success">{badge}</Badge>
      ))}
    </div>
  );
}
