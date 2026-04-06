import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface MemberScoreCardProps {
  member: {
    name: string;
    phs: number;
    top: string;
    bottom: string;
    role: string;
    conditions: string[];
  };
}

export function MemberScoreCard({ member }: MemberScoreCardProps) {
  const condition = member.conditions[0];
  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-lg font-semibold">{member.name}</div>
            <div className="text-sm capitalize text-stone-500">{member.role}</div>
          </div>
          <div className="rounded-full bg-secondary/10 px-3 py-1 text-sm font-semibold text-secondary">{member.phs} PHS</div>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg bg-muted p-3">
            <div className="text-stone-500">Top category</div>
            <div className="mt-1 font-semibold">{member.top}</div>
          </div>
          <div className="rounded-lg bg-muted p-3">
            <div className="text-stone-500">Needs support</div>
            <div className="mt-1 font-semibold">{member.bottom}</div>
          </div>
        </div>
        {condition ? (
          <Link href={`/wellness/${condition}`} className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            <AlertTriangle className="mt-0.5 h-4 w-4" />
            <span>Recommended plan for {condition.replace("_", " ")} available.</span>
          </Link>
        ) : (
          <Badge>On Track</Badge>
        )}
      </CardContent>
    </Card>
  );
}
