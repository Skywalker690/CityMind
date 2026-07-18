"use client";

import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  LocateFixed,
  MapPin,
  ShieldCheck
} from "lucide-react";

import { AnalysisSteps } from "@/components/common/AnalysisSteps";
import { PersonaSelector } from "@/components/persona/PersonaSelector";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { WorkflowStatus } from "@/hooks/useCityMind";
import type { PersonaId } from "@/types/persona";

interface ConfirmStepProps {
  imagePreview: string | null;
  persona: PersonaId;
  status: WorkflowStatus;
  permissionState: "idle" | "loading" | "granted" | "denied" | "unavailable";
  onPersonaChange: (persona: PersonaId) => void;
  onAnalyze: () => void;
  onRequestLocation: () => void;
  onBackToCapture: () => void;
}

export function ConfirmStep({
  imagePreview,
  persona,
  status,
  permissionState,
  onPersonaChange,
  onAnalyze,
  onRequestLocation,
  onBackToCapture
}: ConfirmStepProps) {
  const analyzing = status === "analyzing";
  const processing = ["analyzing", "reasoning", "chatting"].includes(status);
  const canAnalyze = Boolean(imagePreview) && !processing;

  return (
    <section aria-labelledby="confirm-step-title" className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Step 02</p>
          <h1
            id="confirm-step-title"
            tabIndex={-1}
            className="mt-3 text-3xl font-semibold tracking-tight outline-none md:text-4xl"
          >
            Confirm what CityMind should consider
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
            Check the photo, choose the way you move, then start the scene analysis.
          </p>
        </div>
        <Button type="button" variant="ghost" onClick={onBackToCapture} disabled={processing}>
          <ArrowLeft aria-hidden />
          Change photo
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
        <div className="skeuo-inset flex flex-col rounded-[30px] p-3">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] bg-secondary">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt="Urban scene selected for CityMind analysis"
                fill
                unoptimized
                sizes="(min-width: 1280px) 38vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
                Return to Capture to select a photo before continuing.
              </div>
            )}
            {analyzing ? (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/55 p-6 text-center text-sm font-medium text-white backdrop-blur-sm">
                CityMind is reading the scene. Keep this step open while it works.
              </div>
            ) : null}
          </div>
          <div className="flex items-start gap-3 px-2 pb-1 pt-4 text-sm leading-6 text-muted-foreground">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-500" aria-hidden />
            <p>Make sure the relevant path, sign, entrance, or accessibility cue is visible.</p>
          </div>
        </div>

        <div className="space-y-5">
          <div className="skeuo-inset rounded-[28px] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Location context</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Optional. It helps CityMind orient routes near you.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRequestLocation}
                disabled={permissionState === "loading" || processing}
              >
                <LocateFixed aria-hidden />
                {permissionState === "granted"
                  ? "Location active"
                  : permissionState === "loading"
                    ? "Finding location"
                    : "Use location"}
              </Button>
            </div>
            <div
              className={cn(
                "mt-4 flex items-start gap-3 rounded-2xl border px-3 py-3 text-xs leading-5",
                permissionState === "granted"
                  ? "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-100"
                  : "border-border bg-background/50 text-muted-foreground"
              )}
            >
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                {permissionState === "granted"
                  ? "CityMind can use your device location as route context."
                  : permissionState === "denied"
                    ? "Location was not shared. CityMind will clearly label any reference-map route."
                    : "You can continue without sharing a device location."}
              </span>
            </div>
          </div>

          <div className="skeuo-surface rounded-[30px] p-5">
            <PersonaSelector value={persona} onChange={onPersonaChange} disabled={processing} />
          </div>
        </div>
      </div>

      <div className="skeuo-inset flex flex-col gap-4 rounded-[28px] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="size-5" aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold">Ready when you are</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              CityMind will return structured observations with confidence and verification notes.
            </p>
          </div>
        </div>
        <Button type="button" size="lg" onClick={onAnalyze} disabled={!canAnalyze}>
          {analyzing ? "Understanding scene" : "Analyze this scene"}
          <ArrowRight aria-hidden />
        </Button>
      </div>
      <AnalysisSteps active={analyzing} complete={status === "scene-ready" || status === "ready"} />
    </section>
  );
}
