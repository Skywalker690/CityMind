import { describe, expect, it } from "vitest";

import { POST as postChat } from "@/app/api/chat/route";
import { POST as postMap } from "@/app/api/map/route";
import { POST as postPersona } from "@/app/api/persona/route";
import { POST as postReason } from "@/app/api/reason/route";
import { POST as postVision } from "@/app/api/vision/route";

type ApiRoute = (request: Request) => Promise<Response>;

const jsonRoutes: Array<[string, ApiRoute]> = [
  ["chat", postChat],
  ["map", postMap],
  ["persona", postPersona],
  ["reason", postReason]
];

describe("API request boundaries", () => {
  it.each(jsonRoutes)("returns a validation envelope for malformed %s JSON", async (_, route) => {
    const response = await route(
      new Request("http://localhost/api", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: '{"incomplete":'
      })
    );

    await expectValidationError(response, []);
  });

  it("returns a validation envelope for a malformed vision location", async () => {
    const formData = new FormData();
    formData.append("image", new File([new Uint8Array([1])], "scene.png", { type: "image/png" }));
    formData.append("location", "{not-json}");

    const response = await postVision(
      new Request("http://localhost/api/vision", {
        method: "POST",
        body: formData
      })
    );

    await expectValidationError(response, ["location"]);
  });
});

async function expectValidationError(response: Response, path: Array<string | number>) {
  expect(response.status).toBe(400);

  await expect(response.json()).resolves.toMatchObject({
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "The request could not be validated.",
      details: [
        {
          code: "custom",
          path
        }
      ]
    }
  });
}
