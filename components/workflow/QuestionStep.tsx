"use client";

import { FormEvent, useId, useState } from "react";
import { ArrowRight, Compass, MapPin, Sparkles } from "lucide-react";

import { VisionSummary } from "@/components/cards/VisionSummary";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { VisionScene } from "@/types/vision";

interface QuestionStepProps {
  scene: VisionScene | null;
  suggestedPrompts: string[];
  destinationQuery: string;
  busy: boolean;
  onDestinationChange: (value: string) => void;
  onSubmit: (prompt: string, destinationQuery: string) => void;
}

export function QuestionStep({
  scene,
  suggestedPrompts,
  destinationQuery,
  busy,
  onDestinationChange,
  onSubmit
}: QuestionStepProps) {
  const [prompt, setPrompt] = useState("");
  const [formError, setFormError] = useState("");
  const questionId = useId();
  const destinationId = useId();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedPrompt = prompt.trim();
    const trimmedDestination = destinationQuery.trim();
    const routePrompt = trimmedDestination
      ? `What is the best way to get to ${trimmedDestination}?`
      : "";
    const resolvedPrompt = trimmedPrompt || routePrompt;

    if (trimmedDestination && (trimmedDestination.length < 2 || trimmedDestination.length > 160)) {
      setFormError("Use a destination between 2 and 160 characters.");
      return;
    }

    if (!resolvedPrompt) {
      setFormError("Ask a question, add a destination, or do both before continuing.");
      return;
    }

    setFormError("");
    onSubmit(resolvedPrompt, trimmedDestination);
  };

  return (
    <section aria-labelledby="ask-step-title" className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Step 03</p>
        <h1
          id="ask-step-title"
          tabIndex={-1}
          className="mt-3 text-3xl font-semibold tracking-tight outline-none md:text-4xl"
        >
          Turn the scene into a useful decision
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
          Ask what you need next. Add a destination when you want route-aware guidance.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.94fr)_minmax(380px,1.06fr)]">
        <VisionSummary scene={scene} />

        <form onSubmit={handleSubmit} className="skeuo-surface rounded-[30px] p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Sparkles className="size-5" aria-hidden />
            </span>
            <div>
              <h2 className="text-lg font-semibold">What would help right now?</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                CityMind combines your question with the scene and selected mobility context.
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <label htmlFor={questionId} className="block">
              <span className="mb-2 block text-sm font-medium">Your question</span>
              <Textarea
                id={questionId}
                value={prompt}
                onChange={(event) => {
                  setPrompt(event.target.value);
                  if (formError) {
                    setFormError("");
                  }
                }}
                disabled={busy || !scene}
                placeholder="For example: Which entrance is easiest with luggage?"
                aria-describedby={`${questionId}-help`}
              />
              <span
                id={`${questionId}-help`}
                className="mt-2 block text-xs leading-5 text-muted-foreground"
              >
                You can keep it short. CityMind already has the scene context.
              </span>
            </label>

            <label htmlFor={destinationId} className="block">
              <span className="mb-2 flex items-center gap-2 text-sm font-medium">
                <MapPin className="size-4 text-primary" aria-hidden />
                Destination <span className="font-normal text-muted-foreground">(optional)</span>
              </span>
              <Input
                id={destinationId}
                value={destinationQuery}
                onChange={(event) => {
                  onDestinationChange(event.target.value);
                  if (formError) {
                    setFormError("");
                  }
                }}
                disabled={busy || !scene}
                placeholder="e.g. Fort Kochi ferry"
                autoComplete="off"
                minLength={2}
                maxLength={160}
                aria-describedby={`${destinationId}-help`}
              />
              <span
                id={`${destinationId}-help`}
                className="mt-2 block text-xs leading-5 text-muted-foreground"
              >
                Add a specific place name when a route would be helpful.
              </span>
            </label>
          </div>

          {formError ? (
            <p
              className="mt-4 rounded-2xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
              role="alert"
            >
              {formError}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2" aria-label="Suggested questions">
            {suggestedPrompts.slice(0, 4).map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                disabled={busy || !scene}
                onClick={() => setPrompt(suggestion)}
                className="skeuo-chip"
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-muted-foreground">
              {destinationQuery.trim()
                ? "CityMind will resolve this destination before preparing the route context."
                : "Add a destination only when route context would help."}
            </p>
            <Button type="submit" size="lg" disabled={busy || !scene}>
              <Compass aria-hidden />
              {busy ? "Preparing guidance" : "Get guidance"}
              <ArrowRight aria-hidden />
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
}
