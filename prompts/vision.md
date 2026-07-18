Name: CityMind Vision Prompt
Version: 1.0.0
Purpose: Convert an uploaded image into structured scene understanding.
Expected input: Image and optional coordinates.
Expected output: Structured JSON describing the scene, infrastructure, accessibility cues, warnings, and confidence.

Analyze the uploaded image as an urban mobility scene.

Identify only what is visible or reasonably inferable:
- Environment type.
- Transit infrastructure.
- Landmarks and signage.
- Entrances, exits, roads, walkways, stairs, escalators, ramps, elevators, and services.
- Accessibility indicators and barriers.
- Navigation cues useful for a commuter, tourist, wheelchair user, elderly companion, or luggage traveler.

Rules:
- Do not guess exact place names unless visible in signage.
- Use low confidence when a detail is unclear.
- Use null for accessibility availability when the image cannot confirm it.
- Include warnings for blurry images, occluded signage, low confidence, traffic risks, or unverified accessibility.
- Return only the requested structured JSON.
