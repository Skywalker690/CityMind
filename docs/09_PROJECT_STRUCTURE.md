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
├── app/
├── components/
├── services/
├── hooks/
├── lib/
├── prompts/
├── types/
├── public/
├── docs/
├── .env.example
├── README.md
├── next.config.ts
├── package.json
├── tsconfig.json
└── tailwind.config.ts
```

---

# app/

## Purpose

Contains the complete application routing.

This follows the Next.js App Router architecture.

---

Recommended Structure

```text
app/

layout.tsx

page.tsx

(camera)/

chat/

map/

settings/

api/
```

---

Rules

* No business logic.
* No prompt definitions.
* Keep pages thin.
* Pages should orchestrate components only.

---

# components/

## Purpose

Reusable UI components.

Structure

```text
components/

camera/

chat/

map/

cards/

navigation/

persona/

common/

ui/
```

---

Responsibilities

* Presentation only
* Reusable
* Stateless where possible

---

Never place API logic here.

---

# services/

Purpose

Contains business logic.

Example

```text
services/

vision.service.ts

reasoning.service.ts

map.service.ts

location.service.ts

prompt.service.ts
```

---

Responsibilities

* API communication
* AI orchestration
* Business rules
* Response transformation

---

Never render UI.

---

# hooks/

Purpose

Reusable React hooks.

Examples

```text
hooks/

useCamera.ts

useLocation.ts

useChat.ts

usePersona.ts

useVision.ts
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

utils.ts

constants.ts

config.ts

logger.ts

validators.ts
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

system.md

vision.md

urban-reasoning.md

persona.md

formatter.md
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

vision.ts

chat.ts

map.ts

recommendation.ts

persona.ts

api.ts
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

images/

icons/

illustrations/

demo/
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
UI

↓

Hooks

↓

Services

↓

External APIs
```

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
* Environment variables

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

* Services
* Types

Must NOT directly call OpenAI.

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

Types

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

tests/

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
