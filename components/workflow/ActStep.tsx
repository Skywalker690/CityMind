"use client";

import { useRef } from "react";
import { MessageCircleMore, Navigation, Sparkles } from "lucide-react";

import { RecommendationPanel } from "@/components/cards/RecommendationPanel";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import { Badge } from "@/components/ui/badge";
import type { ChatMessage } from "@/types/chat";
import type { Coordinates } from "@/types/map";
import type { NearbyPlace, ReasoningResult, Recommendation } from "@/types/recommendation";

interface ActStepProps {
  result: ReasoningResult | null;
  location: Coordinates;
  hasDeviceLocation: boolean;
  messages: ChatMessage[];
  suggestedPrompts: string[];
  busy: boolean;
  onRecommendationAction: (recommendation: Recommendation) => void;
  onNearbyPlaceSelect: (place: NearbyPlace) => void;
  onSendMessage: (message: string) => void;
}

export function ActStep({
  result,
  location,
  hasDeviceLocation,
  messages,
  suggestedPrompts,
  busy,
  onRecommendationAction,
  onNearbyPlaceSelect,
  onSendMessage
}: ActStepProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);

  const focusRecommendationAction = (recommendation: Recommendation) => {
    onRecommendationAction(recommendation);
    const focusRoute =
      ["navigation", "accessibility", "transport"].includes(recommendation.category) ||
      /map|route|direction/i.test(recommendation.suggestedAction);
    const target = focusRoute ? mapRef.current : conversationRef.current;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center"
    });
    target?.focus({ preventScroll: true });
  };

  return (
    <section aria-labelledby="act-step-title" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Step 04</p>
          <h1
            id="act-step-title"
            tabIndex={-1}
            className="mt-3 text-3xl font-semibold tracking-tight outline-none md:text-4xl"
          >
            Make your next move with context
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            Review what CityMind found, inspect the route context, and ask for a clearer next step.
          </p>
        </div>
        <Badge variant="success" className="w-fit gap-1.5 px-3 py-1.5">
          <Sparkles className="size-3.5" aria-hidden />
          Guidance ready
        </Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
        <div className="skeuo-surface rounded-[30px] p-4 sm:p-6">
          <RecommendationPanel
            result={result}
            onRecommendationAction={focusRecommendationAction}
            onNearbyPlaceSelect={onNearbyPlaceSelect}
            nearbyPlaceDisabled={busy}
          />
        </div>

        <div ref={mapRef} tabIndex={-1} className="space-y-4 outline-none">
          <div className="flex items-center gap-2 px-1">
            <Navigation className="size-4 text-primary" aria-hidden />
            <h2 className="text-sm font-semibold">Route context</h2>
          </div>
          <InteractiveMap
            route={result?.route}
            location={location}
            hasDeviceLocation={hasDeviceLocation}
          />
        </div>
      </div>

      <div
        ref={conversationRef}
        tabIndex={-1}
        className="skeuo-surface rounded-[30px] p-4 outline-none sm:p-6"
      >
        <div className="mb-4 flex items-center gap-2 px-1">
          <MessageCircleMore className="size-4 text-primary" aria-hidden />
          <h2 className="text-sm font-semibold">Refine the decision</h2>
        </div>
        <ChatPanel
          messages={messages}
          suggestedPrompts={suggestedPrompts}
          disabled={busy || !result}
          loading={busy}
          onSend={onSendMessage}
          onPromptSelect={onSendMessage}
        />
      </div>
    </section>
  );
}
