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

- Rapid development
- Excellent developer experience
- AI-first development
- Fast deployment
- Reliability
- Maintainability
- Production-quality architecture

The objective is not to use the most technologies.

The objective is to use the smallest set of technologies that delivers an exceptional product.

---

# High-Level Stack

| Layer              | Technology                                               |
| ------------------ | -------------------------------------------------------- |
| Framework          | Next.js 15                                               |
| Language           | TypeScript                                               |
| Runtime            | Node.js                                                  |
| Styling            | Tailwind CSS                                             |
| UI Library         | shadcn/ui                                                |
| Animation          | Framer Motion                                            |
| Icons              | Lucide React                                             |
| AI                 | OpenAI Responses API                                     |
| Vision             | OpenAI Vision                                            |
| Map rendering      | Leaflet with OpenStreetMap tiles                         |
| Destination search | Nominatim                                                |
| Directions         | OpenStreetMap OSRM foot routing                          |
| Deployment         | Vercel                                                   |
| Package Manager    | pnpm                                                     |
| Validation         | Zod                                                      |
| Forms              | Native controlled React forms                            |
| HTTP               | Native Fetch                                             |

---

# Framework

## Next.js 15

### Responsibility

Acts as the complete application framework.

Provides:

- Routing
- API routes
- Server Components
- Client Components
- Metadata
- Asset optimization

---

### Why Next.js?

- Excellent AI support
- Fast development
- Server-side capabilities
- Production ready
- Easy deployment on Vercel

---

### Rules

Always prefer:

- App Router
- Server Components
- Server Actions where appropriate

Avoid unnecessary Client Components.

---

# Language

## TypeScript

### Rules

Strict mode enabled.

Never use:

```typescript
any;
```

Instead prefer:

- unknown
- interfaces
- discriminated unions
- generics

All exported functions must be typed.

---

# Styling

## Tailwind CSS

Purpose

Rapid UI development.

Rules

Never write inline styles unless absolutely necessary.

Prefer:

- Utility classes
- Design tokens
- Reusable components

---

# UI Components

## shadcn/ui

Purpose

Provide accessible, modern UI components.

Use for:

- Buttons
- Cards
- Dialogs
- Inputs
- Select
- Tabs
- Sheets
- Toasts

Never modify generated components directly.

Wrap them if customization is required.

---

# Animations

## Framer Motion

Purpose

Smooth interactions.

Use for:

- Page transitions
- Loading states
- Recommendation cards
- Hero animations
- AI response transitions

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

- Vision understanding
- Urban reasoning
- Persona reasoning
- Recommendation generation
- Structured outputs

---

## AI Principles

The AI should:

- Return JSON whenever possible.
- Avoid unnecessary prose.
- Be deterministic where appropriate.
- Explain recommendations.

---

# Maps

## Leaflet + OpenStreetMap + OSRM

Responsibilities

- Leaflet renders the browser map, OpenStreetMap tile layer, route geometry,
  markers, zoom, scale, and a recenter action.
- Nominatim resolves text destinations for the server.
- The OpenStreetMap community OSRM foot router provides walking geometry,
  route metrics, and steps; `OSRM_BASE_URL` can point to a self-hosted foot router.
- A final local estimate is clearly labelled when the live route cannot return.

This small MVP has no mapping key. Leaflet is loaded only in the client map
component and the UI retains a keyboard-readable route summary and local visual
fallback when a shared community mapping service is unavailable.

Map data never proves accessibility by itself. The route contract keeps
accessibility evidence and warnings separate from persona preferences, and the
UI asks users to verify elevators, ramps, curb cuts, surface conditions, and
closures on arrival.

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

## Native Controlled Inputs

The MVP keeps its small number of forms in local React state:

- Destination query
- Chat prompt
- Camera upload selection
- Persona selection

This keeps the workflow readable and avoids global form state. `react-hook-form`
remains an available dependency for future larger forms, but the current
CityMind interaction flow does not require it.

---

# Networking

Use the native Fetch API.

No additional HTTP client is required for the MVP.

Server-side provider calls use a shared `AbortController` timeout helper:

- OpenAI vision, reasoning, and chat: 30 seconds.
- Nominatim search and OSRM routing: 10 seconds.

Provider failures are normalized into typed fallback or error responses; raw
provider exceptions are never shown in the UI.

---

# Environment Variables

All secrets must live in environment variables.

Environment contract (`.env.example` is authoritative):

```env
# Server-only OpenAI credentials.
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini

# Optional self-hosted or approved OSRM-compatible foot router. Leave blank to
# use the no-key OpenStreetMap community foot router for this small MVP.
OSRM_BASE_URL=
```

No mapping credentials are required. The public Nominatim and community OSRM
services are rate-limited shared infrastructure, so CityMind serializes
Nominatim searches and preserves OpenStreetMap attribution. In development,
`.env.local` and `.env` take precedence over inherited shell values; production
uses the deployment environment.

---

# Package Manager

## pnpm

Preferred because:

- Faster installs
- Efficient disk usage
- Reliable lockfile

Use one package manager consistently throughout the project.

---

# Verification and CI

## Vitest + GitHub Actions

Vitest provides focused unit coverage for schemas, normalizers, deterministic
fallback data, destination resolution, and route-provider normalization.

The `Quality` GitHub Actions workflow runs on pull requests and pushes to
`main`. It installs from the lockfile and executes, in order:

```text
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The workflow is a quality gate, not a substitute for a provider-backed manual
demo with real environment variables.

---

# Deployment

## Vercel

Reasons

- Zero configuration
- Excellent Next.js support
- Fast deployments
- Serverless API routes
- Edge-ready

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
RecommendationCard.tsx;
```

---

Hooks

camelCase

```tsx
useCamera.ts;
```

---

Services

camelCase

```tsx
visionService.ts;
```

---

Types

PascalCase

```tsx
Recommendation.ts;
```

---

Constants

UPPER_SNAKE_CASE

---

# Error Handling

Every service must handle:

- Network failures
- Invalid AI output
- Empty responses
- Timeouts
- Permission failures

Never expose raw errors to users.

---

# Logging

Development

Detailed logs.

Production

Minimal logs.

Never log:

- API keys
- Sensitive data
- User images

---

# Accessibility

The application must support:

- Keyboard navigation
- Proper contrast
- Screen readers
- Semantic HTML
- Focus management

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

- Redux
- Zustand
- Docker
- Express
- Spring Boot
- Prisma
- MongoDB
- Redis
- RabbitMQ
- Kubernetes
- Microservices

These technologies are unnecessary for the hackathon MVP and increase implementation complexity.

---

# Future Stack Evolution

Potential additions after the hackathon:

- Supabase
- PostgreSQL
- Voice APIs
- Weather APIs
- Transit APIs
- Real-time event streaming
- AI memory
- Authentication
- Monitoring
- Analytics

These additions should not require major architectural changes.

---

# Engineering Decision Checklist

Before introducing any new dependency, verify:

- Does it solve a real problem?
- Can existing technologies already solve it?
- Does it improve the MVP?
- Does it reduce development time?
- Does it keep the architecture simple?
- Is it production-ready?

If the answer to any of these questions is "no," do not add the dependency.

This document defines the official technology stack for CityMind and must be updated whenever technologies are introduced, replaced, or removed.
