import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export function getServerConfig() {
  return {
    openaiApiKey: getConfigValue("OPENAI_API_KEY"),
    openaiModel: getConfigValue("OPENAI_MODEL") ?? "gpt-4.1-mini",
    osrmBaseUrl:
      getConfigValue("OSRM_BASE_URL") ?? "https://router.project-osrm.org"
  };
}

function getConfigValue(name: string) {
  return getLocalEnvValue(name) ?? process.env[name];
}

function getLocalEnvValue(name: string) {
  if (process.env.NODE_ENV === "production") {
    return undefined;
  }

  for (const fileName of [".env.local", ".env"]) {
    const filePath = path.join(process.cwd(), fileName);

    if (!existsSync(filePath)) {
      continue;
    }

    const value = parseEnvFile(readFileSync(filePath, "utf8"))[name];

    if (value) {
      return value;
    }
  }

  return undefined;
}

function parseEnvFile(contents: string) {
  const values: Record<string, string> = {};

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    values[key] = stripQuotes(rawValue);
  }

  return values;
}

function stripQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}
