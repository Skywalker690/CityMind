"use client";

import { Camera, Check, CircleCheckBig, Compass, MessageSquareText } from "lucide-react";

import { cn } from "@/lib/utils";

export const WORKFLOW_STEPS = [
  {
    id: "capture",
    label: "Capture",
    description: "Show your surroundings",
    icon: Camera
  },
  {
    id: "confirm",
    label: "Confirm",
    description: "Choose your mobility context",
    icon: CircleCheckBig
  },
  {
    id: "plan",
    label: "Ask",
    description: "Set your destination and intent",
    icon: MessageSquareText
  },
  {
    id: "act",
    label: "Act",
    description: "Review guidance and route",
    icon: Compass
  }
] as const;

export type WorkflowStepId = (typeof WORKFLOW_STEPS)[number]["id"];

interface WorkflowStepperProps {
  activeStep: WorkflowStepId;
  availableStepIndex: number;
  onStepChange: (step: WorkflowStepId) => void;
}

export function WorkflowStepper({
  activeStep,
  availableStepIndex,
  onStepChange
}: WorkflowStepperProps) {
  return (
    <nav aria-label="CityMind workflow" className="skeuo-rail p-3 sm:p-4">
      <div className="px-2 pb-4 pt-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          Your journey
        </p>
        <p className="mt-2 text-sm leading-5 text-muted-foreground">
          One thoughtful decision at a time.
        </p>
      </div>
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        {WORKFLOW_STEPS.map((step, index) => {
          const active = step.id === activeStep;
          const complete = index < availableStepIndex;
          const available = index <= availableStepIndex;
          const Icon = step.icon;

          return (
            <li key={step.id} className="relative">
              <button
                type="button"
                onClick={() => onStepChange(step.id)}
                disabled={!available}
                aria-current={active ? "step" : undefined}
                className={cn(
                  "skeuo-step group w-full text-left",
                  active && "skeuo-step-active",
                  !available && "cursor-not-allowed opacity-45"
                )}
              >
                <span
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold transition",
                    active
                      ? "bg-primary text-primary-foreground shadow-[inset_1px_1px_0_rgb(255_255_255_/_0.34),4px_4px_10px_rgb(37_99_235_/_0.28)]"
                      : complete
                        ? "bg-emerald-500 text-white"
                        : "skeuo-inset text-muted-foreground"
                  )}
                >
                  {complete ? (
                    <Check className="size-4" aria-hidden />
                  ) : (
                    <Icon className="size-4" aria-hidden />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{step.label}</span>
                  <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
                    {step.description}
                  </span>
                </span>
                <span className="ml-auto text-xs font-medium text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="skeuo-inset mx-2 mt-4 rounded-2xl p-3 text-xs leading-5 text-muted-foreground">
        Progress is saved while this browser tab stays open.
      </div>
    </nav>
  );
}
