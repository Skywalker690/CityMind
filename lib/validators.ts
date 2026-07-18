import { z } from "zod";

const MAX_PROMPT_LENGTH = 2_000;
const MAX_CONVERSATION_MESSAGES = 30;
const MAX_SCENE_ITEMS = 30;
const MAX_RECOMMENDATIONS = 8;
const MAX_NEARBY_PLACES = 12;
const MAX_ROUTE_POINTS = 2_000;
const MAX_ROUTE_STEPS = 100;
const MAX_ROUTE_WARNINGS = 30;

const textSchema = (maxLength: number) => z.string().trim().min(1).max(maxLength);

const textListSchema = (maxItems: number, maxItemLength: number) =>
  z.array(textSchema(maxItemLength)).max(maxItems);

export const personaIdSchema = z.enum([
  "daily-commuter",
  "tourist",
  "elderly",
  "wheelchair",
  "luggage"
]);

export const coordinatesSchema = z
  .object({
    latitude: z.number().finite().min(-90).max(90),
    longitude: z.number().finite().min(-180).max(180)
  })
  .strict();

export const destinationInputSchema = z
  .object({
    label: textSchema(160).optional(),
    coordinates: coordinatesSchema.optional()
  })
  .strict()
  .refine((destination) => destination.label || destination.coordinates, {
    message: "Provide destination coordinates or a destination label."
  });

export const destinationSchema = z
  .object({
    label: textSchema(160),
    coordinates: coordinatesSchema,
    source: z.enum(["explicit-coordinates", "google-places"]),
    query: textSchema(160).optional()
  })
  .strict();

export const destinationResolutionSchema = z
  .object({
    status: z.enum(["resolved", "missing", "unavailable", "not-found"]),
    destination: destinationSchema.optional(),
    query: textSchema(160).optional(),
    message: textSchema(500).optional()
  })
  .strict();

export const destinationQuerySchema = z.string().trim().min(2).max(160);

export const confidenceLevelSchema = z.enum(["low", "medium", "high"]);

export const visionSceneSchema = z
  .object({
    sceneType: textSchema(120),
    summary: textSchema(2_000),
    landmarks: z
      .array(
        z
          .object({
            name: textSchema(160),
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
          .strict()
      )
      .max(MAX_SCENE_ITEMS),
    infrastructure: textListSchema(MAX_SCENE_ITEMS, 300),
    accessibility: z
      .array(
        z
          .object({
            label: textSchema(160),
            available: z.boolean().nullable(),
            confidence: confidenceLevelSchema,
            evidence: textSchema(500)
          })
          .strict()
      )
      .max(MAX_SCENE_ITEMS),
    navigationCues: textListSchema(MAX_SCENE_ITEMS, 300),
    warnings: textListSchema(MAX_SCENE_ITEMS, 500),
    confidence: z.number().min(0).max(1),
    location: coordinatesSchema.nullable().optional()
  })
  .strict();

export const chatMessageSchema = z
  .object({
    id: textSchema(160),
    role: z.enum(["user", "assistant"]),
    content: textSchema(MAX_PROMPT_LENGTH),
    createdAt: textSchema(80)
  })
  .strict();

export const routeSummarySchema = z
  .object({
    origin: z
      .object({
        label: textSchema(160),
        coordinates: coordinatesSchema,
        type: z.enum(["origin", "destination", "waypoint"])
      })
      .strict(),
    destination: z
      .object({
        label: textSchema(160),
        coordinates: coordinatesSchema,
        type: z.enum(["origin", "destination", "waypoint"])
      })
      .strict(),
    waypoints: z
      .array(
        z
          .object({
            label: textSchema(160),
            coordinates: coordinatesSchema,
            type: z.enum(["origin", "destination", "waypoint"])
          })
          .strict()
      )
      .max(MAX_ROUTE_STEPS),
    distanceMeters: z.number().nonnegative(),
    durationSeconds: z.number().nonnegative(),
    accessible: z.boolean(),
    travelMode: z.literal("walking"),
    source: z.enum(["google", "osrm", "fallback"]),
    status: z.enum(["routed", "estimated"]),
    accessibility: z
      .object({
        status: z.enum(["unknown", "unverified", "verified"]),
        verified: z.boolean(),
        evidence: textListSchema(MAX_ROUTE_WARNINGS, 500),
        warnings: textListSchema(MAX_ROUTE_WARNINGS, 500)
      })
      .strict(),
    geometry: z.array(coordinatesSchema).max(MAX_ROUTE_POINTS),
    geometryGeoJson: z
      .object({
        type: z.literal("LineString"),
        coordinates: z
          .array(z.tuple([z.number().finite(), z.number().finite()]))
          .max(MAX_ROUTE_POINTS)
      })
      .strict(),
    steps: z
      .array(
        z
          .object({
            instruction: textSchema(500),
            distanceMeters: z.number().nonnegative(),
            durationSeconds: z.number().nonnegative()
          })
          .strict()
      )
      .max(MAX_ROUTE_STEPS),
    warnings: textListSchema(MAX_ROUTE_WARNINGS, 500)
  })
  .strict();

export const recommendationSchema = z
  .object({
    id: textSchema(160),
    title: textSchema(160),
    category: z.enum([
      "navigation",
      "accessibility",
      "exploration",
      "safety",
      "transport",
      "nearby-service"
    ]),
    recommendation: textSchema(1_200),
    reason: textSchema(1_200),
    benefits: z.array(textSchema(300)).min(1).max(8),
    estimatedEffort: textSchema(160),
    confidence: z.number().min(0).max(1),
    suggestedAction: textSchema(300)
  })
  .strict();

export const reasoningResultSchema = z
  .object({
    scene: visionSceneSchema.nullable().optional(),
    intent: textSchema(500),
    reasoning: textSchema(3_000),
    recommendations: z.array(recommendationSchema).min(1).max(MAX_RECOMMENDATIONS),
    destination: destinationSchema.optional(),
    destinationResolution: destinationResolutionSchema.optional(),
    route: routeSummarySchema.nullable().optional(),
    nearbyPlaces: z
      .array(
        z
          .object({
            name: textSchema(160),
            type: textSchema(120),
            reason: textSchema(500)
          })
          .strict()
      )
      .max(MAX_NEARBY_PLACES),
    warnings: textListSchema(MAX_SCENE_ITEMS, 500),
    confidence: z.number().min(0).max(1)
  })
  .strict();

export const reasonRequestSchema = z
  .object({
    scene: visionSceneSchema,
    persona: personaIdSchema,
    userPrompt: textSchema(MAX_PROMPT_LENGTH),
    location: coordinatesSchema.optional(),
    destinationQuery: destinationQuerySchema.optional(),
    destination: destinationInputSchema.optional()
  })
  .strict();

export const chatRequestSchema = z
  .object({
    conversation: z.array(chatMessageSchema).max(MAX_CONVERSATION_MESSAGES),
    latestMessage: textSchema(MAX_PROMPT_LENGTH),
    persona: personaIdSchema,
    scene: visionSceneSchema.optional(),
    recommendation: reasoningResultSchema.optional()
  })
  .strict();

export const mapRequestSchema = z
  .object({
    origin: coordinatesSchema,
    destination: z.union([coordinatesSchema, destinationInputSchema]).optional(),
    destinationQuery: destinationQuerySchema.optional(),
    persona: personaIdSchema
  })
  .strict()
  .superRefine((payload, context) => {
    if (!payload.destination && !payload.destinationQuery) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["destination"],
        message: "Provide destination coordinates or a destination query."
      });
    }
  });

export const personaRequestSchema = z
  .object({
    persona: personaIdSchema
  })
  .strict();
