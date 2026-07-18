# Implementation Plan

**Project:** CityMind

**Version:** 1.3

**Status:** MVP Implementation and Verification Plan

---

# Purpose

This document records the delivery plan and implementation state for the
CityMind MVP. The product remains focused on one complete urban-decision
experience, delivered as a controlled workflow instead of a simultaneous
dashboard:

```text
Capture -> Confirm -> Ask -> Act
```

```text
Scene image -> approved scene understanding -> user intent and destination
-> explained recommendation -> route context -> contextual follow-up
```

The plan intentionally excludes accounts, payments, notifications, history,
analytics, admin workflows, and other scope that does not strengthen this flow.

---

# Delivery Principles

- Build and verify a complete vertical slice before expanding scope.
- Give each workflow stage one clear primary action.
- Keep client, API, services, prompts, types, and documentation synchronized.
- Prefer transparent degradation to fabricated urban facts.
- Validate external and AI output before it reaches the UI.
- Test contracts and fallbacks without live credentials.
- Treat a walking route as guidance, not proof of accessibility.
- Use tactile visual depth to orient interaction, never as the only state cue.

---

# Current MVP Status

## Phase 1 - Foundation: Complete

Delivered:

- Next.js App Router, TypeScript, Tailwind, shadcn/ui, Framer Motion, Zod, and
  OpenAI Responses API integration.
- Modular app, component, hook, service, prompt, type, and test boundaries.
- Shared API success/error envelopes and runtime input validation.
- Environment template and Vercel-compatible application structure.

## Phase 2 - Staged Guided Experience: Complete

Delivered:

- One responsive application route with a controlled Capture -> Confirm -> Ask
  -> Act workflow.
- A step rail that shows active, completed, and unavailable stages and prevents
  skipping required context.
- Automatic stage progression after image selection, successful vision, and
  successful reasoning, while allowing return to completed stages.
- Dedicated `CaptureStep`, `ConfirmStep`, `QuestionStep`, and `ActStep`
  components instead of a simultaneous three-column dashboard.
- Explicit image review, persona choice, optional device location, and an
  Analyze this scene consent action before vision analysis.
- A restrained skeuomorphic visual system: raised workspace/rail/panels, inset
  review wells, tactile controls, visible focus, and accessible state labels.
- Light/dark theme toggle that honors system preference initially and stores a
  local browser choice.
- Empty, loading, recovery, and framework-level error-boundary states.
- Recommendation and nearby-place actions that move focus to relevant Act-stage
  context.

## Phase 3 - Vision: Complete

Delivered:

- Browser camera capture, image upload, retake, replacement, and deterministic
  demo scene.
- Image-size and MIME validation at the API boundary.
- OpenAI structured vision output parsed by Zod.
- Persona-neutral deterministic fallback scene data with visible uncertainty.

## Phase 4 - Reasoning and Conversation: Complete

Delivered:

- Context merging for scene, persona, question, location, and optional
  destination.
- Prompt loading from the prompts directory only.
- Structured, validated OpenAI reasoning and follow-up chat output.
- Persona-specific fallback recommendations that do not invent infrastructure.
- Current-session chat context and operation-specific retry behavior.
- Persona changes that can re-run the most recent question using new mobility
  context without requiring a new scene.

## Phase 5 - Destinations and Maps: Complete

Delivered:

- Typed destinationQuery and destination contracts.
- Google Places API (New) Text Search for text-destination resolution.
- Google Routes API Compute Routes as the preferred walking-route provider.
- Configured foot-profile OSRM as a secondary live route provider.
- Honest estimated route only after both live direction providers fail.
- Google Maps JavaScript API rendering with route polyline, markers, zoom,
  map-type, fullscreen, Street View, recenter controls, and text/local visual
  fallback.
- Optional Google map ID support for Advanced Markers and custom map styling,
  with a compatible marker fallback when no map ID is configured.
- Separate route source, route status, and accessibility evidence/warning
  fields. Persona priorities never mark a route as verified accessible.

## Phase 6 - Resilience and Accessibility: Complete

Delivered:

- Shared abortable timeout helper: 30 seconds for OpenAI work and 10 seconds
  for mapping work.
- Typed fallback behavior for AI, routing, destination resolution, and map
  rendering.
- Keyboard navigation, visible focus, status messaging, reduced-motion support,
  responsive layouts, skip link, controlled stage navigation, and text route
  alternatives.
- Friendly error states that preserve the last valid workflow context.

## Phase 7 - Automated Quality: Complete

Delivered:

- Vitest coverage for validators, normalizers, fallback data, destination
  resolution, and route-provider behavior.
- Formatting, linting, typechecking, test, and production-build scripts.
- GitHub Actions Quality workflow on pull requests and pushes to main.

---

# Workflow State Contract

| Stage   | Prerequisite           | Primary completion event       | Required feedback                                       |
| ------- | ---------------------- | ------------------------------ | ------------------------------------------------------- |
| Capture | None                   | Image selected.                | Camera/upload/demo state and image preview.             |
| Confirm | Image preview.         | Vision analysis completes.     | Persona/location context and analysis progress.         |
| Ask     | Scene understanding.   | Reasoning completes.           | Question/destination validation and reasoning state.    |
| Act     | Recommendation result. | User acts or refines via chat. | Recommendation, route status, fallback, and chat state. |

The implementation must derive available stages from the existing image, scene,
and result data rather than creating a second source of truth. Future stages
are unavailable. Completed stages can be revisited. Replacing the image resets
the dependent scene, recommendation, and conversation context.

---

# Map and Route Decision Tree

```text
Destination coordinates
        |
        +--> use exact coordinates
        |
Destination query / label / prompt phrase
        |
        v
Google Places API (New) Text Search
        |
        +--> unresolved -> show typed resolution message; no route
        |
        v
Google Routes API Compute Routes walking
        |
        +--> usable route -> source: google, status: routed
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
```

Accessibility confirmation is independent of the route decision tree. A live
route can still have unverified step-free infrastructure.

---

# Environment and Deployment Readiness

Copy `.env.example` into a local environment file and configure as needed:

```env
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4.1-mini
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=
GOOGLE_MAPS_SERVER_API_KEY=
OSRM_BASE_URL=
```

Deployment is Vercel-ready once production contains appropriate provider
credentials. The public Google Maps browser key is intentionally browser-visible
and must be restricted to approved app origins. OpenAI and the server Google
Maps key are not browser-visible. A server key is required for deployment; the
app falls back to the browser key only for local/demo compatibility.

OSRM is optional and must point to a provider configured with a walking/foot
profile. A generic public route endpoint must not be described as a reliable
walking fallback unless its profile has been verified.

A provider-free local demo remains usable, but it deliberately presents
fallback data and warnings rather than live provider claims.

---

# Verification Sequence

Run these checks before merging or demonstrating a change:

```text
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Then perform these manual checks:

1. Complete Capture -> Confirm -> Ask -> Act in live mode with OpenAI and
   Google Maps Platform configured.
2. Confirm that selecting an image does not call vision until Analyze this scene
   is chosen.
3. Confirm future stages are disabled, completed stages are revisitable, and
   a successful operation advances to the correct next stage.
4. Replace an image and confirm that dependent scene, recommendation, and chat
   state reset safely.
5. Change persona after a completed question and confirm re-reasoning uses the
   same scene with the new persona.
6. Run without OpenAI and confirm structured fallback vision/reasoning/chat.
7. Run with missing or invalid Google Maps browser key and confirm map text/local
   fallback.
8. Use an unmatched text destination and confirm no guessed route is drawn.
9. Force live route-provider failure and confirm an explicitly labelled
   estimate only after the secondary provider is attempted.
10. Test keyboard-only progression, focus movement, reduced motion, and text
    alternatives for map content.
11. Test light/dark mode, local theme restoration, visual contrast, and
    skeuomorphic pressed/disabled/focus states.
12. Check the mobile layout: rail precedes one active stage and no essential
    action is hidden by the map or sticky desktop behavior.

The automated suite validates contracts and fallbacks. Manual checks validate
browser camera behavior, Google Maps rendering, provider credentials, tactile visual
clarity, and responsive layout.

---

# Definition of Done

A CityMind MVP change is complete only when:

- The code follows the documented layered architecture and staged workflow.
- Inputs and provider output are validated and typed.
- Loading, success, error, and retry states are present for every async stage.
- A user cannot skip image confirmation, scene context, or required guidance
  input.
- The active stage has a clear primary action and completed stages remain
  recoverable.
- Skeuomorphic elements retain contrast, focus, semantic labels, and keyboard
  behavior.
- AI and fallback guidance clearly distinguish certainty from assumptions.
- A textual destination is never silently replaced with a default destination.
- Map-rendering failure does not hide route information.
- Accessibility is not claimed without evidence.
- Relevant documentation, tests, and CI are updated.
- Quality commands and an appropriate manual smoke test pass.

---

# Known Product Boundaries

These are deliberate MVP boundaries, not hidden defects:

- No user accounts, persistence, or saved history.
- No live transit, crowd, weather, or verified accessibility-data integration.
- No guarantee that a walking route is step-free.
- No place-search result is treated as a confirmed operational service without
  verification.
- No offline routing or maps.

Future expansion may add trusted accessibility data, transit feeds, and
persistent preferences only if it preserves the core vision-to-recommendation
experience and the clarity of the staged workflow.
