"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BrainCircuit, LocateFixed, Moon, Sparkles, Sun } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { ErrorState } from "@/components/common/ErrorState";
import { ActStep } from "@/components/workflow/ActStep";
import { CaptureStep } from "@/components/workflow/CaptureStep";
import { ConfirmStep } from "@/components/workflow/ConfirmStep";
import { QuestionStep } from "@/components/workflow/QuestionStep";
import {
  WORKFLOW_STEPS,
  WorkflowStepper,
  type WorkflowStepId
} from "@/components/workflow/WorkflowStepper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCityMind } from "@/hooks/useCityMind";
import { cn } from "@/lib/utils";
import type { NearbyPlace, Recommendation } from "@/types/recommendation";

type ThemeMode = "light" | "dark";

const stepIndex = Object.fromEntries(
  WORKFLOW_STEPS.map((step, index) => [step.id, index])
) as Record<WorkflowStepId, number>;

const headingIdByStep: Record<WorkflowStepId, string> = {
  capture: "capture-step-title",
  confirm: "confirm-step-title",
  plan: "ask-step-title",
  act: "act-step-title"
};

export function CityMindApp() {
  const cityMind = useCityMind();
  const reduceMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState<WorkflowStepId>("capture");
  const [destinationQuery, setDestinationQuery] = useState("");
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [actionNotice, setActionNotice] = useState("");
  const workflowStageRef = useRef<HTMLElement>(null);
  const previousStepRef = useRef<WorkflowStepId>("capture");
  const busy =
    cityMind.status === "analyzing" ||
    cityMind.status === "reasoning" ||
    cityMind.status === "chatting";
  const availableStepIndex = useMemo(() => {
    if (cityMind.result) {
      return 3;
    }

    if (cityMind.scene) {
      return 2;
    }

    if (cityMind.imagePreview) {
      return 1;
    }

    return 0;
  }, [cityMind.imagePreview, cityMind.result, cityMind.scene]);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("citymind-theme");

    if (savedTheme === "light" || savedTheme === "dark") {
      setTheme(savedTheme);
      return;
    }

    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("citymind-theme", theme);
  }, [theme]);

  useEffect(() => {
    if (!cityMind.imagePreview) {
      setActiveStep("capture");
      return;
    }

    if (cityMind.status === "image-ready" || cityMind.status === "analyzing") {
      setActiveStep("confirm");
      return;
    }

    if (cityMind.status === "scene-ready" || cityMind.status === "reasoning") {
      setActiveStep("plan");
      return;
    }

    if (cityMind.status === "ready" || cityMind.status === "chatting") {
      setActiveStep("act");
    }
  }, [cityMind.imagePreview, cityMind.status]);

  useEffect(() => {
    setDestinationQuery("");
  }, [cityMind.imagePreview]);

  useEffect(() => {
    if (previousStepRef.current === activeStep) {
      return;
    }

    previousStepRef.current = activeStep;
    const delay = reduceMotion ? 0 : 260;
    const timer = window.setTimeout(() => {
      const heading = document.getElementById(headingIdByStep[activeStep]);
      (heading ?? workflowStageRef.current)?.focus({ preventScroll: true });
    }, delay);

    return () => window.clearTimeout(timer);
  }, [activeStep, reduceMotion]);

  const setStep = (step: WorkflowStepId) => {
    if (stepIndex[step] <= availableStepIndex) {
      setActiveStep(step);
      setActionNotice(`Showing step ${stepIndex[step] + 1}: ${step}.`);
    }
  };

  const handleQuestionSubmit = (prompt: string, destination: string) => {
    void cityMind.submitPrompt(prompt, cityMind.persona, true, destination || undefined);
    setActionNotice("CityMind is preparing guidance from your confirmed scene and question.");
  };

  const handleRecommendationAction = (recommendation: Recommendation) => {
    const routeAction =
      ["navigation", "accessibility", "transport"].includes(recommendation.category) ||
      /map|route|direction/i.test(recommendation.suggestedAction);
    setActionNotice(
      routeAction
        ? `Route context is in focus for ${recommendation.title.toLowerCase()}.`
        : `Conversation is in focus for ${recommendation.title.toLowerCase()}.`
    );
  };

  const handleNearbyPlace = (place: NearbyPlace) => {
    void cityMind.sendChatMessage(`What should I know before visiting ${place.name}?`);
    setActionNotice(`Asking CityMind about ${place.name}.`);
  };

  const panelMotion = reduceMotion
    ? { initial: false, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -6 }
      };

  return (
    <main className="citymind-app min-h-screen bg-background text-foreground">
      <a
        href="#workflow-stage"
        className="sr-only fixed left-4 top-4 z-50 rounded-2xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground focus:not-sr-only"
      >
        Skip to the active workflow step
      </a>

      <header className="border-b border-white/50 bg-background/80 backdrop-blur-xl dark:border-white/5">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <span className="skeuo-brand-mark" aria-hidden>
              <BrainCircuit className="size-5" />
            </span>
            <div>
              <p className="text-lg font-semibold tracking-tight">CityMind</p>
              <p className="text-xs text-muted-foreground">
                Urban guidance, one decision at a time
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <WorkflowStatusBadge status={cityMind.status} />
            <span
              className={cn(
                "skeuo-location hidden items-center gap-2 px-3 py-2 text-xs sm:inline-flex",
                cityMind.hasDeviceLocation && "text-emerald-700 dark:text-emerald-300"
              )}
            >
              <LocateFixed className="size-3.5" aria-hidden />
              {cityMind.hasDeviceLocation ? "Location ready" : "Location optional"}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            >
              {theme === "light" ? <Moon aria-hidden /> : <Sun aria-hidden />}
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1440px] gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8 lg:py-8">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <WorkflowStepper
            activeStep={activeStep}
            availableStepIndex={availableStepIndex}
            onStepChange={setStep}
          />
        </aside>

        <section
          id="workflow-stage"
          ref={workflowStageRef}
          tabIndex={-1}
          className="skeuo-workspace min-w-0 rounded-[34px] p-4 outline-none sm:p-6 lg:p-8"
        >
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-5">
            <div className="flex items-center gap-2">
              <span className="skeuo-progress-number">
                {String(stepIndex[activeStep] + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                {WORKFLOW_STEPS[stepIndex[activeStep]].label} stage
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="size-3.5 text-primary" aria-hidden />
              Your context stays with you
            </div>
          </div>

          {cityMind.error ? (
            <div className="mb-6">
              <ErrorState
                message={cityMind.error}
                retryLabel={cityMind.retryDetails.label}
                retryDescription={cityMind.retryDetails.description}
                onRetry={cityMind.retry}
              />
            </div>
          ) : null}

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeStep}
              {...panelMotion}
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
            >
              {activeStep === "capture" ? (
                <CaptureStep
                  imagePreview={cityMind.imagePreview}
                  status={cityMind.status}
                  onImageSelected={cityMind.selectImage}
                  onClear={cityMind.clearImage}
                  onContinue={() => setStep("confirm")}
                />
              ) : null}

              {activeStep === "confirm" ? (
                <ConfirmStep
                  imagePreview={cityMind.imagePreview}
                  persona={cityMind.persona}
                  status={cityMind.status}
                  permissionState={cityMind.permissionState}
                  onPersonaChange={cityMind.selectPersona}
                  onAnalyze={cityMind.confirmImage}
                  onRequestLocation={cityMind.requestLocation}
                  onBackToCapture={() => {
                    cityMind.clearImage();
                    setActiveStep("capture");
                  }}
                />
              ) : null}

              {activeStep === "plan" ? (
                <QuestionStep
                  scene={cityMind.scene}
                  suggestedPrompts={cityMind.suggestedPrompts}
                  destinationQuery={destinationQuery}
                  busy={busy}
                  onDestinationChange={setDestinationQuery}
                  onSubmit={handleQuestionSubmit}
                />
              ) : null}

              {activeStep === "act" ? (
                <ActStep
                  result={cityMind.result}
                  location={cityMind.location}
                  hasDeviceLocation={cityMind.hasDeviceLocation}
                  messages={cityMind.chatMessages}
                  suggestedPrompts={cityMind.suggestedPrompts}
                  busy={busy}
                  onRecommendationAction={handleRecommendationAction}
                  onNearbyPlaceSelect={handleNearbyPlace}
                  onSendMessage={(message) => void cityMind.sendChatMessage(message)}
                />
              ) : null}
            </motion.div>
          </AnimatePresence>
          {actionNotice ? (
            <p className="sr-only" role="status" aria-live="polite">
              {actionNotice}
            </p>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function WorkflowStatusBadge({ status }: { status: string }) {
  const labels: Record<string, string> = {
    idle: "Ready to capture",
    "image-ready": "Ready to confirm",
    analyzing: "Reading scene",
    "scene-ready": "Scene understood",
    reasoning: "Preparing guidance",
    ready: "Guidance ready",
    chatting: "Refining guidance",
    error: "Needs attention"
  };
  const active = ["analyzing", "reasoning", "chatting"].includes(status);

  return (
    <Badge
      variant={status === "error" ? "warning" : active ? "secondary" : "success"}
      className="gap-1.5 px-3 py-1.5"
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          status === "error"
            ? "bg-amber-950"
            : active
              ? "bg-primary animate-pulse"
              : "bg-emerald-950"
        )}
        aria-hidden
      />
      {labels[status] ?? "Ready"}
    </Badge>
  );
}
