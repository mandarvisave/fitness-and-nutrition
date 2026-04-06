import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { problemCards } from "@/lib/site-data";

export function ProblemSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">The Problem</p>
        <h2 className="mt-2 text-3xl font-bold">Indian families need a system, not random motivation.</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {problemCards.map((card) => (
          <Card key={card.title}>
            <CardHeader>
              <CardTitle>{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-stone-600">{card.text}</CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
