"use client";

import { Accessibility, Briefcase, Map, Route, UserRoundCheck } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { PERSONAS } from "@/lib/personas";
import { cn } from "@/lib/utils";
import type { PersonaId } from "@/types/persona";

interface PersonaSelectorProps {
  value: PersonaId;
  onChange: (value: PersonaId) => void;
  disabled?: boolean;
}

const iconByPersona = {
  tourist: Map,
  "daily-commuter": Route,
  elderly: UserRoundCheck,
  wheelchair: Accessibility,
  luggage: Briefcase
} satisfies Record<PersonaId, typeof Map>;

export function PersonaSelector({ value, onChange, disabled = false }: PersonaSelectorProps) {
  return (
    <section aria-labelledby="persona-title" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 id="persona-title" className="text-base font-semibold">
            Persona
          </h2>
          <p className="text-sm text-muted-foreground">Recommendations adapt when this changes.</p>
        </div>
        <Badge variant="secondary">Context</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        {PERSONAS.map((persona) => {
          const selected = value === persona.id;
          const Icon = iconByPersona[persona.id];
          return (
            <button
              key={persona.id}
              type="button"
              onClick={() => onChange(persona.id)}
              disabled={disabled}
              aria-pressed={selected}
              className={cn(
                "rounded-lg border bg-card p-3 text-left transition hover:border-primary/60 hover:shadow-soft disabled:cursor-not-allowed disabled:opacity-60",
                selected ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border"
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "inline-flex size-9 shrink-0 items-center justify-center rounded-md",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{persona.label}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                    {persona.description}
                  </span>
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
