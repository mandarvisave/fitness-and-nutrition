import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

const actions = [
  { label: "Log Meal", href: "/nutrition?quickLog=meal" },
  { label: "Log Workout", href: "/nutrition?quickLog=workout" },
  { label: "Log Water", href: "/nutrition?quickLog=water" },
  { label: "Log Sleep", href: "/nutrition?quickLog=sleep" }
];

export function QuickLogPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Log</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button key={action.label} variant="secondary" asChild>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
