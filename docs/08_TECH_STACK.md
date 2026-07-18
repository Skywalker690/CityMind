# Technology Stack

**Project:** CityMind

**Version:** 1.0

**Status:** Engineering Specification

---

# Purpose

This document defines every technology used in CityMind.

It explains **why** each technology was chosen, what responsibility it has, acceptable alternatives, and engineering rules for using it.

This is the authoritative reference for technology decisions.

---

# Engineering Philosophy

Technology choices should optimize for:

* Rapid development
* Excellent developer experience
* AI-first development
* Fast deployment
* Reliability
* Maintainability
* Production-quality architecture

The objective is not to use the most technologies.

The objective is to use the smallest set of technologies that delivers an exceptional product.

---

# High-Level Stack

| Layer           | Technology           |
| --------------- | -------------------- |
| Framework       | Next.js 15           |
| Language        | TypeScript           |
| Runtime         | Node.js              |
| Styling         | Tailwind CSS         |
| UI Library      | shadcn/ui            |
| Animation       | Framer Motion        |
| Icons           | Lucide React         |
| AI              | OpenAI Responses API |
| Vision          | OpenAI Vision        |
| Maps            | Leaflet + OpenStreetMap |
| Routing         | OSRM                 |
| Deployment      | Vercel               |
| Package Manager | pnpm                 |
| Validation      | Zod                  |
| Forms           | React Hook Form      |
| HTTP            | Native Fetch         |

---

# Framework

## Next.js 15

### Responsibility

Acts as the complete application framework.

Provides:

* Routing
* API routes
* Server Components
* Client Components
* Metadata
* Asset optimization

---

### Why Next.js?

* Excellent AI support
* Fast development
* Server-side capabilities
* Production ready
* Easy deployment on Vercel

---

### Rules

Always prefer:

* App Router
* Server Components
* Server Actions where appropriate

Avoid unnecessary Client Components.

---

# Language

## TypeScript

### Rules

Strict mode enabled.

Never use:

```typescript
any
```

Instead prefer:

* unknown
* interfaces
* discriminated unions
* generics

All exported functions must be typed.

---

# Styling

## Tailwind CSS

Purpose

Rapid UI development.

Rules

Never write inline styles unless absolutely necessary.

Prefer:

* Utility classes
* Design tokens
* Reusable components

---

# UI Components

## shadcn/ui

Purpose

Provide accessible, modern UI components.

Use for:

* Buttons
* Cards
* Dialogs
* Inputs
* Select
* Tabs
* Sheets
* Toasts

Never modify generated components directly.

Wrap them if customization is required.

---

# Animations

## Framer Motion

Purpose

Smooth interactions.

Use for:

* Page transitions
* Loading states
* Recommendation cards
* Hero animations
* AI response transitions

Avoid decorative animations that do not improve usability.

---

# Icons

## Lucide React

Purpose

Consistent iconography.

Preferred over mixed icon libraries.

---

# AI

## OpenAI Responses API

Responsibilities

* Vision understanding
* Urban reasoning
* Persona reasoning
* Recommendation generation
* Structured outputs

---

## AI Principles

The AI should:

* Return JSON whenever possible.
* Avoid unnecessary prose.
* Be deterministic where appropriate.
* Explain recommendations.

---

# Maps

## Leaflet + OpenStreetMap + OSRM

Responsibilities

* Map rendering
* OpenStreetMap tile display
* Route geometry
* Route distance and duration
* Location visualization

Chosen because it provides an open-source, no-key MVP map stack while
preserving the required interactive map and route visualization workflow.
OpenStreetMap public tile usage must remain lightweight and attribution must be
shown. OSRM public routing is suitable for demo usage; production usage should
use a hosted provider plan or self-hosted routing.

---

# Validation

## Zod

Purpose

Runtime validation.

Every external API response should be validated.

Every AI structured output should be parsed using Zod before rendering.

Never trust raw AI responses.

---

# Forms

## React Hook Form

Purpose

Manage:

* User prompts
* Persona selection
* Future configuration forms

Keep forms lightweight and performant.

---

# Networking

Use the native Fetch API.

No additional HTTP client is required for the MVP.

---

# Environment Variables

All secrets must live in environment variables.

Required variables:

```env
OPENAI_API_KEY=

OSRM_BASE_URL=https://router.project-osrm.org
```

Never expose server-side secrets to the client.

---

# Package Manager

## pnpm

Preferred because:

* Faster installs
* Efficient disk usage
* Reliable lockfile

Use one package manager consistently throughout the project.

---

# Deployment

## Vercel

Reasons

* Zero configuration
* Excellent Next.js support
* Fast deployments
* Serverless API routes
* Edge-ready

Deployment should happen from the main branch.

---

# Folder Ownership

## app/

Application routing.

---

## components/

Reusable UI.

---

## services/

Business logic.

External APIs.

---

## lib/

Utilities.

Configurations.

Constants.

---

## prompts/

Prompt templates.

---

## hooks/

Reusable React hooks.

---

## types/

Shared TypeScript types.

---

## public/

Static assets.

---

# Coding Standards

## Naming

Components

PascalCase

Example

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

# Error Handling

Every service must handle:

* Network failures
* Invalid AI output
* Empty responses
* Timeouts
* Permission failures

Never expose raw errors to users.

---

# Logging

Development

Detailed logs.

Production

Minimal logs.

Never log:

* API keys
* Sensitive data
* User images

---

# Accessibility

The application must support:

* Keyboard navigation
* Proper contrast
* Screen readers
* Semantic HTML
* Focus management

Accessibility is a core requirement, not a future enhancement.

---

# Performance Targets

Initial page load

< 3 seconds

AI response

< 10 seconds

Map rendering

< 2 seconds

Image upload

< 5 MB recommended

Animations

60 FPS where possible

---

# Technology Constraints

Do **not** introduce:

* Redux
* Zustand
* Docker
* Express
* Spring Boot
* Prisma
* MongoDB
* Redis
* RabbitMQ
* Kubernetes
* Microservices

These technologies are unnecessary for the hackathon MVP and increase implementation complexity.

---

# Future Stack Evolution

Potential additions after the hackathon:

* Supabase
* PostgreSQL
* Voice APIs
* Weather APIs
* Transit APIs
* Real-time event streaming
* AI memory
* Authentication
* Monitoring
* Analytics

These additions should not require major architectural changes.

---

# Engineering Decision Checklist

Before introducing any new dependency, verify:

* Does it solve a real problem?
* Can existing technologies already solve it?
* Does it improve the MVP?
* Does it reduce development time?
* Does it keep the architecture simple?
* Is it production-ready?

If the answer to any of these questions is "no," do not add the dependency.

This document defines the official technology stack for CityMind and must be updated whenever technologies are introduced, replaced, or removed.
