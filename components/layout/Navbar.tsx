import Link from "next/link";
import { Button } from "@/components/ui/button";
import { navLinks } from "@/lib/site-data";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-bold text-primary">FitFamily India</Link>
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm text-muted-foreground transition hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>
        <Button asChild>
          <Link href="/fitness-test/start">Start Free Test</Link>
        </Button>
      </div>
    </header>
  );
}
