import { describe, expect, it } from "vitest";

import {
  coordinatesSchema,
  mapRequestSchema,
  personaIdSchema,
  reasonRequestSchema
} from "@/lib/validators";
import { createFallbackScene } from "@/services/fallbackData";

const coordinates = {
  latitude: 9.9674,
  longitude: 76.3183
};

describe("request validators", () => {
  it("accepts every supported persona and rejects unsupported values", () => {
    const supportedPersonas = ["daily-commuter", "tourist", "elderly", "wheelchair", "luggage"];

    for (const persona of supportedPersonas) {
      expect(personaIdSchema.safeParse(persona).success).toBe(true);
    }

    expect(personaIdSchema.safeParse("visitor").success).toBe(false);
  });

  it("enforces geographic coordinate bounds", () => {
    expect(coordinatesSchema.parse(coordinates)).toEqual(coordinates);
    expect(coordinatesSchema.safeParse({ latitude: 90.01, longitude: 76.3183 }).success).toBe(
      false
    );
    expect(coordinatesSchema.safeParse({ latitude: 9.9674, longitude: -180.01 }).success).toBe(
      false
    );
  });

  it("trims a valid reasoning prompt and rejects an empty one", () => {
    const request = reasonRequestSchema.parse({
      scene: createFallbackScene(coordinates),
      persona: "tourist",
      userPrompt: "  Which entrance should I use?  ",
      location: coordinates
    });

    expect(request.userPrompt).toBe("Which entrance should I use?");
    expect(
      reasonRequestSchema.safeParse({
        ...request,
        userPrompt: "   "
      }).success
    ).toBe(false);
  });

  it("rejects malformed map requests before routing", () => {
    expect(
      mapRequestSchema.safeParse({
        origin: coordinates,
        destination: { latitude: "9.96", longitude: 76.24 },
        persona: "tourist"
      }).success
    ).toBe(false);
  });
});
