import { createFallbackScene } from "@/services/fallbackData";
import { hasOpenAIConfig, requestJsonFromOpenAI } from "@/services/openaiService";
import { loadPrompts } from "@/services/promptService";
import type { Coordinates } from "@/types/map";
import type { VisionScene } from "@/types/vision";
import { visionSceneSchema } from "@/lib/validators";

const visionJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    sceneType: { type: "string" },
    summary: { type: "string" },
    landmarks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          type: {
            type: "string",
            enum: [
              "station",
              "entrance",
              "signage",
              "building",
              "road",
              "service",
              "unknown"
            ]
          },
          confidence: { type: "string", enum: ["low", "medium", "high"] }
        },
        required: ["name", "type", "confidence"]
      }
    },
    infrastructure: { type: "array", items: { type: "string" } },
    accessibility: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          label: { type: "string" },
          available: { type: ["boolean", "null"] },
          confidence: { type: "string", enum: ["low", "medium", "high"] },
          evidence: { type: "string" }
        },
        required: ["label", "available", "confidence", "evidence"]
      }
    },
    navigationCues: { type: "array", items: { type: "string" } },
    warnings: { type: "array", items: { type: "string" } },
    confidence: { type: "number", minimum: 0, maximum: 1 },
    location: {
      anyOf: [
        {
          type: "object",
          additionalProperties: false,
          properties: {
            latitude: { type: "number", minimum: -90, maximum: 90 },
            longitude: { type: "number", minimum: -180, maximum: 180 }
          },
          required: ["latitude", "longitude"]
        },
        { type: "null" }
      ]
    }
  },
  required: [
    "sceneType",
    "summary",
    "landmarks",
    "infrastructure",
    "accessibility",
    "navigationCues",
    "warnings",
    "confidence",
    "location"
  ]
};

export async function analyzeImage(input: {
  imageDataUrl: string;
  location?: Coordinates;
}): Promise<VisionScene> {
  if (!hasOpenAIConfig()) {
    return createFallbackScene(input.location);
  }

  try {
    const prompts = await loadPrompts(["system", "vision", "formatter"]);
    const scene = await requestJsonFromOpenAI({
      system: `${prompts.system}\n\n${prompts.vision}\n\n${prompts.formatter}`,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Analyze this urban mobility scene. Optional location: ${
                input.location
                  ? `${input.location.latitude}, ${input.location.longitude}`
                  : "not provided"
              }. Return only the requested structured JSON.`
            },
            {
              type: "input_image",
              image_url: input.imageDataUrl,
              detail: "auto"
            }
          ]
        }
      ],
      format: {
        type: "json_schema",
        name: "citymind_vision_scene",
        strict: true,
        schema: visionJsonSchema
      },
      schema: visionSceneSchema
    });

    return {
      ...scene,
      location: scene.location ?? input.location
    };
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "CityMind vision fell back because OpenAI vision failed:",
        error instanceof Error ? error.message : "Unknown error"
      );
    }

    return createFallbackScene(input.location);
  }
}
