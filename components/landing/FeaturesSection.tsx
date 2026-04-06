import { features } from "@/lib/site-data";

export function FeaturesSection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary">Features</p>
          <h2 className="mt-2 text-3xl font-bold">Designed for real Indian routines.</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <div key={feature} className="rounded-lg border bg-background p-6 shadow-soft">
              <h3 className="text-lg font-semibold">{feature}</h3>
              <p className="mt-2 text-sm text-stone-600">Built to work with Indian ingredients, shared schedules, regional habits, and family accountability.</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
