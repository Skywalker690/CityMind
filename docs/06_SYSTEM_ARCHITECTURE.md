# System Architecture

**Project:** CityMind

**Version:** 1.0

**Status:** Architecture Specification

---

# Purpose

This document defines the complete software architecture of CityMind.

It explains how every component communicates, where responsibilities belong, and how data flows through the system.

This document is the authoritative reference for architectural decisions.

---

# Architecture Goals

The architecture should prioritize:

- Simplicity
- Fast development
- Maintainability
- AI-first workflows
- Separation of concerns
- Easy deployment
- Scalability after the hackathon

---

# Architecture Style

CityMind follows a lightweight layered architecture.

```
Presentation Layer
        │
Application Layer
        │
AI Orchestration Layer
        │
External Services Layer
```

No unnecessary backend complexity.

Everything exists to support the Vision + Urban Reasoning workflow.

---

# High-Level Architecture

```
User
 │
 ▼
Next.js Frontend
 │
 ▼
Next.js API Routes
 │
 ├──────────────┐
 ▼              ▼
OpenAI API   Google Maps Platform / OSRM APIs
 │              │
 └──────┬───────┘
        ▼
 Urban Reasoning Engine
        │
        ▼
 Structured AI Response
        │
        ▼
UI Rendering
```

---

# Technology Decisions

## Frontend

Responsibilities

- UI
- Camera
- Image upload
- Chat
- Maps
- Animations
- Persona selection

Technology

- Next.js
- React
- Tailwind
- shadcn/ui
- Framer Motion

---

## API Layer

Responsibilities

- Validate requests
- Call AI
- Call Maps
- Merge responses
- Return structured output

Technology

- Next.js Route Handlers

---

## AI Layer

Responsibilities

- Vision analysis
- Urban reasoning
- Persona reasoning
- Recommendation generation
- Structured JSON output

Technology

- OpenAI Responses API

---

## External Services

### Google Maps Platform + OSRM

Responsibilities

- Google Maps JavaScript API renders the interactive browser map.
- Google Places API (New) Text Search resolves a user-entered destination to
  coordinates.
- Google Routes API Compute Routes provides the preferred walking-route
  geometry, distance, duration, and turn steps.
- A configured foot-profile OSRM endpoint is a secondary routing provider when
  Google Routes cannot return a usable route.
- `services/mapService.ts` isolates provider payloads and exposes only shared
  typed destination and route contracts to the rest of the app.

Map rendering uses `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`; an optional
`NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` enables Advanced Markers and custom map
styling. Server-side destination search and routing use
`GOOGLE_MAPS_SERVER_API_KEY`, falling back to the public key only for local/demo
compatibility. `OSRM_BASE_URL` configures the optional secondary foot-routing
provider.

---

### OpenAI

Responsibilities

- Vision
- Reasoning
- Tool calling
- Structured outputs

---

# Architectural Principles

## Single Responsibility

Every module should perform exactly one responsibility.

Examples

Vision Service

Only vision.

Reasoning Service

Only reasoning.

Maps Service

Only maps.

---

## Separation of Concerns

UI never contains business logic.

Business logic never directly manipulates UI.

AI prompting never lives inside React components.

---

## Reusable Components

Every major UI element should be reusable.

Examples

- Camera Card
- Chat Bubble
- Recommendation Card
- Persona Selector
- Map Panel

---

# Request Lifecycle

```
User
 │
Capture Image
 │
 ▼
Upload Image
 │
 ▼
API Route
 │
 ▼
Vision Analysis
 │
 ▼
Context Builder
 │
 ▼
Urban Reasoning
 │
 ▼
Recommendation
 │
 ▼
Frontend Rendering
```

---

# Module Responsibilities

## UI Layer

Responsible for

- Rendering
- User interaction
- Animations
- Accessibility
- State display

Must NOT

- Call AI directly
- Contain prompts
- Contain business logic

---

## Application Layer

Responsible for

- Request validation
- Orchestration
- Data transformation
- Error handling

---

## AI Layer

Responsible for

- Image understanding
- Context merging
- Persona reasoning
- Decision generation

---

## Maps Layer

Responsible for

- Directions
- Places
- Geocoding
- Visualization

The map layer does not infer accessibility from a persona. It exposes provider
status, route status, and evidence separately so the UI can distinguish a
routed walk from an estimated guide and verified accessibility from an
unverified preference.

---

# Data Flow

## Vision Flow

```
Camera

↓

Image

↓

Vision API

↓

Scene Summary

↓

Context Builder
```

---

## Reasoning Flow

```
Scene Summary

+

Persona

+

User Prompt

+

Location

↓

AI Reasoning

↓

Recommendation
```

---

## Rendering Flow

```
Recommendation

↓

Recommendation Cards

↓

Map Updates

↓

Conversation
```

---

## Destination and Route Flow

```text
Destination coordinates, destinationQuery, or destination language in a prompt
        |
        v
Typed destination resolution
  resolved | missing | unavailable | not-found
        |
        +-- resolved --> Google Routes walking --> OSRM secondary --> RouteSummary
        |
        +-- otherwise --> no fabricated route; actionable resolution message
```

Explicit coordinates win over a text query. A text query is resolved through
Google Places API (New) Text Search only when a Google Maps key is configured.
`RouteSummary` carries the origin, destination, GeoJSON line, normalized route
points, metrics, steps, provider source (`google`, `osrm`, or `fallback`),
status (`routed` or `estimated`), and
accessibility evidence/warnings. The route always represents a walking route;
it is never called step-free or accessible unless trusted evidence explicitly
verifies that claim.

---

# Folder Responsibilities

```
app/
```

Routing and pages.

---

```
components/
```

Reusable UI.

---

```
services/
```

External API communication.

---

```
lib/
```

Utilities.

---

```
prompts/
```

Prompt templates.

---

```
types/
```

Shared TypeScript types.

---

# Error Handling

The architecture should gracefully recover from:

- OpenAI failures
- Invalid images
- Map failures
- Slow responses
- Network issues

Users should always receive actionable feedback.

All provider calls use `AbortController`-based timeouts. Vision, reasoning, and
chat allow up to 30 seconds; Google Places search and Google Routes requests
allow up to 10 seconds. The configured OSRM secondary route provider also has a
10-second limit. A timeout follows the same recovery policy as another provider
failure,
without leaking provider details to the user.

## MVP Fallback Mode

The implemented MVP includes deterministic fallback behavior when external
credentials are missing or an external provider fails.

Fallback behavior applies to:

- OpenAI vision analysis, urban reasoning, and chat follow-ups.
- Google Routes walking requests, followed by a configured foot-profile
  OSRM endpoint when the primary route provider fails.
- Google Maps JavaScript API browser rendering, where a local route visual preserves the rest of
  the workflow.

Fallback responses still follow the same typed response contracts and never
invent confirmed infrastructure. If Google Places cannot resolve a textual destination,
CityMind returns the typed resolution status and does not create a route to a
guessed location. If both live route providers fail after a destination
resolves, the route is marked as an estimated fallback and its warnings make
the limitation visible.

---

# Scalability

Future additions should require minimal architectural changes.

Examples

- Voice input
- Weather API
- Transit APIs
- Crowd prediction
- Multi-agent reasoning
- Memory
- User profiles

The architecture should allow these to be added without rewriting existing modules.

---

# Security Principles

- API keys remain server-side.
- Input validation on every request.
- Images are never permanently stored in the MVP.
- Prompt injection attempts should be sanitized where practical.
- Client should never access private service credentials.

---

# Performance Goals

- Minimal client-side JavaScript.
- Lazy-load heavy UI.
- Stream AI responses when possible.
- Optimize image uploads.
- Avoid duplicate API requests.

---

# Deployment Architecture

```
Vercel

│

├── Next.js Frontend

├── API Routes

│

├── OpenAI

└── Google Maps Platform / OSRM
```

Single deployment.

No separate backend servers.

---

# Architectural Constraints

The MVP intentionally avoids:

- Microservices
- Docker
- Message queues
- Redis
- Background workers
- Complex databases
- Authentication systems

These are unnecessary for the hackathon objective and would increase implementation time.

---

# Architecture Review Checklist

Before adding any new module, verify:

- Does it fit the layered architecture?
- Does it have a single responsibility?
- Does it duplicate existing functionality?
- Does it improve the Vision + Urban Reasoning workflow?
- Can it be reused?
- Does it keep the MVP focused?

If any answer is "no", redesign before implementation.

This architecture is intentionally optimized for rapid development, clean separation of concerns, and an impressive hackathon demonstration while remaining extensible for future growth.
