"use client";

import { CheckCircle2, CircleDotDashed } from "lucide-react";

import { ANALYSIS_STEPS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface AnalysisStepsProps {
  active: boolean;
  complete?: boolean;
}

export function AnalysisSteps({ active, complete = false }: AnalysisStepsProps) {
  return (
    <div className="space-y-3" aria-live="polite">
      {ANALYSIS_STEPS.map((step, index) => {
        const done = complete || (active && index < 2);
        return (
          <div
            key={step}
            className={cn(
              "flex items-center gap-3 rounded-md border px-3 py-2 text-sm",
              done
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
                : "border-border bg-background text-muted-foreground"
            )}
          >
            {done ? (
              <CheckCircle2 className="size-4" aria-hidden />
            ) : (
              <CircleDotDashed
                className={cn("size-4", active && "animate-pulse text-primary")}
                aria-hidden
              />
            )}
            <span>{step}</span>
          </div>
        );
      })}
    </div>
  );
}
