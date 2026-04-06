"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="max-w-md rounded-lg border bg-white p-8 text-center shadow-soft">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="mt-3 text-sm text-stone-600">The page hit an unexpected issue. Try reloading this section.</p>
          <Button className="mt-6" onClick={reset}>Try again</Button>
        </div>
      </body>
    </html>
  );
}
