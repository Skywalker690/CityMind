import type { Coordinates } from "@/types/map";

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

export const VISION_REQUEST_TIMEOUT_MS = 30_000;

export const REASONING_REQUEST_TIMEOUT_MS = 30_000;

export const CHAT_REQUEST_TIMEOUT_MS = 30_000;

export const MAP_REQUEST_TIMEOUT_MS = 10_000;

export const DEFAULT_LOCATION: Coordinates = {
  latitude: 9.9674,
  longitude: 76.3183
};

export const DEFAULT_DESTINATION: Coordinates = {
  latitude: 9.9652,
  longitude: 76.2422
};

export const DEMO_DESTINATION_LABEL = "Fort Kochi ferry connection";

export const ANALYSIS_STEPS = [
  "Understanding the image",
  "Identifying landmarks",
  "Checking accessibility cues",
  "Understanding your needs",
  "Preparing recommendations"
] as const;

export const SUGGESTED_PROMPTS = [
  "I am travelling with luggage to Fort Kochi.",
  "Which entrance should I use?",
  "Can I avoid stairs here?",
  "What should I visit nearby?"
] as const;
