"use client";

import {
  ArrowRight,
  CheckCircle2,
  Compass,
  ShieldCheck,
  Sparkles
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { confidenceLabel } from "@/lib/utils";
import type { Recommendation } from "@/types/recommendation";

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAction?: (recommendation: Recommendation) => void;
}

const iconByCategory = {
  navigation: Compass,
  accessibility: ShieldCheck,
  exploration: Sparkles,
  safety: ShieldCheck,
  transport: Compass,
  "nearby-service": Sparkles
} satisfies Record<Recommendation["category"], typeof Compass>;

export function RecommendationCard({
  recommendation,
  onAction
}: RecommendationCardProps) {
  const Icon = iconByCategory[recommendation.category];

  return (
    <article className="rounded-lg border bg-card p-5 shadow-soft">
      <div className="flex items-start gap-4">
        <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-md bg-emerald-500 text-white">
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">{recommendation.title}</h3>
            <Badge
              variant={
                recommendation.confidence >= 0.78
                  ? "success"
                  : recommendation.confidence >= 0.5
                    ? "secondary"
                    : "warning"
              }
            >
              {confidenceLabel(recommendation.confidence)}
            </Badge>
          </div>
          <p className="mt-3 text-base font-medium leading-6">
            {recommendation.recommendation}
          </p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {recommendation.reason}
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {recommendation.benefits.map((benefit) => (
              <div
                key={benefit}
                className="flex items-start gap-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"
              >
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
            <p className="text-sm text-muted-foreground">
              Effort:{" "}
              <span className="font-medium text-foreground">
                {recommendation.estimatedEffort}
              </span>
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-auto min-h-9 whitespace-normal text-left"
              onClick={() => onAction?.(recommendation)}
              aria-label={`${recommendation.suggestedAction}: ${recommendation.title}`}
            >
              {recommendation.suggestedAction}
              <ArrowRight aria-hidden />
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
