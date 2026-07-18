"use client";

import { BrainCircuit, LocateFixed, MapPinned, Sparkles, WifiOff } from "lucide-react";
import { motion } from "framer-motion";

import { CameraCard } from "@/components/camera/CameraCard";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ErrorState } from "@/components/common/ErrorState";
import { PersonaSelector } from "@/components/persona/PersonaSelector";
import { RecommendationPanel } from "@/components/cards/RecommendationPanel";
import { VisionSummary } from "@/components/cards/VisionSummary";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCityMind } from "@/hooks/useCityMind";
import { getPersona } from "@/lib/personas";

export function CityMindApp() {
  const cityMind = useCityMind();
  const persona = getPersona(cityMind.persona);
  const busy =
    cityMind.status === "analyzing" ||
    cityMind.status === "reasoning" ||
    cityMind.status === "chatting";
  const canAsk = Boolean(cityMind.scene) && !busy;

  const handlePrompt = (message: string) => {
    if (cityMind.result) {
      void cityMind.sendChatMessage(message);
    } else {
      void cityMind.submitPrompt(message, cityMind.persona, true, cityMind.lastDestinationQuery);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b bg-card/70 backdrop-blur">
        <div className="mx-auto flex max-w-[1680px] flex-col gap-5 px-4 py-5 md:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <BrainCircuit className="size-3.5" aria-hidden />
                AI Urban Reasoning
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Sparkles className="size-3.5" aria-hidden />
                Vision-first
              </Badge>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal md:text-4xl">CityMind</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              Point at an urban scene, choose your context, and get an explained recommendation that
              adapts to how you move through the city.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={cityMind.status} />
            <Button
              type="button"
              variant="outline"
              onClick={cityMind.requestLocation}
              className="gap-2"
            >
              {cityMind.permissionState === "denied" ? (
                <WifiOff aria-hidden />
              ) : (
                <LocateFixed aria-hidden />
              )}
              {cityMind.permissionState === "granted" ? "Location active" : "Use location"}
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1680px] gap-5 px-4 py-5 md:px-6 xl:grid-cols-[340px_minmax(0,1fr)_430px]">
        <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
          <PersonaSelector value={cityMind.persona} onChange={cityMind.selectPersona} />
          <CameraCard
            imagePreview={cityMind.imagePreview}
            status={cityMind.status}
            onImageSelected={cityMind.selectImage}
            onConfirm={cityMind.confirmImage}
            onClear={cityMind.clearImage}
          />
        </aside>

        <section className="space-y-5">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="rounded-lg border bg-card p-5 shadow-soft"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-primary">Active context: {persona.label}</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-normal">
                  Vision -&gt; Context -&gt; Recommendation
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  CityMind combines the selected persona, scene understanding, prompt intent, and
                  route context before recommending what to do.
                </p>
              </div>
              <div className="rounded-lg border bg-background/70 p-3 text-sm">
                <div className="flex items-center gap-2 font-medium">
                  <MapPinned className="size-4 text-emerald-500" aria-hidden />
                  Persona priorities
                </div>
                <p className="mt-1 max-w-xs text-muted-foreground">
                  {persona.priorities.join(" / ")}
                </p>
              </div>
            </div>
          </motion.div>

          {cityMind.error ? <ErrorState message={cityMind.error} onRetry={cityMind.retry} /> : null}

          <VisionSummary scene={cityMind.scene} />
          <RecommendationPanel result={cityMind.result} />
        </section>

        <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
          <InteractiveMap route={cityMind.result?.route} location={cityMind.location} />
          <ChatPanel
            messages={cityMind.chatMessages}
            suggestedPrompts={cityMind.suggestedPrompts}
            destinationQuery={cityMind.lastDestinationQuery}
            disabled={!canAsk}
            loading={cityMind.status === "chatting" || cityMind.status === "reasoning"}
            onDestinationChange={cityMind.setDestinationQuery}
            onSend={handlePrompt}
            onPromptSelect={handlePrompt}
          />
        </aside>
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labelByStatus: Record<string, string> = {
    idle: "Ready",
    "image-ready": "Image selected",
    analyzing: "Analyzing scene",
    "scene-ready": "Scene understood",
    reasoning: "Reasoning",
    ready: "Recommendation ready",
    chatting: "Conversation",
    error: "Needs attention"
  };

  const active = status === "analyzing" || status === "reasoning" || status === "chatting";

  return (
    <Badge variant={status === "error" ? "warning" : active ? "secondary" : "success"}>
      {labelByStatus[status] ?? "Ready"}
    </Badge>
  );
}
