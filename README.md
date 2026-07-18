# CityMind

> **CityMind — AI Vision Copilot for Urban Mobility**

CityMind is an AI-powered urban mobility assistant that combines computer vision, contextual reasoning, and mapping intelligence to help people make smarter decisions while navigating cities.

Unlike traditional navigation applications that only answer *"How do I get there?"*, CityMind answers *"Given who I am, where I am, and what I'm looking at, what is the smartest thing to do next?"*

---

# Vision

Our goal is to build an AI system capable of understanding the real world through vision and reasoning.

Instead of simply recognizing objects or landmarks, CityMind understands context and generates personalized recommendations based on:

* User intent
* Physical surroundings
* Accessibility needs
* Transportation options
* Environmental conditions
* Urban infrastructure

The project is being built as an MVP for the **Codex Nightline AI Build Sprint**.

---

# Project Goal

Build an AI-first application that demonstrates how Vision AI and Large Language Models can improve urban mobility through intelligent reasoning.

The project should feel like a polished product rather than a collection of AI features.

---

# Problem Statement

Urban navigation is fragmented.

People constantly switch between multiple applications.

* Google Maps for routes
* Weather applications
* Metro applications
* Search engines
* Accessibility information
* Local knowledge

None of these systems understand the user's complete context.

CityMind solves this problem by combining these signals into a single intelligent assistant.

---

# Core Value Proposition

CityMind is **not another map application.**

CityMind reasons.

The application understands:

* where the user is
* what the camera sees
* who the user is
* what the user wants
* what constraints they have

before generating recommendations.

---

# Killer Feature

## Vision + Urban Reasoning

The user points the camera at a place.

CityMind understands the environment.

The user asks a question.

Instead of identifying the place, CityMind reasons about the best decision.

Example:

"I'm travelling with my grandmother."

The response becomes:

* Best entrance
* Elevator availability
* Walking distance
* Recommended metro exit
* Nearby facilities
* Route explanation
* Reasoning behind the recommendation

The focus is intelligent decision support.

---

# MVP Scope

The MVP focuses on one polished experience.

Supported capabilities:

* Vision analysis
* Context-aware reasoning
* Interactive AI chat
* Route recommendation
* Accessibility-aware suggestions
* Map visualization

Everything else is intentionally excluded.

## MVP Experience

CityMind is a single responsive workflow:

1. Select a persona and capture, upload, or load a demo urban scene.
2. Review the image, then explicitly confirm before vision analysis starts.
3. Ask a question and optionally enter a destination query.
4. Receive an explained recommendation, a truthfully labelled walking-route
   state, and an interactive Mapbox visualization when available.
5. Continue with context-aware follow-up chat.

The header includes an accessible light/dark toggle. Loading, retries, an
error boundary, and map/text fallbacks ensure an incomplete provider response
does not strand the user.

---

# Non Goals

The following are intentionally excluded from the MVP.

* Authentication
* User management
* Payments
* Social features
* Notifications
* Admin dashboards
* Analytics
* Complex databases
* Enterprise backend architecture
* Multi-tenancy

---

# Target Users

Primary

* Metro commuters

Secondary

* Tourists
* Elderly users
* Wheelchair users
* Students
* Visitors

---

# Technology Stack

## Frontend

* Next.js 15
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion

---

## AI

* OpenAI Responses API
* Vision-capable OpenAI model
* Structured Outputs

---

## Mapping

* Mapbox GL JS
* Mapbox Search Geocoding
* Mapbox Directions walking routes
* OSRM foot routing as a secondary provider

---

## Backend

* Next.js API Routes

No separate backend service will be created unless absolutely necessary.

---

## Database

No persistent database is required for the MVP.

If persistence becomes necessary:

Supabase will be used.

---

## Deployment

* Vercel

---

# Running Locally

Install dependencies:

```bash
pnpm install --frozen-lockfile
```

Create a local environment file from `.env.example`.

Required for live AI, destination search, and map rendering:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini

# Browser-safe public Mapbox token for map rendering.
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=

# Server-side Mapbox token for destination geocoding and walking directions.
MAPBOX_ACCESS_TOKEN=

# Optional secondary route provider. Set only to an endpoint configured with a
# walking/foot profile; generic public demo endpoints do not guarantee this.
OSRM_BASE_URL=
```

During local development, CityMind reads `.env.local` and `.env` directly before
falling back to inherited shell variables. This prevents stale system-level API
keys from overriding the project file.

`NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` is intentionally browser-visible and must be
a Mapbox public token (`pk.`). Keep `MAPBOX_ACCESS_TOKEN` server-only. The same
public token can be used for both during a demo, although separate tokens make
environment management clearer.

Run the development server:

```bash
pnpm dev
```

The app is designed to fail safely when a provider is unavailable:

* Missing or failed OpenAI calls return deterministic, persona-aware fallback
  scene and recommendation data with clear warnings.
* Text destinations are resolved through Mapbox. If destination search is
  missing, unavailable, or cannot confidently find a place, CityMind does not
  invent a route.
* CityMind requests Mapbox walking directions first, then an OSRM foot-profile
  route if the primary provider is unavailable. Only when both live providers
  fail does it render an explicitly labelled estimated route.
* If Mapbox GL cannot render in the browser, the map panel keeps route details
  available and shows a local visual fallback.

Provider timeouts are bounded to 30 seconds for AI operations and 10 seconds
for mapping operations. No fallback claims live elevator, ramp, crowd, exit,
or step-free-route information without evidence.

The UI also includes a `Use Demo Scene` action backed by
`public/demo/metro-station.svg` for repeatable hackathon demos when no camera
image is available. The browser rasterizes that SVG into a JPEG before upload so
live OpenAI vision can analyze it when `OPENAI_API_KEY` is configured.

## Quality checks

Run the full local quality suite before shipping a change:

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Vitest covers validators, response normalizers, map result handling, and
deterministic fallbacks. GitHub Actions runs the same formatting, lint,
typecheck, test, and production-build checks on pull requests and pushes to
`main`.

---

# Repository Structure

```
citymind/

README.md

docs/

app/

components/

lib/

services/

hooks/

types/

prompts/

public/
```

---

# Documentation Philosophy

The `/docs` directory is the project's single source of truth.

Every architectural decision, feature, flow, API, prompt, and UI specification must exist inside the documentation before or alongside implementation.

Documentation is treated as part of the product.

---

# Documentation Rules

Every implementation must follow these rules.

1. Read the relevant documentation before writing code.

2. Never implement undocumented functionality.

3. If implementation changes, documentation must change.

4. Documentation and implementation must always remain synchronized.

5. Never introduce hidden behaviour.

6. Every feature must have an acceptance criterion.

7. Every AI prompt must be documented.

8. Every API must be documented.

9. Every component should match its specification.

10. Documentation always wins over assumptions.

---

# Development Philosophy

This project prioritizes:

* simplicity
* maintainability
* consistency
* user experience
* AI-first interactions
* fast iteration
* clean architecture

We do not optimize for enterprise complexity.

We optimize for an exceptional demonstration and a solid product foundation.

---

# AI Development Rules

When generating code:

Always:

* understand existing architecture
* reuse components
* avoid duplication
* prefer composition
* maintain consistency

Never:

* invent APIs
* invent features
* invent database schemas
* ignore documentation
* silently modify architecture

---

# Codex Working Rules

Every AI coding session should follow this order.

1. Read README.md

2. Read relevant documents inside `/docs`

3. Understand current architecture

4. Understand feature scope

5. Implement only requested changes

6. Update documentation if behaviour changes

7. Keep implementation consistent

---

# Prompt Engineering Rules

Prompt files live inside:

```
prompts/
```

Every prompt must:

* have a single responsibility
* produce structured outputs where appropriate
* avoid unnecessary verbosity
* be version controlled
* be documented

No prompts should be hardcoded directly into components.

---

# Coding Standards

General principles:

* TypeScript only
* Strict typing
* Functional components
* Server Components where appropriate
* Reusable UI
* Modular architecture
* Clean naming
* Minimal abstraction
* Readability over cleverness

---

# UI Principles

The interface should feel:

* modern
* minimal
* premium
* calm
* AI-first

Animations should enhance clarity, not distract.

Every interaction should appear intentional.

---

# Architecture Principles

The project follows a layered architecture.

```
UI

↓

Application Logic

↓

AI Layer

↓

External Services

↓

Response
```

Business logic should never live inside UI components.

---

# Performance Principles

* Minimize API calls
* Lazy load heavy components
* Stream AI responses where possible
* Optimize images
* Keep bundle size small
* Prioritize responsiveness

---

# Security Principles

* Never expose API keys
* Validate all inputs
* Sanitize prompt inputs
* Handle API failures gracefully
* Never trust client-side data

---

# Git Guidelines

Commits should be:

* small
* meaningful
* atomic

Example:

```
feat: implement vision analysis

fix: improve reasoning prompt

refactor: simplify map component

docs: update AI architecture
```

---

# Definition of Done

A feature is complete only if:

* Implementation works
* Types are correct
* UI is polished
* Error handling exists
* Documentation is updated
* Acceptance criteria are satisfied

---

# Project Success Criteria

The MVP succeeds if judges can:

* understand the idea within 30 seconds
* complete the demo without confusion
* clearly see the role of AI
* understand why this is different from traditional navigation
* believe the concept could evolve into a real product

---

# Future Vision

CityMind is intended to evolve beyond this hackathon into a comprehensive AI-powered urban intelligence platform capable of integrating multimodal transportation, accessibility data, civic services, and contextual reasoning.

The hackathon MVP is the first step toward that long-term vision.

---

# Living Documentation Policy

This repository uses **living documentation**.

Every architectural decision, feature addition, prompt update, UI change, API modification, or behavioural change **must** be reflected in the relevant document inside `/docs` during the same change.

Documentation is not an afterthought.

Documentation is part of the implementation.

Any pull request or code change that introduces behaviour not described in the documentation should be considered incomplete until the documentation has been updated.

**README.md** defines the repository-wide principles.

The files inside **/docs** define the implementation details.

Together they form the authoritative source of truth for CityMind.
