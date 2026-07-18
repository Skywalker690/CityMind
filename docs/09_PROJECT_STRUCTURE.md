# Project Structure

**Project:** CityMind

**Version:** 1.0

**Status:** Repository Structure Specification

---

# Purpose

This document defines the official repository structure of CityMind.

It specifies:

* Folder responsibilities
* File organization
* Naming conventions
* Module ownership
* Import rules
* Dependency flow

The goal is to maintain a clean, scalable, and AI-friendly codebase.

This document is the single source of truth for repository organization.

---

# Repository Philosophy

The repository should be:

* Predictable
* Modular
* Easy to navigate
* AI-friendly
* Feature-oriented
* Scalable

Every folder should have one clear responsibility.

---

# Root Structure

```text
citymind/
│
├── .github/workflows/quality.yml
├── app/
├── components/
├── docs/
├── hooks/
├── lib/
├── prompts/
├── public/
├── services/
├── tests/
├── types/
├── .env.example
├── README.md
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── vitest.config.ts
```

CityMind uses the pinned pnpm lockfile for CI and the documented local install
path. If a `package-lock.json` is present for tool compatibility, it does not
replace the canonical pnpm workflow.

---

# app/

## Purpose

Contains the Next.js App Router shell, route handlers, and framework-level
recovery UI.

Implemented structure

```text
app/
├── api/
│   ├── vision/route.ts
│   ├── reason/route.ts
│   ├── chat/route.ts
│   ├── map/route.ts
│   ├── persona/route.ts
│   └── health/route.ts
├── error.tsx
├── globals.css
├── layout.tsx
├── loading.tsx
└── page.tsx
```

`page.tsx` composes the application shell. `error.tsx` is the route-segment
error boundary and must offer recovery without exposing internal errors.
`loading.tsx` provides the matching framework-level loading state. Route
handlers validate input, delegate to services, and return shared API envelopes.

Rules

* No prompt definitions.
* Keep pages thin.
* Do not put provider logic in route handlers.

---

# components/

## Purpose

Reusable UI components.

Structure

```text
components/
├── camera/CameraCard.tsx
├── cards/
│   ├── RecommendationCard.tsx
│   ├── RecommendationPanel.tsx
│   └── VisionSummary.tsx
├── chat/ChatPanel.tsx
├── common/
│   ├── AnalysisSteps.tsx
│   ├── EmptyState.tsx
│   └── ErrorState.tsx
├── layout/CityMindApp.tsx
├── map/InteractiveMap.tsx
├── persona/PersonaSelector.tsx
└── ui/
```

---

Responsibilities

* Presentation and accessible interaction forwarding
* Reusable and typed
* Local visual state where needed (for example, Mapbox lifecycle)

---

Never place API logic here.

`components/map/InteractiveMap.tsx` owns Mapbox GL lifecycle, markers, and
GeoJSON rendering only. It receives the normalized `RouteSummary` from above;
destination search and directions stay in `services/mapService.ts`.

---

# services/

Purpose

Contains business logic.

Implemented modules

```text
services/
├── chatService.ts
├── fallbackData.ts
├── mapService.ts
├── openaiService.ts
├── promptService.ts
├── reasoningService.ts
└── visionService.ts
```

---

Responsibilities

* API communication
* AI orchestration
* Business rules
* Response transformation
* Provider fallback and timeout recovery

---

Never render UI.

---

# hooks/

Purpose

Reusable React hooks.

Implemented hooks

```text
hooks/
├── useCamera.ts
├── useCityMind.ts
└── useLocation.ts
```

---

Hooks should only contain reusable stateful logic.

---

# lib/

Purpose

Shared utilities.

Structure

```text
lib/
├── api.ts
├── config.ts
├── constants.ts
├── network.ts
├── normalizers.ts
├── personas.ts
├── utils.ts
└── validators.ts
```

---

Contains

* Helper functions
* Configuration
* Validation
* Formatting

---

No business logic.

---

# prompts/

Purpose

Stores every AI prompt.

Structure

```text
prompts/
├── context.md
├── formatter.md
├── persona.md
├── system.md
├── urban-reasoning.md
└── vision.md
```

---

Rules

* One prompt per responsibility.
* Markdown only.
* Version controlled.
* Never hardcode prompts in components.

---

# types/

Purpose

Shared TypeScript models.

Structure

```text
types/
├── api.ts
├── chat.ts
├── map.ts
├── persona.ts
├── recommendation.ts
└── vision.ts
```

---

Rules

No implementation.

Types only.

---

# public/

Purpose

Static assets.

Examples

```text
public/
└── demo/metro-station.svg
```

---

# docs/

Purpose

Project knowledge base.

Contains

* PRD
* Architecture
* Features
* APIs
* Design System
* Prompt Specifications

Documentation is treated as code.

---

# Import Rules

Allowed dependency direction

```text
Feature components
        |
        v
Client hooks and local UI state
        |
        v
Next.js API route handlers
        |
        v
Services and prompt loader
        |
        v
OpenAI / Mapbox / OSRM
```

`InteractiveMap` is the deliberate client-side exception: it dynamically loads
Mapbox GL JS and uses only the public `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` to
render a map. It does not call CityMind's server providers for geocoding or
directions; those remain behind route handlers and `mapService.ts`.

---

Forbidden

```text
Components

↓

Components

↓

Services

↓

Components
```

Business logic must never depend on UI.

---

# Module Boundaries

## Components

May use

* Hooks
* Types
* Utilities

Must NOT use

* AI prompts
* API keys
* Server-only environment variables
* Provider request logic

---

## Services

May use

* Prompts
* Types
* Utilities

Must NOT use

* React
* JSX
* UI Components

---

## Hooks

May use

* Types
* Client-side API helpers

Must NOT directly call OpenAI.

`useCityMind` owns the client workflow state and calls CityMind's `/api/*`
endpoints. It never imports server services or credentials.

---

# Naming Conventions

Folders

kebab-case

Example

```text
recommendation-card/
```

---

Components

PascalCase

```tsx
RecommendationCard.tsx
```

---

Hooks

camelCase

```tsx
useCamera.ts
```

---

Services

camelCase

```tsx
visionService.ts
```

---

Type exports

PascalCase

```tsx
Recommendation.ts
```

---

Constants

UPPER_SNAKE_CASE

---

# File Size Guidelines

Components

Preferred

< 250 lines

Maximum

400 lines

---

Services

Preferred

< 300 lines

Split when responsibilities increase.

---

Hooks

Preferred

< 150 lines

---

# Shared Components

Examples

* Button
* Card
* Badge
* Avatar
* LoadingSpinner
* ErrorCard
* AIResponse
* RecommendationCard
* PersonaSelector

These should be reusable throughout the application.

---

# Feature Isolation

Every major feature should remain independent.

Camera changes should not require modifying chat.

Map changes should not require modifying vision.

Prompt updates should not require UI changes.

---

# tests/ and CI

`tests/` mirrors the modules it covers:

```text
tests/
├── lib/
│   ├── normalizers.test.ts
│   └── validators.test.ts
└── services/
    ├── fallbackData.test.ts
    └── mapService.test.ts
```

Keep provider calls mocked at this layer. Tests validate the shared contracts,
destination resolution states, fallback honesty, and provider-result
normalization without requiring live credentials. `.github/workflows/quality.yml`
enforces formatting, linting, typechecking, tests, and a production build.

---

# Documentation Rules

Whenever a folder structure changes:

Update

* README
* PROJECT_STRUCTURE.md
* SYSTEM_ARCHITECTURE.md

Documentation must always match the repository.

---

# Repository Evolution

Future folders may include:

```text
database/

analytics/

voice/

agents/

scripts/
```

These should only be introduced when justified by product requirements.

---

# Repository Checklist

Before creating a new file:

* Does a similar file already exist?
* Does it belong in the correct folder?
* Does it have a single responsibility?
* Will another developer immediately understand its purpose?
* Does it follow the naming conventions?

If any answer is "no," reconsider the structure.

---

# Guiding Principle

A developer unfamiliar with CityMind should be able to understand the repository within five minutes.

The repository should be optimized not only for human developers but also for AI coding assistants such as Codex, ensuring predictable organization, minimal ambiguity, and high maintainability.
