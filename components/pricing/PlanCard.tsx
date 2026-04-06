import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function PlanCard({ plan }: { plan: { name: string; price: number; description: string; features: string[]; cta: string } }) {
  return (
    <Card className={plan.name === "Core" ? "border-primary" : ""}>
      <CardHeader>
        <CardTitle>{plan.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-3xl font-bold">{plan.price === 0 ? "Free" : formatCurrency(plan.price)}{plan.price > 0 ? <span className="text-sm font-normal text-stone-500"> /month</span> : null}</div>
        <p className="text-sm text-stone-600">{plan.description}</p>
        <ul className="space-y-2 text-sm text-stone-600">
          {plan.features.map((feature) => (
            <li key={feature}>• {feature}</li>
          ))}
        </ul>
        <Button asChild className="w-full">
          <Link href={plan.price === 0 ? "/signup" : `/checkout/${plan.name.toLowerCase()}`}>{plan.cta}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
