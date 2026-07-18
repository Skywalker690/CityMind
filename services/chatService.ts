import { getPersona } from "@/lib/personas";
import { CHAT_REQUEST_TIMEOUT_MS } from "@/lib/constants";
import { hasOpenAIConfig, requestJsonFromOpenAI } from "@/services/openaiService";
import { loadPrompts } from "@/services/promptService";
import type { ChatMessage, ChatResponse } from "@/types/chat";
import type { PersonaId } from "@/types/persona";
import type { ReasoningResult } from "@/types/recommendation";
import type { VisionScene } from "@/types/vision";
import { z } from "zod";

const chatResponseSchema = z.object({
  message: z.string().min(1),
  reasoning: z.string().min(1),
  suggestedQuestions: z.array(z.string().min(1))
});

const chatJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    message: { type: "string" },
    reasoning: { type: "string" },
    suggestedQuestions: { type: "array", items: { type: "string" } }
  },
  required: ["message", "reasoning", "suggestedQuestions"]
};

export async function continueConversation(input: {
  conversation: ChatMessage[];
  latestMessage: string;
  persona: PersonaId;
  scene?: VisionScene;
  recommendation?: ReasoningResult;
}): Promise<ChatResponse> {
  const persona = getPersona(input.persona);

  if (!hasOpenAIConfig()) {
    return {
      message:
        "Based on the current scene and persona, I would keep the recommendation practical: verify step-free access first, then follow the clearest station signage toward your onward connection. I am using fallback reasoning, so I will not claim live elevator or platform details.",
      reasoning:
        "The fallback response preserves the active scene, persona priorities, and previous recommendation without inventing unverified infrastructure.",
      suggestedQuestions: [
        "Can I avoid stairs?",
        "What should I verify first?",
        "How does this change for luggage?"
      ]
    };
  }

  try {
    const prompts = await loadPrompts(["system", "context", "persona", "formatter"]);
    return requestJsonFromOpenAI({
      system: [prompts.system, prompts.context, prompts.persona, prompts.formatter].join("\n\n"),
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Continue this CityMind conversation. Keep the answer concise, contextual, and explain the reasoning.\n\nPersona:\n${JSON.stringify(
                persona,
                null,
                2
              )}\n\nScene:\n${JSON.stringify(input.scene, null, 2)}\n\nRecommendation:\n${JSON.stringify(
                input.recommendation,
                null,
                2
              )}\n\nConversation:\n${JSON.stringify(
                input.conversation,
                null,
                2
              )}\n\nLatest message: ${input.latestMessage}`
            }
          ]
        }
      ],
      format: {
        type: "json_schema",
        name: "citymind_chat_response",
        strict: true,
        schema: chatJsonSchema
      },
      schema: chatResponseSchema,
      timeoutMs: CHAT_REQUEST_TIMEOUT_MS
    });
  } catch {
    return {
      message:
        "I would keep following the current recommendation, but verify any accessibility detail before committing to a route. The safest next step is to use visible station signage or staff confirmation for elevators, ramps, and exits.",
      reasoning:
        "The AI service was unavailable, so CityMind is using the existing scene and persona context without adding unverified facts.",
      suggestedQuestions: [
        "What should I ask station staff?",
        "Which route is safest?",
        "What if the elevator is unavailable?"
      ]
    };
  }
}
