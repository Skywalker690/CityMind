export type PersonaId =
  | "daily-commuter"
  | "tourist"
  | "elderly"
  | "wheelchair"
  | "luggage";

export interface PersonaDefinition {
  id: PersonaId;
  label: string;
  shortLabel: string;
  description: string;
  priorities: string[];
  promptContext: string;
}
