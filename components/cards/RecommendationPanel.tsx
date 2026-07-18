"use client";

import { Lightbulb, MessageSquareText } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { RecommendationCard } from "@/components/cards/RecommendationCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ReasoningResult } from "@/types/recommendation";

interface RecommendationPanelProps {
  result: ReasoningResult | null;
}

export function RecommendationPanel({ result }: RecommendationPanelProps) {
  if (!result) {
    return (
      <EmptyState
        icon={Lightbulb}
        title="No recommendation yet"
        description="After CityMind understands the scene, ask what you need and the reasoning engine will produce a recommendation."
      />
    );
  }

  return (
    <section aria-labelledby="recommendation-title" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="recommendation-title" className="text-xl font-semibold">
            Recommendation
          </h2>
          <p className="text-sm text-muted-foreground">Intent detected: {result.intent}</p>
        </div>
        <Badge variant="success">{Math.round(result.confidence * 100)}% overall</Badge>
      </div>
      <div className="space-y-4">
        {result.recommendations.map((recommendation) => (
          <RecommendationCard key={recommendation.id} recommendation={recommendation} />
        ))}
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquareText className="size-4 text-primary" aria-hidden />
            Why CityMind chose this
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm leading-6 text-muted-foreground">{result.reasoning}</p>
          {result.warnings.length ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
              {result.warnings.map((warning) => (
                <p key={warning}>{warning}</p>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    </section>
  );
}
