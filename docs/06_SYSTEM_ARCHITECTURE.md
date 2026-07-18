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

* Simplicity
* Fast development
* Maintainability
* AI-first workflows
* Separation of concerns
* Easy deployment
* Scalability after the hackathon

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
OpenAI API   OSM / OSRM APIs
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

* UI
* Camera
* Image upload
* Chat
* Maps
* Animations
* Persona selection

Technology

* Next.js
* React
* Tailwind
* shadcn/ui
* Framer Motion

---

## API Layer

Responsibilities

* Validate requests
* Call AI
* Call Maps
* Merge responses
* Return structured output

Technology

* Next.js Route Handlers

---

## AI Layer

Responsibilities

* Vision analysis
* Urban reasoning
* Persona reasoning
* Recommendation generation
* Structured JSON output

Technology

* OpenAI Responses API

---

## External Services

### OpenStreetMap + OSRM

Responsibilities

* Maps
* Base map tiles
* Route geometry
* Route distance and duration

---

### OpenAI

Responsibilities

* Vision
* Reasoning
* Tool calling
* Structured outputs

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

* Camera Card
* Chat Bubble
* Recommendation Card
* Persona Selector
* Map Panel

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

* Rendering
* User interaction
* Animations
* Accessibility
* State display

Must NOT

* Call AI directly
* Contain prompts
* Contain business logic

---

## Application Layer

Responsible for

* Request validation
* Orchestration
* Data transformation
* Error handling

---

## AI Layer

Responsible for

* Image understanding
* Context merging
* Persona reasoning
* Decision generation

---

## Maps Layer

Responsible for

* Directions
* Places
* Geocoding
* Visualization

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

* OpenAI failures
* Invalid images
* Map failures
* Slow responses
* Network issues

Users should always receive actionable feedback.

## MVP Fallback Mode

The implemented MVP includes deterministic fallback behavior when external
credentials are missing or an external provider fails.

Fallback behavior applies to:

* OpenAI vision analysis
* OpenAI urban reasoning
* OpenAI chat follow-ups
* OSRM route generation
* Leaflet / OpenStreetMap map rendering

Fallback responses must still follow the same typed response contracts and must
not invent confirmed infrastructure. They should clearly communicate uncertainty
and guide the user toward verification.

---

# Scalability

Future additions should require minimal architectural changes.

Examples

* Voice input
* Weather API
* Transit APIs
* Crowd prediction
* Multi-agent reasoning
* Memory
* User profiles

The architecture should allow these to be added without rewriting existing modules.

---

# Security Principles

* API keys remain server-side.
* Input validation on every request.
* Images are never permanently stored in the MVP.
* Prompt injection attempts should be sanitized where practical.
* Client should never access private service credentials.

---

# Performance Goals

* Minimal client-side JavaScript.
* Lazy-load heavy UI.
* Stream AI responses when possible.
* Optimize image uploads.
* Avoid duplicate API requests.

---

# Deployment Architecture

```
Vercel

│

├── Next.js Frontend

├── API Routes

│

├── OpenAI

└── OpenStreetMap / OSRM
```

Single deployment.

No separate backend servers.

---

# Architectural Constraints

The MVP intentionally avoids:

* Microservices
* Docker
* Message queues
* Redis
* Background workers
* Complex databases
* Authentication systems

These are unnecessary for the hackathon objective and would increase implementation time.

---

# Architecture Review Checklist

Before adding any new module, verify:

* Does it fit the layered architecture?
* Does it have a single responsibility?
* Does it duplicate existing functionality?
* Does it improve the Vision + Urban Reasoning workflow?
* Can it be reused?
* Does it keep the MVP focused?

If any answer is "no", redesign before implementation.

This architecture is intentionally optimized for rapid development, clean separation of concerns, and an impressive hackathon demonstration while remaining extensible for future growth.
