import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actions = ["Log Meal", "Log Workout", "Log Water", "Log Sleep"];

export function QuickLogPanel() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Log</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Button key={action} variant="secondary">{action}</Button>
        ))}
      </CardContent>
    </Card>
  );
}
