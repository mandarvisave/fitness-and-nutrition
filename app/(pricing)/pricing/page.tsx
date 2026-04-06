import { PlanComparisonTable } from "@/components/pricing/PlanComparisonTable";
import { PlanCard } from "@/components/pricing/PlanCard";
import { pricingPlans } from "@/lib/site-data";

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-4xl font-bold">Pricing</h1>
        <p className="mt-3 text-stone-600">Core at ₹999/month and Premium at ₹2,999/month with Razorpay support for UPI, Net Banking, and Cards.</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {pricingPlans.map((plan) => <PlanCard key={plan.name} plan={plan} />)}
      </div>
      <PlanComparisonTable />
    </main>
  );
}
