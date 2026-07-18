"use client";

import { ChangeEvent, useRef, useState } from "react";
import Image from "next/image";
import { Camera, Check, ImageUp, RotateCcw, ScanLine, Sparkles, X } from "lucide-react";

import { AnalysisSteps } from "@/components/common/AnalysisSteps";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCamera } from "@/hooks/useCamera";

interface CameraCardProps {
  imagePreview: string | null;
  status: string;
  onImageSelected: (file: File) => void;
  onConfirm: () => void;
  onClear: () => void;
}

export function CameraCard({
  imagePreview,
  status,
  onImageSelected,
  onConfirm,
  onClear
}: CameraCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const camera = useCamera();
  const [demoError, setDemoError] = useState<string | null>(null);
  const analyzing = status === "analyzing" || status === "reasoning";
  const awaitingConfirmation = Boolean(imagePreview) && status === "image-ready";

  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      camera.stopCamera();
      setDemoError(null);
      onImageSelected(file);
      event.target.value = "";
    }
  };

  const handleCapture = async () => {
    const file = await camera.captureImage();

    if (file) {
      onImageSelected(file);
      camera.stopCamera();
    }
  };

  const handleDemoScene = async () => {
    setDemoError(null);

    try {
      const response = await fetch("/demo/metro-station.svg");

      if (!response.ok) {
        throw new Error("The demo scene is unavailable right now.");
      }

      const blob = await response.blob();
      const image = await loadImageFromBlob(blob);
      const canvas = document.createElement("canvas");
      canvas.width = 1200;
      canvas.height = 900;
      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Your browser could not prepare the demo image.");
      }

      context.fillStyle = "#e2e8f0";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const jpegBlob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob(resolve, "image/jpeg", 0.92);
      });

      if (!jpegBlob) {
        throw new Error("Your browser could not prepare the demo image.");
      }

      onImageSelected(
        new File([jpegBlob], "citymind-demo-metro-station.jpg", {
          type: "image/jpeg"
        })
      );
    } catch (error) {
      setDemoError(
        error instanceof Error
          ? error.message
          : "Unable to load the demo scene. Please try again or upload a photo."
      );
    }
  };

  const handleRetake = () => {
    setDemoError(null);
    onClear();
    void camera.startCamera();
  };

  return (
    <Card id="capture-workflow" tabIndex={-1} className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle>Capture Surroundings</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Camera-first context for urban reasoning.
            </p>
          </div>
          {imagePreview ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onClear}
              aria-label="Discard selected image"
            >
              <X aria-hidden />
            </Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg border bg-secondary">
          {imagePreview ? (
            <>
              <Image
                src={imagePreview}
                alt="Selected urban scene preview"
                fill
                unoptimized
                sizes="(min-width: 1280px) 340px, (min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
              {awaitingConfirmation ? (
                <div className="absolute inset-x-3 bottom-3 rounded-md border border-white/40 bg-slate-950/75 p-3 text-sm text-white shadow-soft backdrop-blur-sm">
                  <p className="font-medium">Photo ready to review</p>
                  <p className="mt-1 text-slate-200">
                    Check that the entrance, signs, or path are visible before analysis.
                  </p>
                </div>
              ) : null}
            </>
          ) : camera.status === "ready" ? (
            <video
              ref={camera.videoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="city-grid flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <ScanLine className="size-10 text-primary" aria-hidden />
              <div>
                <p className="font-medium">No image selected yet.</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Capture or upload a metro station, street, or urban access point.
                </p>
              </div>
            </div>
          )}
          {analyzing ? (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="rounded-lg border bg-card px-4 py-3 text-sm font-medium shadow-soft">
                Understanding your surroundings...
              </div>
            </div>
          ) : null}
        </div>

        {camera.error || demoError ? (
          <p className="text-sm text-amber-600 dark:text-amber-300">{camera.error ?? demoError}</p>
        ) : null}

        <div className="flex flex-wrap gap-3">
          {imagePreview ? (
            <>
              {awaitingConfirmation ? (
                <Button type="button" onClick={onConfirm}>
                  <Check aria-hidden />
                  Confirm and analyze
                </Button>
              ) : null}
              <Button type="button" variant="outline" onClick={handleRetake} disabled={analyzing}>
                <RotateCcw aria-hidden />
                Retake
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => inputRef.current?.click()}
                disabled={analyzing}
              >
                <ImageUp aria-hidden />
                Choose another
              </Button>
            </>
          ) : camera.status === "ready" ? (
            <Button type="button" onClick={handleCapture}>
              <Camera aria-hidden />
              Capture photo
            </Button>
          ) : (
            <Button type="button" onClick={camera.startCamera}>
              <Camera aria-hidden />
              Open Camera
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={Boolean(imagePreview)}
          >
            <ImageUp aria-hidden />
            Upload
          </Button>
          <Button type="button" variant="secondary" onClick={handleDemoScene}>
            <Sparkles aria-hidden />
            Use Demo Scene
          </Button>
          {camera.status === "ready" ? (
            <Button type="button" variant="ghost" onClick={camera.stopCamera}>
              <RotateCcw aria-hidden />
              Stop
            </Button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleUpload}
        />
        <AnalysisSteps
          active={analyzing}
          complete={status === "scene-ready" || status === "ready"}
        />
      </CardContent>
    </Card>
  );
}

function loadImageFromBlob(blob: Blob) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to load demo scene."));
    };
    image.src = url;
  });
}
