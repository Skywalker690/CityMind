# Implementation Plan

**Project:** CityMind

**Version:** 1.1

**Status:** MVP Implementation and Verification Plan

---

# Purpose

This document records the delivery plan and current implementation state for the
CityMind MVP. The product remains focused on one complete experience:

~~~text
Photo -> Scene understanding -> Persona and destination context
      -> Reasoning -> Explained recommendation -> Route visualization -> Follow-up
~~~

The plan intentionally excludes accounts, payments, notifications, history,
analytics, admin workflows, and other scope that does not strengthen this flow.

---

# Delivery Principles

* Build a complete vertical slice before expanding scope.
* Keep the client, API, services, prompts, and types synchronized.
* Prefer transparent degradation to fabricated urban facts.
* Validate external and AI output before it reaches the UI.
* Test contracts and fallbacks without needing live credentials.
* Treat a route as walking guidance, not proof of accessibility.

---

# Current MVP Status

## Phase 1 - Foundation: Complete

Delivered:

* Next.js App Router, TypeScript, Tailwind, shadcn/ui, Framer Motion, Zod, and
  OpenAI Responses API integration.
* Modular app, component, hook, service, prompt, type, and test boundaries.
* Shared API success/error envelopes and runtime input validation.
* Environment template and Vercel-compatible application structure.

## Phase 2 - Guided Experience: Complete

Delivered:

* Single-workspace responsive layout with inline onboarding.
* Persona selection, location request, destination query, camera, map, and chat
  panels.
* Light/dark theme toggle using shared semantic CSS tokens.
* Explicit image review and Confirm and analyze step.
* Empty, loading, recovery, and framework-level error-boundary states.
* Recommendation and nearby-place actions that move focus to the relevant
  workflow section.

## Phase 3 - Vision: Complete

Delivered:

* Browser camera capture, image upload, retake, replacement, and a deterministic
  demo scene.
* Image-size and MIME validation at the API boundary.
* OpenAI structured vision output parsed by Zod.
* Persona-neutral deterministic fallback scene data with visible uncertainty.

## Phase 4 - Reasoning and Conversation: Complete

Delivered:

* Context merging for scene, persona, question, location, and optional
  destination.
* Prompt loading from the prompts directory only.
* Structured, validated OpenAI reasoning and follow-up chat output.
* Persona-specific fallback recommendations that do not invent infrastructure.
* Current-session chat context and operation-specific retry behavior.

## Phase 5 - Destinations and Maps: Complete

Delivered:

* Typed destinationQuery and destination contracts.
* Mapbox Geocoding for text destination resolution.
* Mapbox Directions as the preferred walking-route provider.
* Configured foot-profile OSRM as a secondary live route provider.
* Honest estimated route only after both live direction providers fail.
* Mapbox GL JS rendering with route GeoJSON, markers, navigation controls,
  recenter action, and text/local visual fallback.
* Separate route source, route status, and accessibility evidence/warning
  fields. Persona priorities never mark a route as verified accessible.

## Phase 6 - Resilience and Accessibility: Complete

Delivered:

* Shared abortable timeout helper: 30 seconds for OpenAI work and 10 seconds for
  mapping work.
* Typed fallback behavior for AI, routing, destination resolution, and map
  rendering.
* Keyboard navigation, visible focus, status messaging, reduced-motion support,
  responsive layouts, skip link, and text route alternatives.
* Friendly error states that preserve the last valid workflow context.

## Phase 7 - Automated Quality: Complete

Delivered:

* Vitest coverage for validators, normalizers, fallback data, destination
  resolution, and route-provider behavior.
* Formatting, linting, typechecking, test, and production build scripts.
* GitHub Actions Quality workflow on pull requests and pushes to main.

---

# Map and Route Decision Tree

~~~text
Destination coordinates
        |
        +--> use exact coordinates
        |
Destination query / label / prompt phrase
        |
        v
Mapbox Geocoding
        |
        +--> unresolved -> show typed resolution message; no route
        |
        v
Mapbox Directions walking
        |
        +--> usable route -> source: mapbox, status: routed
        |
        v
OSRM foot routing
        |
        +--> usable route -> source: osrm, status: routed
        |
        v
Local estimate
        |
        --> source: fallback, status: estimated, verification warnings
~~~

Accessibility confirmation is independent of the decision tree. A map route can
be live while step-free infrastructure remains unverified.

---

# Environment and Deployment Readiness

Copy .env.example into a local environment file and configure as needed:

~~~env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=
MAPBOX_ACCESS_TOKEN=
OSRM_BASE_URL=
~~~

Deployment is Vercel-ready once the production environment contains the
appropriate provider credentials. The public Mapbox browser token is expected
to be exposed to the browser; OpenAI and server Mapbox credentials are not.

OSRM is optional and must point to a provider configured with a walking/foot
profile. A generic public route endpoint must not be described as a reliable
walking fallback unless its profile has been verified.

A provider-free local demo remains usable, but it deliberately presents
fallback data and warnings rather than live provider claims.

---

# Verification Sequence

Run these checks before merging or demonstrating a change:

~~~text
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
~~~

Then perform one manual workflow in each of these modes:

1. Live mode with OpenAI and Mapbox configured.
2. No OpenAI key, confirming structured fallback vision/reasoning/chat.
3. Missing or invalid Mapbox public token, confirming map text/local fallback.
4. Missing destination token or unmatched text destination, confirming no
   guessed route.
5. Live route provider failure, confirming an explicitly labelled estimate only
   after the secondary provider is attempted.
6. Keyboard-only path through capture, confirmation, destination, route, and
   chat.
7. Reduced-motion and dark-theme checks.

The automated suite validates contracts and fallbacks. Manual checks validate
browser camera behavior, Mapbox rendering, provider credentials, and mobile
layout.

---

# Definition of Done

A CityMind MVP change is complete only when:

* The code follows the documented layered architecture.
* Input and provider output are validated and typed.
* Loading, success, error, and retry states are present.
* AI and fallback guidance clearly distinguishes certainty from assumptions.
* A textual destination is never silently replaced with a default destination.
* Map rendering failure does not hide route information.
* Accessibility is not claimed without evidence.
* Relevant documentation, tests, and the CI quality gate are updated.
* The quality commands and an appropriate manual smoke test pass.

---

# Known Product Boundaries

These are deliberate MVP boundaries, not hidden defects:

* No user accounts, persistence, or saved history.
* No live transit, crowd, weather, or verified accessibility-data integration.
* No guarantee that a walking route is step-free.
* No place-search result is treated as a confirmed operational service without
  verification.
* No offline routing or maps.

Future expansion may add trusted accessibility data, transit feeds, and
persistent preferences only if it preserves the core vision-to-recommendation
experience.
