import type { PersonaDefinition, PersonaId } from "@/types/persona";

export const PERSONAS: PersonaDefinition[] = [
  {
    id: "tourist",
    label: "Tourist",
    shortLabel: "Tourist",
    description: "Simple guidance, landmarks, nearby places, and confidence in unfamiliar areas.",
    priorities: ["simplicity", "landmarks", "nearby attractions", "clear explanation"],
    promptContext:
      "The user is a tourist. Prioritize simple instructions, recognizable landmarks, nearby useful places, and explanations that reduce uncertainty."
  },
  {
    id: "daily-commuter",
    label: "Daily Commuter",
    shortLabel: "Commuter",
    description: "Fast decisions, fewer transfers, and efficient station movement.",
    priorities: ["speed", "efficiency", "few transfers", "direct route"],
    promptContext:
      "The user is a daily commuter. Prioritize speed, fewer transfers, short decision time, and efficient movement through transport infrastructure."
  },
  {
    id: "elderly",
    label: "Elderly Companion",
    shortLabel: "Elderly",
    description: "Comfortable movement with reduced walking and safer paths.",
    priorities: ["comfort", "safety", "reduced walking", "elevators"],
    promptContext:
      "The user is travelling with an elderly companion. Prioritize comfort, safety, reduced walking, elevators, ramps, shade, and simpler paths."
  },
  {
    id: "wheelchair",
    label: "Wheelchair User",
    shortLabel: "Wheelchair",
    description: "Barrier-free routing with elevators, ramps, and accessible entrances.",
    priorities: ["barrier-free route", "elevators", "ramps", "accessible facilities"],
    promptContext:
      "The user is a wheelchair user. Prioritize barrier-free paths, elevators, ramps, accessible entrances, and avoid any route that depends on stairs."
  },
  {
    id: "luggage",
    label: "Carrying Luggage",
    shortLabel: "Luggage",
    description: "Less carrying effort with elevators, wider paths, and shorter walks.",
    priorities: ["minimal carrying effort", "elevators", "short walking", "wide paths"],
    promptContext:
      "The user is carrying luggage. Prioritize minimal carrying effort, elevators, escalators, wider paths, and fewer stairs even if the route is slightly longer."
  }
];

export function getPersona(id: PersonaId) {
  return PERSONAS.find((persona) => persona.id === id) ?? PERSONAS[0];
}
