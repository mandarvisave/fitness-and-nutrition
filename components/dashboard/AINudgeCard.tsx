import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AINudgeCard({ message }: { message: string }) {
  return (
    <Card className="bg-stone-900 text-white">
      <CardHeader>
        <CardTitle>AI Nudge of the Day</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-6 text-stone-200">{message}</CardContent>
    </Card>
  );
}
