import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <div className="text-lg font-semibold text-primary">FitFamily India</div>
          <p className="mt-2 text-sm text-muted-foreground">India&apos;s First Family Fitness & Nutrition Platform.</p>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <Link href="/pricing" className="block transition hover:text-foreground">Pricing</Link>
          <Link href="/community/myths" className="block transition hover:text-foreground">Nutrition Myths</Link>
          <Link href="/workouts/morning-routine" className="block transition hover:text-foreground">Morning Routine</Link>
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div>Instagram</div>
          <div>YouTube</div>
          <div>Language: EN | HI</div>
        </div>
      </div>
    </footer>
  );
}
