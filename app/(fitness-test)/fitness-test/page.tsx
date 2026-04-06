import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FitnessTestIntroPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <div className="rounded-[28px] border bg-white p-8 shadow-soft">
        <h1 className="text-4xl font-bold">Free Family Fitness Test</h1>
        <p className="mt-4 text-stone-600">Answer 20 questions to identify your current fitness level, top priority, and practical next steps for your family.</p>
        <div className="mt-8">
          <Button asChild>
            <Link href="/fitness-test/start">Start Test</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
