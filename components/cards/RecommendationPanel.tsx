"use client";

import { ArrowUpRight, Lightbulb, MapPin, MessageSquareText } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { RecommendationCard } from "@/components/cards/RecommendationCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { NearbyPlace, ReasoningResult, Recommendation } from "@/types/recommendation";

interface RecommendationPanelProps {
  result: ReasoningResult | null;
  onRecommendationAction?: (recommendation: Recommendation) => void;
  onNearbyPlaceSelect?: (place: NearbyPlace) => void;
  nearbyPlaceDisabled?: boolean;
}

export function RecommendationPanel({
  result,
  onRecommendationAction,
  onNearbyPlaceSelect,
  nearbyPlaceDisabled = false
}: RecommendationPanelProps) {
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
          <RecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            onAction={onRecommendationAction}
          />
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
              <p className="font-medium">Verify before you go</p>
              <ul className="mt-2 space-y-1">
                {result.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </CardContent>
      </Card>
      {result.nearbyPlaces.length ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="size-4 text-primary" aria-hidden />
              Nearby places to consider
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              These suggestions are contextual starting points—ask CityMind before relying on them.
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {result.nearbyPlaces.map((place) => (
                <li
                  key={`${place.name}-${place.type}`}
                  className="flex flex-col gap-3 rounded-md border bg-background/70 p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{place.name}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {place.type} / {place.reason}
                    </p>
                  </div>
                  {onNearbyPlaceSelect ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="shrink-0 self-start sm:self-auto"
                      onClick={() => onNearbyPlaceSelect(place)}
                      disabled={nearbyPlaceDisabled}
                    >
                      Ask CityMind
                      <ArrowUpRight aria-hidden />
                    </Button>
                  ) : null}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}
