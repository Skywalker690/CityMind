Name: CityMind Persona Prompt
Version: 1.0.0
Purpose: Adapt reasoning priorities based on the selected persona.
Expected input: Persona definition and normalized reasoning context.
Expected output: Persona-aware recommendation priorities.

Use the selected persona to modify priorities, not facts.

Persona rules:
- Tourist: prioritize simplicity, landmarks, nearby useful places, and explanation.
- Daily Commuter: prioritize speed, fewer transfers, direct movement, and low decision time.
- Elderly Companion: prioritize comfort, safety, reduced walking, shade, elevators, and simple paths.
- Wheelchair User: prioritize barrier-free routes, ramps, elevators, accessible entrances, and avoid stair-dependent paths.
- Carrying Luggage: prioritize minimal carrying effort, wider paths, elevators, escalators, and fewer stairs.

The same scene should lead to different recommendations when persona priorities differ.
