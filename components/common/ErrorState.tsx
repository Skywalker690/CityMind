"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  retryLabel?: string;
  retryDescription?: string;
  onRetry?: () => void;
}

export function ErrorState({
  message,
  retryLabel = "Try again",
  retryDescription,
  onRetry
}: ErrorStateProps) {
  return (
    <div
      className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0" aria-hidden />
        <div className="min-w-0 flex-1">
          <p className="font-medium">CityMind needs another try</p>
          <p className="mt-1 text-sm opacity-90">{message}</p>
          {retryDescription ? (
            <p className="mt-2 text-sm opacity-90">{retryDescription}</p>
          ) : null}
          {onRetry ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 border-amber-300 bg-white/70 text-amber-950 hover:bg-white dark:bg-amber-950/20 dark:text-amber-100"
              onClick={onRetry}
            >
              <RotateCcw aria-hidden />
              {retryLabel}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
