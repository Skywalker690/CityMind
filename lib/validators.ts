import { z } from "zod";

export const personaIdSchema = z.enum([
  "daily-commuter",
  "tourist",
  "elderly",
  "wheelchair",
  "luggage"
]);

export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
});

export const confidenceLevelSchema = z.enum(["low", "medium", "high"]);

export const visionSceneSchema = z.object({
  sceneType: z.string().min(1),
  summary: z.string().min(1),
  landmarks: z.array(
    z.object({
      name: z.string().min(1),
      type: z.enum([
        "station",
        "entrance",
        "signage",
        "building",
        "road",
        "service",
        "unknown"
      ]),
      confidence: confidenceLevelSchema
    })
  ),
  infrastructure: z.array(z.string()),
  accessibility: z.array(
    z.object({
      label: z.string().min(1),
      available: z.boolean().nullable(),
      confidence: confidenceLevelSchema,
      evidence: z.string().min(1)
    })
  ),
  navigationCues: z.array(z.string()),
  warnings: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  location: coordinatesSchema.nullable().optional()
});

export const chatMessageSchema = z.object({
  id: z.string().min(1),
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1),
  createdAt: z.string().min(1)
});

export const routeSummarySchema = z.object({
  origin: z.object({
    label: z.string(),
    coordinates: coordinatesSchema,
    type: z.enum(["origin", "destination", "waypoint"])
  }),
  destination: z.object({
    label: z.string(),
    coordinates: coordinatesSchema,
    type: z.enum(["origin", "destination", "waypoint"])
  }),
  waypoints: z.array(
    z.object({
      label: z.string(),
      coordinates: coordinatesSchema,
      type: z.enum(["origin", "destination", "waypoint"])
    })
  ),
  distanceMeters: z.number().nonnegative(),
  durationSeconds: z.number().nonnegative(),
  accessible: z.boolean(),
  geometry: z.array(coordinatesSchema),
  steps: z.array(
    z.object({
      instruction: z.string(),
      distanceMeters: z.number().nonnegative(),
      durationSeconds: z.number().nonnegative()
    })
  )
});

export const recommendationSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: z.enum([
    "navigation",
    "accessibility",
    "exploration",
    "safety",
    "transport",
    "nearby-service"
  ]),
  recommendation: z.string().min(1),
  reason: z.string().min(1),
  benefits: z.array(z.string().min(1)).min(1),
  estimatedEffort: z.string().min(1),
  confidence: z.number().min(0).max(1),
  suggestedAction: z.string().min(1)
});

export const reasoningResultSchema = z.object({
  scene: visionSceneSchema.nullable().optional(),
  intent: z.string().min(1),
  reasoning: z.string().min(1),
  recommendations: z.array(recommendationSchema).min(1),
  route: routeSummarySchema.nullable().optional(),
  nearbyPlaces: z.array(
    z.object({
      name: z.string().min(1),
      type: z.string().min(1),
      reason: z.string().min(1)
    })
  ),
  warnings: z.array(z.string()),
  confidence: z.number().min(0).max(1)
});

export const reasonRequestSchema = z.object({
  scene: visionSceneSchema,
  persona: personaIdSchema,
  userPrompt: z.string().trim().min(1),
  location: coordinatesSchema.optional()
});

export const chatRequestSchema = z.object({
  conversation: z.array(chatMessageSchema),
  latestMessage: z.string().trim().min(1),
  persona: personaIdSchema,
  scene: visionSceneSchema.optional(),
  recommendation: reasoningResultSchema.optional()
});

export const mapRequestSchema = z.object({
  origin: coordinatesSchema,
  destination: coordinatesSchema,
  persona: personaIdSchema
});

export const personaRequestSchema = z.object({
  persona: personaIdSchema
});
