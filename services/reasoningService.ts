import { REASONING_REQUEST_TIMEOUT_MS } from "@/lib/constants";
import { normalizeReasoningResult } from "@/lib/normalizers";
import { getPersona } from "@/lib/personas";
import { reasoningResultSchema } from "@/lib/validators";
import { createFallbackReasoning } from "@/services/fallbackData";
import { generateRoute } from "@/services/mapService";
import { hasOpenAIConfig, requestJsonFromOpenAI } from "@/services/openaiService";
import { loadPrompts } from "@/services/promptService";
import type { Coordinates, DestinationInput } from "@/types/map";
import type { PersonaId } from "@/types/persona";
import type { ReasoningResult } from "@/types/recommendation";
import type { VisionScene } from "@/types/vision";

const reasoningJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    scene: { type: ["object", "null"] },
    intent: { type: "string" },
    reasoning: { type: "string" },
    recommendations: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          category: {
            type: "string",
            enum: [
              "navigation",
              "accessibility",
              "exploration",
              "safety",
              "transport",
              "nearby-service"
            ]
          },
          recommendation: { type: "string" },
          reason: { type: "string" },
          benefits: { type: "array", items: { type: "string" } },
          estimatedEffort: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
          suggestedAction: { type: "string" }
        },
        required: [
          "id",
          "title",
          "category",
          "recommendation",
          "reason",
          "benefits",
          "estimatedEffort",
          "confidence",
          "suggestedAction"
        ]
      }
    },
    route: { type: "null" },
    nearbyPlaces: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          type: { type: "string" },
          reason: { type: "string" }
        },
        required: ["name", "type", "reason"]
      }
    },
    warnings: { type: "array", items: { type: "string" } },
    confidence: { type: "number", minimum: 0, maximum: 1 }
  },
  required: [
    "scene",
    "intent",
    "reasoning",
    "recommendations",
    "route",
    "nearbyPlaces",
    "warnings",
    "confidence"
  ]
};

export async function generateReasoning(input: {
  scene: VisionScene;
  persona: PersonaId;
  userPrompt: string;
  location?: Coordinates;
  destinationQuery?: string;
  destination?: DestinationInput;
}): Promise<ReasoningResult> {
  const routeGeneration = await generateRoute({
    origin: input.location ?? input.scene.location,
    destination: input.destination,
    destinationQuery: input.destinationQuery,
    userPrompt: input.userPrompt,
    persona: input.persona
  });

  const createFallback = () =>
    mergeRouteWarnings(
      createFallbackReasoning(input, {
        destination: routeGeneration.destination,
        destinationResolution: routeGeneration.destinationResolution,
        route: routeGeneration.route
      }),
      routeGeneration.warnings
    );

  if (!hasOpenAIConfig()) {
    return createFallback();
  }

  try {
    const prompts = await loadPrompts([
      "system",
      "context",
      "persona",
      "urban-reasoning",
      "formatter"
    ]);
    const persona = getPersona(input.persona);
    const context = {
      scene: input.scene,
      persona,
      userPrompt: input.userPrompt,
      location: input.location,
      destination: routeGeneration.destination,
      destinationResolution: routeGeneration.destinationResolution,
      route: routeGeneration.route
    };

    const result = await requestJsonFromOpenAI({
      system: [
        prompts.system,
        prompts.context,
        prompts.persona,
        prompts["urban-reasoning"],
        prompts.formatter
      ].join("\n\n"),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Build a CityMind recommendation from this normalized context:\n${JSON.stringify(
                context,
                null,
                2
              )}`
            }
          ]
        }
      ],
      format: {
        type: "json_schema",
        name: "citymind_reasoning_result",
        strict: true,
        schema: reasoningJsonSchema
      },
      schema: reasoningResultSchema,
      timeoutMs: REASONING_REQUEST_TIMEOUT_MS
    });

    return mergeRouteWarnings(
      normalizeReasoningResult(result, input.scene, {
        destination: routeGeneration.destination,
        destinationResolution: routeGeneration.destinationResolution,
        route: routeGeneration.route,
        replaceRoute: true
      }),
      routeGeneration.warnings
    );
  } catch {
    return createFallback();
  }
}

function mergeRouteWarnings(result: ReasoningResult, routeWarnings: string[]) {
  return {
    ...result,
    warnings: [...new Set([...result.warnings, ...routeWarnings])]
  };
}
