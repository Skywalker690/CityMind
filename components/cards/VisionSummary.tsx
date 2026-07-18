"use client";

import { Building2, CheckCircle2, Eye, TriangleAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { confidenceLabel } from "@/lib/utils";
import type { VisionScene } from "@/types/vision";

interface VisionSummaryProps {
  scene: VisionScene | null;
}

export function VisionSummary({ scene }: VisionSummaryProps) {
  if (!scene) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Scene Understanding</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-dashed p-5 text-sm text-muted-foreground">
            Capture a scene to let CityMind identify infrastructure, landmarks, accessibility cues,
            and navigation context.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Scene Understanding</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{scene.sceneType}</p>
          </div>
          <Badge
            variant={
              scene.confidence >= 0.78
                ? "success"
                : scene.confidence >= 0.5
                  ? "secondary"
                  : "warning"
            }
          >
            {confidenceLabel(scene.confidence)} confidence
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm leading-6">{scene.summary}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <SummaryBlock icon={Building2} title="Landmarks">
            {scene.landmarks.length ? (
              <ul className="space-y-2">
                {scene.landmarks.slice(0, 4).map((landmark) => (
                  <li key={`${landmark.name}-${landmark.type}`} className="text-sm">
                    <span className="font-medium">{landmark.name}</span>
                    <span className="text-muted-foreground"> / {landmark.type}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No clear landmark found.</p>
            )}
          </SummaryBlock>

          <SummaryBlock icon={CheckCircle2} title="Accessibility">
            <ul className="space-y-2">
              {scene.accessibility.slice(0, 3).map((item) => (
                <li key={item.label} className="text-sm">
                  <span className="font-medium">{item.label}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    /{" "}
                    {item.available === null
                      ? "verify"
                      : item.available
                        ? "visible"
                        : "not visible"}
                  </span>
                </li>
              ))}
            </ul>
          </SummaryBlock>
        </div>

        {scene.warnings.length ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
            <div className="mb-2 flex items-center gap-2 font-medium">
              <TriangleAlert className="size-4" aria-hidden />
              Verify
            </div>
            <ul className="space-y-1">
              {scene.warnings.slice(0, 3).map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

interface SummaryBlockProps {
  icon: typeof Eye;
  title: string;
  children: React.ReactNode;
}

function SummaryBlock({ icon: Icon, title, children }: SummaryBlockProps) {
  return (
    <div className="rounded-lg border bg-background/70 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-medium">
        <Icon className="size-4 text-primary" aria-hidden />
        {title}
      </div>
      {children}
    </div>
  );
}
