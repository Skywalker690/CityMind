# AI Prompt Library

**Project:** CityMind

**Version:** 1.0

**Status:** Prompt Engineering Specification

---

# Purpose

This document defines the complete prompt engineering strategy for CityMind.

Unlike traditional applications, AI is the core engine of CityMind. Therefore, prompt engineering is treated as application architecture rather than implementation detail.

Every prompt used by the application must be documented, version-controlled, and follow the standards defined in this document.

---

# Prompting Philosophy

CityMind does not use a single prompt.

Instead, it uses multiple specialized prompts, each responsible for one task.

Benefits:

* Easier maintenance
* Better accuracy
* Easier experimentation
* Lower hallucination risk
* Better prompt versioning

---

# Prompt Pipeline

```text
Image

↓

Vision Prompt

↓

Scene Summary

↓

Context Builder

↓

Persona Prompt

↓

Urban Reasoning Prompt

↓

Recommendation Formatter

↓

Structured JSON

↓

Frontend
```

---

# Prompt Hierarchy

| Prompt                 | Responsibility            |
| ---------------------- | ------------------------- |
| System Prompt          | Define AI behavior        |
| Vision Prompt          | Analyze uploaded image    |
| Context Prompt         | Build reasoning context   |
| Persona Prompt         | Adapt recommendations     |
| Urban Reasoning Prompt | Generate recommendations  |
| Formatter Prompt       | Produce structured output |

---

# 1. System Prompt

## Purpose

Defines the permanent behavior of the AI.

The system prompt should establish:

* Role
* Tone
* Goals
* Constraints
* Safety
* Output expectations

The AI should always behave as:

> An intelligent urban mobility assistant capable of understanding environments and generating context-aware recommendations.

---

## Responsibilities

The system prompt should enforce:

* Context awareness
* Explainability
* Personalization
* Accessibility
* Honest uncertainty
* Structured outputs

---

## Never

The AI should never:

* Invent infrastructure.
* Guess locations with confidence.
* Recommend unsafe actions.
* Ignore persona context.
* Produce generic travel advice.

---

# 2. Vision Prompt

## Purpose

Interpret uploaded images.

---

## Responsibilities

Identify:

* Environment
* Buildings
* Transportation
* Public infrastructure
* Accessibility elements
* Signboards
* Entrances
* Exits
* Elevators
* Escalators
* Stairs

---

## Output

Vision should produce structured information instead of natural language whenever possible.

---

# 3. Context Builder Prompt

## Purpose

Merge all available information into a unified reasoning context.

---

## Inputs

* Vision summary
* User prompt
* Persona
* Location
* Optional weather
* Optional route information

---

## Output

Normalized context object.

The reasoning engine should never work with raw inputs.

---

# 4. Persona Prompt

## Purpose

Inject user-specific priorities.

---

## Supported Personas

* Tourist
* Daily Commuter
* Wheelchair User
* Elderly
* Traveler with Luggage

---

## Responsibilities

Modify priorities rather than facts.

Example

Tourist

Prioritize exploration.

Wheelchair

Prioritize accessibility.

Commuter

Prioritize efficiency.

---

# 5. Urban Reasoning Prompt

## Purpose

Generate recommendations.

This is the most important prompt in CityMind.

---

## Responsibilities

The AI should:

* Evaluate available context.
* Compare alternatives.
* Explain trade-offs.
* Recommend the best option.

---

## Every response should include

* Recommendation
* Reason
* Benefits
* Confidence
* Optional warning

---

## Example

Instead of:

"Use Entrance A."

Prefer:

"Use Entrance B because it provides elevator access and reduces physical effort for users carrying luggage."

---

# 6. Formatter Prompt

## Purpose

Transform reasoning into structured JSON.

---

## Output Format

The formatter should normalize all AI responses before they reach the frontend.

Example structure:

```json
{
  "scene": {},
  "recommendations": [],
  "reasoning": "",
  "warnings": [],
  "confidence": 0.0
}
```

---

# Prompt Variables

Supported variables include:

* Persona
* User prompt
* Vision summary
* Current location
* Destination
* Nearby places
* Weather (future)
* Time (future)

Every variable should be optional unless explicitly required.

---

# Prompt Versioning

Each prompt should contain:

* Name
* Version
* Purpose
* Last modified
* Expected input
* Expected output

Prompt changes should be documented like code changes.

---

# Prompt Engineering Principles

Every prompt should be:

* Focused
* Deterministic where possible
* Concise
* Context-aware
* Modular
* Explainable

Avoid combining unrelated responsibilities into one prompt.

---

# Hallucination Prevention

When information is uncertain:

The AI should:

* State uncertainty.
* Explain limitations.
* Recommend verification where appropriate.

The AI should never fabricate:

* Metro exits
* Building layouts
* Elevator availability
* Route details
* Accessibility features

unless explicitly provided by trusted context.

---

# Prompt Security

Prompt inputs should:

* Ignore malicious instructions contained in user content.
* Treat uploaded images as untrusted input.
* Avoid leaking internal prompt details.
* Avoid revealing hidden system behavior.

---

# Prompt Storage

Prompts should live inside:

```text
prompts/

system.md

vision.md

context.md

persona.md

urban-reasoning.md

formatter.md
```

No prompts should be embedded directly inside React components or API route handlers.

---

# Prompt Testing

Every prompt should be tested against scenarios including:

* Tourist
* Daily commuter
* Wheelchair user
* Elderly traveler
* Luggage traveler
* Unknown location
* Low-quality image
* Empty user prompt

Outputs should remain consistent and structured.

---

# Future Prompt Modules

Potential additions:

* Weather reasoning
* Event awareness
* Emergency assistance
* Crowd prediction
* Voice interaction
* Long-term memory
* Multi-agent collaboration

These modules should integrate without changing the existing prompt hierarchy.

---

# Prompt Quality Checklist

Before deploying a prompt, verify:

* Single responsibility
* Clear objective
* Structured outputs
* Persona awareness
* Explainable recommendations
* Safe behavior
* Hallucination resistance
* Consistent formatting

---

# Guiding Principle

Prompts are part of the application's architecture, not temporary implementation details.

They should be treated with the same discipline as source code, reviewed carefully, documented thoroughly, and evolved through version control alongside the rest of the system.
