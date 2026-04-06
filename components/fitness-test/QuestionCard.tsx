import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function QuestionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="animate-fade-up">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
