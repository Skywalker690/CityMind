"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function CityMindError({
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <section
        className="w-full max-w-lg rounded-lg border border-amber-200 bg-card p-6 text-center shadow-panel dark:border-amber-900"
        role="alert"
      >
        <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
          <AlertTriangle className="size-6" aria-hidden />
        </span>
        <h1 className="mt-4 text-xl font-semibold">CityMind hit a detour</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Your current screen could not load. Try again to return to your urban guidance workflow.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Button type="button" onClick={reset}>
            <RefreshCw aria-hidden />
            Try again
          </Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/">Return to CityMind</Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
