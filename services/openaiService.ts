import OpenAI from "openai";
import { z } from "zod";

import { getServerConfig } from "@/lib/config";
import { getErrorMessage } from "@/lib/api";
import { withTimeout } from "@/lib/network";

interface JsonSchemaFormat {
  type: "json_schema";
  name: string;
  strict: boolean;
  schema: Record<string, unknown>;
}

interface JsonRequestOptions<T> {
  system: string;
  input: OpenAI.Responses.ResponseInput;
  format: JsonSchemaFormat;
  schema: z.ZodType<T>;
  timeoutMs?: number;
}

export function hasOpenAIConfig() {
  return Boolean(getServerConfig().openaiApiKey);
}

export async function requestJsonFromOpenAI<T>({
  system,
  input,
  format,
  schema,
  timeoutMs = 30_000
}: JsonRequestOptions<T>) {
  const config = getServerConfig();

  if (!config.openaiApiKey) {
    throw new Error("OpenAI API key is not configured.");
  }

  const client = new OpenAI({
    apiKey: config.openaiApiKey
  });

  return withTimeout(
    async (signal) => {
      const response = await client.responses.create(
        {
          model: config.openaiModel,
          instructions: system,
          input,
          text: {
            format
          }
        },
        { signal }
      );

      const text = response.output_text;

      if (!text) {
        throw new Error("OpenAI returned an empty response.");
      }

      try {
        return schema.parse(JSON.parse(text));
      } catch (error) {
        throw new Error(`OpenAI response validation failed: ${getErrorMessage(error)}`);
      }
    },
    timeoutMs,
    "OpenAI request"
  );
}
