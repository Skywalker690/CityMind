# AI Architecture

**Project:** CityMind

**Version:** 1.0

**Status:** AI System Specification

---

# Purpose

This document defines the complete AI architecture of CityMind.

Unlike the system architecture, this document focuses entirely on how AI components interact, how context is built, how reasoning occurs, how prompts are designed, and how structured outputs are generated.

This document is the authoritative source for all AI-related implementation.

---

# AI Philosophy

CityMind is **not a chatbot**.

It is an **AI Reasoning Engine**.

The AI does not simply answer questions.

It:

* Understands
* Reasons
* Evaluates
* Recommends
* Explains

Every response should reflect deliberate reasoning rather than generic text generation.

---

# AI Responsibilities

The AI system is responsible for:

* Vision understanding
* Scene interpretation
* Context building
* Intent understanding
* Persona-aware reasoning
* Recommendation generation
* Explanation generation
* Structured output generation

The AI is **not** responsible for UI logic, map rendering, or state management.

---

# Core AI Pipeline

```text
User Input
     │
     ▼
Vision Analysis
     │
     ▼
Scene Understanding
     │
     ▼
Context Builder
     │
     ▼
Intent Detection
     │
     ▼
Urban Reasoning
     │
     ▼
Recommendation Generator
     │
     ▼
Structured JSON Response
     │
     ▼
Frontend Rendering
```

---

# AI Modules

## Module 1 — Vision Analyzer

### Purpose

Convert an image into structured scene understanding.

### Input

* Image
* Optional location

### Output

* Scene type
* Objects
* Landmarks
* Accessibility indicators
* Infrastructure
* Confidence

Example

```json
{
  "scene": "Metro Station",
  "landmarks": [
    "Entrance A",
    "Ticket Counter"
  ],
  "infrastructure": [
    "Elevator",
    "Escalator"
  ]
}
```

---

## Module 2 — Context Builder

Purpose

Merge all available information into a single reasoning context.

Context sources

* Vision analysis
* Persona
* User prompt
* Current location
* Optional weather
* Optional map metadata

Output

One normalized context object.

---

## Module 3 — Intent Detector

Purpose

Understand what the user actually wants.

Example intents

* Navigation
* Accessibility
* Exploration
* Recommendation
* Safety
* Public transport
* Nearby services

The detected intent determines the reasoning path.

---

## Module 4 — Urban Reasoning Engine

This is the heart of CityMind.

It reasons over:

* Vision
* Intent
* Persona
* Urban context

It should evaluate trade-offs instead of producing direct answers.

Example

Instead of

"Use Entrance A"

Reason

Entrance A is closer but requires stairs.

Entrance B is farther but has elevator access and is better for luggage.

---

## Module 5 — Recommendation Generator

Purpose

Transform reasoning into concise recommendations.

Each recommendation should contain:

* Title
* Recommendation
* Reason
* Benefits
* Confidence
* Suggested action

---

## Module 6 — Explanation Engine

Every recommendation must answer:

Why?

Example

Recommendation

Use Entrance B.

Reason

It minimizes walking while providing elevator access.

Benefit

Safer and easier for users carrying luggage.

---

# AI Context Object

The reasoning engine operates on a unified context.

Example

```json
{
  "persona": "...",
  "scene": "...",
  "intent": "...",
  "location": "...",
  "userPrompt": "...",
  "weather": "...",
  "time": "..."
}
```

Every reasoning decision should use this context rather than isolated inputs.

---

# Persona-Aware Reasoning

The same scene should produce different recommendations depending on the selected persona.

Example

### Tourist

Prioritize

* Attractions
* Exploration
* Simplicity

---

### Commuter

Prioritize

* Time
* Efficiency

---

### Wheelchair User

Prioritize

* Accessibility
* Elevators
* Barrier-free routes

---

### Elderly

Prioritize

* Comfort
* Reduced walking

---

### Luggage

Prioritize

* Wider pathways
* Elevators
* Minimal carrying effort

---

# AI Output Schema

All AI responses should be structured.

Example

```json
{
  "scene": {},
  "recommendations": [],
  "reasoning": "",
  "route": {},
  "nearbyPlaces": [],
  "warnings": []
}
```

Avoid free-form responses whenever possible.

---

# Prompt Layers

CityMind uses multiple prompt layers.

## System Prompt

Defines AI behavior.

---

## Vision Prompt

Interprets uploaded images.

---

## Context Prompt

Builds unified reasoning context.

---

## Persona Prompt

Injects user-specific priorities.

---

## Urban Reasoning Prompt

Produces recommendations.

---

## Output Formatter

Ensures consistent JSON output.

Each prompt should have a single responsibility.

---

# AI Principles

Every response should be:

* Context-aware
* Explainable
* Personalized
* Actionable
* Concise
* Accurate

Avoid hallucinating unavailable information.

When uncertain, communicate uncertainty clearly.

---

# Tool Calling Strategy

The AI may invoke tools for:

* Reverse geocoding
* Route generation
* Nearby places
* Weather
* Future transit APIs

The reasoning engine decides **when** a tool is required.

---

# Error Handling

If vision confidence is low:

* Inform the user.
* Suggest capturing another image.
* Continue reasoning using available context where possible.

If external services fail:

* Provide the best recommendation using remaining context.

Never leave the user without guidance.

## MVP Fallback Reasoning

When `OPENAI_API_KEY` is not configured or the OpenAI request fails, CityMind
uses deterministic fallback reasoning so the demo remains usable.

Fallback AI behavior must:

* Preserve the selected persona.
* Preserve the active scene context when available.
* Avoid claiming live elevator, exit, platform, or crowd details.
* Return the same structured schema as live AI responses.
* Include warnings when guidance relies on unverified assumptions.

Fallback mode is not a replacement for Vision AI. It exists only to provide
graceful recovery and repeatable demo behavior.

---

# Future AI Capabilities

The architecture should support future additions without redesign.

Examples

* Voice conversations
* Long-term memory
* Real-time transit feeds
* Crowd prediction
* Multi-agent reasoning
* City-wide digital twin integration

---

# AI Quality Checklist

Every AI feature must satisfy:

* Uses structured context.
* Produces explainable reasoning.
* Adapts to personas.
* Returns structured outputs.
* Handles uncertainty.
* Avoids unnecessary verbosity.
* Supports the Vision + Urban Reasoning philosophy.

If a feature bypasses reasoning and simply generates text, it does not belong in CityMind.

This document defines the AI behavior contract for the entire project and must remain synchronized with all prompt, service, and implementation changes.
