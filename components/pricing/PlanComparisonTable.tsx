import { pricingPlans } from "@/lib/site-data";

export function PlanComparisonTable() {
  return (
    <div className="overflow-x-auto rounded-lg border bg-white shadow-soft">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-muted">
          <tr>
            <th className="p-4">Plan</th>
            <th className="p-4">Best for</th>
            <th className="p-4">Headline feature</th>
          </tr>
        </thead>
        <tbody>
          {pricingPlans.map((plan) => (
            <tr key={plan.name} className="border-t">
              <td className="p-4 font-medium">{plan.name}</td>
              <td className="p-4">{plan.description}</td>
              <td className="p-4">{plan.features[0]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
