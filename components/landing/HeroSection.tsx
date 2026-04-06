import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="bg-grid relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
        <div className="space-y-6">
          <div className="inline-flex rounded-pill bg-accent px-4 py-2 text-sm font-medium text-orange-700">India&apos;s First Family Fitness Platform</div>
          <div className="space-y-4">
            <h1 className="max-w-xl text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">India&apos;s First Family Fitness Platform</h1>
            <p className="max-w-xl text-lg text-stone-600">Personalised home workouts + Indian nutrition plans for your entire family. No gym needed.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/fitness-test/start">Take Free Fitness Test</Link>
            </Button>
            <Button variant="secondary" asChild>
              <Link href="/pricing">See Plans</Link>
            </Button>
          </div>
        </div>
        <div className="relative h-[360px] overflow-hidden rounded-[28px] border bg-white shadow-soft">
          <Image src="https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80" alt="Indian family exercising at home" fill className="object-cover" priority />
        </div>
      </div>
    </section>
  );
}
