import { readFile } from "node:fs/promises";
import path from "node:path";

export type PromptName =
  | "system"
  | "vision"
  | "context"
  | "persona"
  | "urban-reasoning"
  | "formatter";

export async function loadPrompt(name: PromptName) {
  const promptPath = path.join(process.cwd(), "prompts", `${name}.md`);
  return readFile(promptPath, "utf8");
}

export async function loadPrompts(names: PromptName[]) {
  const entries = await Promise.all(
    names.map(async (name) => [name, await loadPrompt(name)] as const)
  );

  return Object.fromEntries(entries) as Record<PromptName, string>;
}
