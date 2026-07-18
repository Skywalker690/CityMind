"use client";

import Image from "next/image";
import { ArrowRight, ImageUp, ScanLine } from "lucide-react";

import { CameraCard } from "@/components/camera/CameraCard";
import { Button } from "@/components/ui/button";
import type { WorkflowStatus } from "@/hooks/useCityMind";

interface CaptureStepProps {
  imagePreview: string | null;
  status: WorkflowStatus;
  onImageSelected: (file: File) => void;
  onClear: () => void;
  onContinue: () => void;
}

export function CaptureStep({
  imagePreview,
  status,
  onImageSelected,
  onClear,
  onContinue
}: CaptureStepProps) {
  if (imagePreview) {
    return (
      <section aria-labelledby="capture-step-title" className="space-y-6">
        <StepHeading
          eyebrow="Step 01"
          title="Your scene is captured"
          description="Keep this photo or replace it before CityMind reads the urban context."
        />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)] lg:items-center">
          <div className="skeuo-inset relative aspect-[4/3] overflow-hidden rounded-[28px] p-2">
            <Image
              src={imagePreview}
              alt="Selected urban scene ready for confirmation"
              fill
              unoptimized
              sizes="(min-width: 1024px) 56vw, 100vw"
              className="rounded-[22px] object-cover"
            />
          </div>
          <div className="skeuo-inset rounded-[28px] p-5">
            <ScanLine className="size-8 text-primary" aria-hidden />
            <h2 id="capture-step-title" className="mt-4 text-xl font-semibold">
              Ready for a closer look
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Next, tell CityMind how you are moving through the city and approve the analysis.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button type="button" onClick={onContinue}>
                Continue to confirm
                <ArrowRight aria-hidden />
              </Button>
              <Button type="button" variant="outline" onClick={onClear}>
                <ImageUp aria-hidden />
                Replace photo
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="capture-step-title" className="space-y-6">
      <StepHeading
        eyebrow="Step 01"
        title="Capture the moment that matters"
        description="Start with the entrance, path, sign, or street decision in front of you."
      />
      <CameraCard
        imagePreview={imagePreview}
        status={status}
        onImageSelected={onImageSelected}
        onConfirm={() => undefined}
        onClear={onClear}
        showConfirmationAction={false}
      />
    </section>
  );
}

export function StepHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
      <h1
        id="capture-step-title"
        tabIndex={-1}
        className="mt-3 text-3xl font-semibold tracking-tight outline-none md:text-4xl"
      >
        {title}
      </h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
        {description}
      </p>
    </div>
  );
}
