# Component Architecture

**Project:** CityMind

**Version:** 1.2

**Status:** Staged UI Architecture Specification

---

# Purpose

This document defines the component architecture for CityMind. UI components
must be modular, reusable, composable, accessible, and limited to one clear
responsibility.

The interface is a staged workflow. It is not a three-column dashboard that
renders camera controls, a destination form, recommendation cards, map, and
chat at the same time. The component architecture enforces the sequence:

```text
Capture -> Confirm -> Ask -> Act
```

---

# Architecture Principles

- Component-first and composable.
- Stateless where practical.
- Progressive disclosure over simultaneous controls.
- Accessible semantic structure and keyboard behavior.
- Clear local UI ownership; providers stay behind the workflow hook and APIs.
- Skeuomorphic treatment is presentation, never business logic or state.

---

# Application Shell

```text
app/page.tsx
`-- CityMindApp
    |-- Header
    |   |-- CityMind identity
    |   |-- WorkflowStatusBadge
    |   |-- location-status indicator
    |   `-- theme toggle
    |-- WorkflowStepper (step rail)
    |   |-- Capture
    |   |-- Confirm
    |   |-- Ask
    |   `-- Act
    `-- Active workflow stage
        |-- CaptureStep
        |   |-- StepHeading
        |   `-- CameraCard
        |       |-- browser camera / upload / demo selection
        |       `-- selected image preview and replacement controls
        |-- ConfirmStep
        |   |-- selected image review
        |   |-- PersonaSelector
        |   |-- optional location request
        |   |-- AnalysisSteps
        |   `-- explicit Analyze this scene action
        |-- QuestionStep (Ask stage; internal step id: plan)
        |   |-- VisionSummary
        |   |-- question and destination form
        |   `-- suggested-prompt controls
        `-- ActStep
            |-- RecommendationPanel
            |   |-- RecommendationCard
            |   `-- nearby-place follow-up actions
            |-- InteractiveMap
            |   |-- dynamically loaded Google Maps JavaScript map
            |   `-- textual/local visual fallback
            `-- ChatPanel

app/error.tsx and app/loading.tsx provide route-level recovery and loading
states.
```

On desktop, `CityMindApp` lays out a persistent step rail beside one active
workspace. On small screens, the rail and the active workspace stack. No stage
may depend on a sticky desktop panel for access to required controls.

---

# Stage Components

## WorkflowStepper

`WorkflowStepper` is navigation and orientation, not a form submit mechanism.
It renders the four stage labels, numbers, descriptions, selected state,
complete state, and unavailable state.

Inputs:

- `activeStep`: the visible stage.
- `availableStepIndex`: highest stage whose prerequisite exists.
- `onStepChange`: requested navigation to a current or completed stage.

Rules:

- Later stages are disabled, not hidden, so progression is understandable.
- The active stage exposes `aria-current="step"`.
- Completion has text, position, and icon treatment; it must not rely on color
  alone.
- A user can revisit a completed step, but cannot skip required context.

## CaptureStep

`CaptureStep` is responsible only for selecting the scene image. It composes
`CameraCard` and, after selection, a review preview with Continue to confirm,
replace, and clear actions.

Selecting an image never starts provider work. It unlocks Confirm only.

## ConfirmStep

`ConfirmStep` gathers the context CityMind should consider before analysis:

- Selected-image review.
- Persona selection.
- Optional device-location request and status feedback.
- Explicit **Analyze this scene** action.
- Analysis progress and a return-to-Capture action.

It is the only stage that invokes `confirmImage` through its event handler.
Analysis begins only after a user decision; the preview remains visible during
analysis so the operation is understandable.

## QuestionStep

`QuestionStep` is the Ask stage. It displays `VisionSummary`, a natural
language question field, an optional typed destination field, and suggested
prompts. Its internal workflow identifier is `plan` to preserve the hook's
state contract; user-facing language is always **Ask**.

The form requires either a question or a destination. It forwards the resolved
question and optional destination query to the workflow hook. It does not
geocode, route, or call AI itself.

## ActStep

`ActStep` is shown only after reasoning returns a result. It composes:

- `RecommendationPanel` for structured guidance and verification needs.
- `InteractiveMap` for normalized route context and its text fallback.
- `ChatPanel` for contextual follow-up.

Recommendation actions move focus to route context. Nearby-place actions send a
contextual follow-up rather than claiming live place data. The map and chat are
therefore secondary to the recommendation but still reachable without leaving
the active step.

---

# Component Categories

## Layout Components

`CityMindApp` owns page composition, active-step presentation, local theme
preference, destination field state, action notices, and focus-safe stage
transitions. It does not contain AI, routing, or geocoding business logic.

## Feature Components

Feature components include `CameraCard`, `PersonaSelector`, `VisionSummary`,
`RecommendationPanel`, `InteractiveMap`, and `ChatPanel`. They manage feature
UI and event forwarding only. They must not call CityMind providers directly.

## Presentation Components

Reusable primitives in `components/ui/` include `Button`, `Card`, `Badge`,
`Input`, `Progress`, and `Textarea`. Shared feedback helpers in
`components/common/` include `AnalysisSteps`, `EmptyState`, and `ErrorState`.

Presentation primitives own tactile visual variants and focus/disabled states,
not workflow rules.

## AI Components

`VisionSummary`, `AnalysisSteps`, `RecommendationCard`, and `ErrorState`
present typed AI-specific state. They never parse raw provider responses or
invoke AI.

## Map Components

`InteractiveMap` is the one map feature component. It loads the Google Maps
JavaScript API after hydration, renders normalized route geometry supplied in
`RouteSummary`, marks origin and destination, auto-fits the route, and exposes
zoom, map-type, fullscreen, Street View, and recenter controls. It uses Advanced
Markers when an optional map ID is configured and a compatible marker fallback
otherwise. It preserves text directions when the map cannot initialize and
never resolves destinations or requests directions in the browser.

## Camera Components

`CameraCard` owns the browser camera stream through `useCamera`, upload and
demo-scene selection, and selection errors. Capture-stage orchestration owns
the review transition. Confirm-stage orchestration owns consent to analyze.

---

# State and Controlled Progression

`useCityMind` is the single local workflow coordinator. It owns persona, image
preview/file, scene, recommendation, conversation, retries, device location,
and the active provider-operation status for the current browser session.

The workflow statuses are:

```text
idle | image-ready | analyzing | scene-ready | reasoning | ready | chatting | error
```

`CityMindApp` derives stage availability rather than storing a second source of
truth:

| Available through | Condition                  |
| ----------------- | -------------------------- |
| Capture           | Always.                    |
| Confirm           | An image preview exists.   |
| Ask               | A scene exists.            |
| Act               | A reasoning result exists. |

Status transitions automatically set the appropriate active step: selected
images move to Confirm, a completed scene moves to Ask, and a completed result
moves to Act. Returning to an earlier available stage changes presentation only
unless the user explicitly replaces the image, changes a persona, or submits a
new question.

No global state library or persistent account state is required for the MVP.
The local theme preference is a browser preference, not user-profile data.

---

# Communication and Ownership

```text
CityMindApp
      |
      v
Active stage component
      |
      v
useCityMind / focused browser hook
      |
      v
/api route handler
      |
      v
service and provider
```

Avoid sibling-to-sibling business communication. `CityMindApp` forwards typed
events down and consumes typed hook state up. Services contain AI, destination,
and route behavior; neither React components nor presentation primitives
duplicate that logic.

---

# Lifecycle and Feedback

```text
Capture image
      -> Confirm image/persona/location
      -> Explicit vision analysis
      -> Ask with scene context
      -> Reasoning and destination resolution
      -> Act on recommendation, route, and follow-up
```

Every asynchronous operation must have loading, success, error, and recovery
states. `app/loading.tsx` covers initial route loading. The active stage shows
its own operation status: analysis in Confirm, reasoning in Ask, map loading in
Act, and sending state in Act chat.

`ErrorState` receives operation-specific retry copy. Retry preserves the
right prior context rather than restarting the whole app. `app/error.tsx`
catches unexpected route-segment render failures and provides retry and
return-home actions.

---

# Motion

Framer Motion is used only for active-stage transitions and orientation
feedback. The outgoing and incoming stage should not compete for attention.
When a user requests reduced motion, the stage changes without positional
animation and focus movement avoids animated scrolling.

---

# Accessibility

Every component must support:

- Keyboard navigation and a visible focus indicator.
- Semantic headings, forms, buttons, lists, and labels.
- Screen-reader labels and live status messaging where state changes.
- A skip link that lands on the active workflow stage.
- Disabled future-stage controls with an understandable progression model.
- Text route information when an interactive map is unavailable.
- Touch targets and labels that do not depend on a shadow, icon, or color alone.

The stage workspace is focusable so the skip link and controlled stage changes
have an explicit destination. Recommendation actions move focus to the map
context. This behavior must respect reduced-motion preferences.

---

# Reuse and Completion Checklist

Before creating a component, ask:

- Does an existing component already solve the presentation need?
- Can it be extended without mixing responsibilities?
- Is the new component a true stage, feature, or reusable primitive?

A component is complete only when it is typed, reusable, accessible,
responsive, documented, manually tested, and free of duplicated business logic.

Future concepts such as voice assistance, live transit, a crowd heatmap,
weather, timeline, or AI memory remain outside the MVP until they can fit the
same staged and layered architecture.
