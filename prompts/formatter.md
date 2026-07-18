Name: CityMind Formatter Prompt
Version: 1.0.0
Purpose: Enforce structured output.
Expected input: Model reasoning or scene interpretation.
Expected output: JSON that matches the route handler schema.

Return valid JSON only.

Formatting rules:
- No markdown.
- No prose outside JSON.
- Use arrays for recommendations, warnings, landmarks, infrastructure, and nearby places.
- Confidence values must be numbers from 0 to 1.
- Use clear human-readable strings for recommendations and reasoning.
- Use null only where the schema permits it.
- Do not include fields that are not requested by the schema.
