import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="rounded-[28px] bg-gradient-to-r from-primary to-orange-500 px-6 py-12 text-white shadow-soft sm:px-10">
        <h2 className="text-3xl font-bold">Start Your Family Health Journey Today</h2>
        <p className="mt-3 max-w-2xl text-orange-50">One free test can reveal the habits holding your home back and unlock a practical plan your family can actually follow.</p>
        <div className="mt-6">
          <Button variant="secondary" asChild>
            <Link href="/fitness-test/start">Take Free Fitness Test</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
