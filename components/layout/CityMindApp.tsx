"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  LocateFixed,
  MapPin,
  MapPinned,
  Moon,
  Route as RouteIcon,
  Sparkles,
  Sun,
  WifiOff
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { CameraCard } from "@/components/camera/CameraCard";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { ErrorState } from "@/components/common/ErrorState";
import { PersonaSelector } from "@/components/persona/PersonaSelector";
import { RecommendationPanel } from "@/components/cards/RecommendationPanel";
import { VisionSummary } from "@/components/cards/VisionSummary";
import { InteractiveMap } from "@/components/map/InteractiveMap";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCityMind } from "@/hooks/useCityMind";
import { getPersona } from "@/lib/personas";
import type { NearbyPlace, Recommendation } from "@/types/recommendation";

type ThemeMode = "light" | "dark";

export function CityMindApp() {
  const cityMind = useCityMind();
  const persona = getPersona(cityMind.persona);
  const reduceMotion = useReducedMotion();
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [actionNotice, setActionNotice] = useState("");
  const busy =
    cityMind.status === "analyzing" ||
    cityMind.status === "reasoning" ||
    cityMind.status === "chatting";
  const canAsk = Boolean(cityMind.scene) && !busy;
  const showOnboarding = !cityMind.imagePreview && !cityMind.scene;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const focusSection = (id: string, notice: string) => {
    const target = document.getElementById(id);

    if (!target) {
      return;
    }

    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center"
    });
    target.focus({ preventScroll: true });
    setActionNotice(notice);
  };

  const handlePrompt = (message: string) => {
    if (cityMind.result) {
      void cityMind.sendChatMessage(message);
      return;
    }

    void cityMind.submitPrompt(
      message,
      cityMind.persona,
      true,
      cityMind.lastDestinationQuery
    );
  };

  const handleRouteRequest = () => {
    const destination = cityMind.lastDestinationQuery.trim();

    if (!destination) {
      setActionNotice("Add a destination to prepare a route recommendation.");
      document.getElementById("destination-query-panel")?.focus();
      return;
    }

    void cityMind.submitPrompt(
      `What is the best route to ${destination}?`,
      cityMind.persona,
      true,
      destination
    );
    setActionNotice(`Preparing a recommendation for ${destination}.`);
  };

  const handleRecommendationAction = (recommendation: Recommendation) => {
    const shouldShowMap =
      ["navigation", "accessibility", "transport"].includes(
        recommendation.category
      ) || /map|route|direction/i.test(recommendation.suggestedAction);

    focusSection(
      shouldShowMap ? "map-panel" : "conversation-panel",
      shouldShowMap
        ? "Route details are now in view."
        : "You can ask CityMind a follow-up question below."
    );
  };

  const handleNearbyPlace = (place: NearbyPlace) => {
    handlePrompt(`What should I know before visiting ${place.name}?`);
    focusSection("conversation-panel", `Asking CityMind about ${place.name}.`);
  };

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  return (
    <main id="citymind-workflow" className="min-h-screen bg-background">
      <a
        href="#capture-workflow"
        className="sr-only fixed left-4 top-4 z-50 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only"
      >
        Skip to photo capture
      </a>

      <header className="border-b bg-card/80 backdrop-blur">
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
            <h1 className="mt-3 text-3xl font-semibold tracking-normal md:text-4xl">
              CityMind
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">
              Point at an urban scene, choose your context, and get an explained
              recommendation that adapts to how you move through the city.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={cityMind.status} />
            <Button
              type="button"
              variant="outline"
              onClick={cityMind.requestLocation}
              disabled={cityMind.permissionState === "loading"}
              className="gap-2"
            >
              {cityMind.permissionState === "denied" ? (
                <WifiOff aria-hidden />
              ) : (
                <LocateFixed aria-hidden />
              )}
              {cityMind.permissionState === "granted"
                ? "Location active"
                : cityMind.permissionState === "loading"
                  ? "Finding location"
                  : "Use location"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon aria-hidden /> : <Sun aria-hidden />}
            </Button>
          </div>
        </div>
      </header>

      {showOnboarding ? (
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.25 }}
          aria-labelledby="onboarding-title"
          className="border-b bg-gradient-to-br from-primary/10 via-background to-emerald-500/10"
        >
          <div className="mx-auto grid max-w-[1680px] gap-6 px-4 py-7 md:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
            <div>
              <p className="text-sm font-medium text-primary">Your urban copilot</p>
              <h2
                id="onboarding-title"
                className="mt-2 max-w-3xl text-2xl font-semibold tracking-normal md:text-3xl"
              >
                See the street first. Then decide with confidence.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                CityMind turns a photo, your mobility needs, and your destination
                into an explained next step—not just a generic route.
              </p>
              <Button
                type="button"
                className="mt-5"
                onClick={() =>
                  focusSection(
                    "capture-workflow",
                    "Start by capturing or uploading the urban scene around you."
                  )
                }
              >
                Start exploring
                <ArrowRight aria-hidden />
              </Button>
            </div>
            <ol className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1" aria-label="How CityMind works">
              <OnboardingStep number="1" title="Capture" description="Show CityMind your surroundings." />
              <OnboardingStep number="2" title="Confirm" description="Review the photo before AI analysis." />
              <OnboardingStep number="3" title="Act" description="Ask for the next best move." />
            </ol>
          </div>
        </motion.section>
      ) : null}

      <div className="mx-auto grid max-w-[1680px] gap-5 px-4 py-5 md:px-6 xl:grid-cols-[340px_minmax(0,1fr)_430px]">
        <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
          <PersonaSelector
            value={cityMind.persona}
            onChange={cityMind.selectPersona}
          />
          <CameraCard
            imagePreview={cityMind.imagePreview}
            status={cityMind.status}
            onImageSelected={cityMind.selectImage}
            onConfirm={cityMind.confirmImage}
            onClear={cityMind.clearImage}
          />
        </aside>

        <section aria-label="CityMind guidance" className="space-y-5">
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
            className="rounded-lg border bg-card p-5 shadow-soft"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-primary">
                  Active context: {persona.label}
                </p>
                <h2 className="mt-1 text-2xl font-semibold tracking-normal">
                  Vision -&gt; Context -&gt; Recommendation
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  CityMind combines the selected persona, scene understanding,
                  prompt intent, and route context before recommending what to do.
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

          <section
            aria-labelledby="destination-title"
            className="rounded-lg border bg-card p-5 shadow-soft"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 text-primary" aria-hidden />
                  <h2 id="destination-title" className="font-semibold">
                    Where are you heading?
                  </h2>
                </div>
                <p id="destination-help" className="mt-1 text-sm text-muted-foreground">
                  Add a destination and CityMind will use it when preparing the next route recommendation.
                </p>
              </div>
              <form
                className="flex w-full flex-col gap-2 sm:flex-row md:max-w-md"
                onSubmit={(event) => {
                  event.preventDefault();
                  handleRouteRequest();
                }}
              >
                <Input
                  id="destination-query-panel"
                  value={cityMind.lastDestinationQuery}
                  onChange={(event) => cityMind.setDestinationQuery(event.target.value)}
                  placeholder="e.g. Fort Kochi ferry"
                  aria-describedby="destination-help"
                  autoComplete="off"
                />
                <Button
                  type="submit"
                  disabled={!cityMind.scene || busy}
                  className="shrink-0"
                >
                  <RouteIcon aria-hidden />
                  {cityMind.status === "reasoning" ? "Planning" : "Plan route"}
                </Button>
              </form>
            </div>
          </section>

          {actionNotice ? (
            <p className="sr-only" aria-live="polite">
              {actionNotice}
            </p>
          ) : null}

          {cityMind.error ? (
            <ErrorState
              message={cityMind.error}
              retryLabel={cityMind.retryDetails.label}
              retryDescription={cityMind.retryDetails.description}
              onRetry={cityMind.retry}
            />
          ) : null}

          <VisionSummary scene={cityMind.scene} />
          <RecommendationPanel
            result={cityMind.result}
            onRecommendationAction={handleRecommendationAction}
            onNearbyPlaceSelect={handleNearbyPlace}
          />
        </section>

        <aside className="space-y-5 xl:sticky xl:top-5 xl:self-start">
          <section
            id="map-panel"
            tabIndex={-1}
            aria-label="Route and map details"
            className="space-y-3"
          >
            <InteractiveMap
              route={cityMind.result?.route}
              location={cityMind.location}
            />
            <p className="rounded-md border bg-background/70 px-3 py-2 text-xs leading-5 text-muted-foreground" aria-live="polite">
              {cityMind.result?.route
                ? "Route instructions and map controls are available above. Verify accessibility conditions on arrival."
                : "A route and turn-by-turn overview will appear here after CityMind prepares a recommendation."}
            </p>
          </section>
          <section id="conversation-panel" tabIndex={-1} aria-label="Conversation with CityMind">
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
          </section>
        </aside>
      </div>
    </main>
  );
}

function OnboardingStep({
  number,
  title,
  description
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <li className="rounded-lg border bg-card/80 p-3 shadow-soft">
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
        {number}
      </span>
      <p className="mt-2 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
    </li>
  );
}

function StatusBadge({ status }: { status: string }) {
  const labelByStatus: Record<string, string> = {
    idle: "Ready",
    "image-ready": "Review photo",
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
