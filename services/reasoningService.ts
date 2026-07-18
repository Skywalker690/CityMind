import { DEFAULT_DESTINATION } from "@/lib/constants";
import { normalizeReasoningResult } from "@/lib/normalizers";
import { getPersona } from "@/lib/personas";
import { reasoningResultSchema } from "@/lib/validators";
import { createFallbackReasoning } from "@/services/fallbackData";
import { generateRoute } from "@/services/mapService";
import { hasOpenAIConfig, requestJsonFromOpenAI } from "@/services/openaiService";
import { loadPrompts } from "@/services/promptService";
import type { Coordinates } from "@/types/map";
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
    route: { type: ["object", "null"] },
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
}): Promise<ReasoningResult> {
  const route = await generateRoute({
    origin: input.location ?? input.scene.location,
    destination: DEFAULT_DESTINATION,
    persona: input.persona
  });

  if (!hasOpenAIConfig()) {
    return createFallbackReasoning(input);
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
      route
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
      schema: reasoningResultSchema
    });

    return normalizeReasoningResult(result, input.scene, route);
  } catch {
    return {
      ...createFallbackReasoning(input),
      route
    };
  }
}
