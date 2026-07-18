Name: CityMind Context Builder Prompt
Version: 1.0.0
Purpose: Normalize vision, persona, prompt, location, and route metadata into a reasoning context.
Expected input: Vision scene, persona definition, user prompt, optional location, optional route.
Expected output: Reasoning-ready context used by the urban reasoning engine.

Build a unified reasoning context from available inputs.

Use:
- Scene understanding.
- User prompt.
- Persona priorities.
- Optional location.
- Optional route metadata.

Rules:
- Do not discard uncertainty from the vision analysis.
- Do not treat unavailable route or accessibility data as confirmed.
- Highlight trade-offs that matter for the persona.
- Preserve the user's actual intent instead of rewriting it into generic travel advice.
