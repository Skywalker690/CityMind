# Component Architecture

**Project:** CityMind

**Version:** 1.0

**Status:** UI Architecture Specification

---

# Purpose

This document defines the component architecture for CityMind.

Every UI element in the application should be modular, reusable, composable, and maintain a single responsibility.

This document serves as the canonical reference for UI architecture, component hierarchy, ownership, composition rules, and implementation standards.

---

# Design Philosophy

The UI architecture follows these principles:

* Component-first
* Reusable
* Stateless where possible
* Accessible
* Composable
* Maintainable
* AI-friendly

Every component should solve one problem only.

---

# Component Hierarchy

```text
app/page.tsx
└── CityMindApp
    ├── Header
    │   ├── workflow status
    │   ├── location request
    │   └── light/dark theme toggle
    ├── Inline onboarding (only before a scene is selected)
    ├── PersonaSelector
    ├── CameraCard
    │   ├── camera / upload / demo-scene selection
    │   ├── image preview and explicit confirmation
    │   └── AnalysisSteps
    ├── Destination query form
    ├── ErrorState / VisionSummary / RecommendationPanel
    │   ├── RecommendationCard
    │   └── nearby-place follow-up actions
    ├── InteractiveMap
    │   ├── dynamically loaded Mapbox GL map
    │   ├── route GeoJSON, markers, controls, and status
    │   └── text and local visual fallback
    └── ChatPanel

app/error.tsx and app/loading.tsx provide framework-level recovery states.
```

---

# Component Categories

## Layout Components

Responsible for page structure.

Examples

* `CityMindApp`
* Header and onboarding sections within `CityMindApp`
* Three-column responsive workflow layout

It owns composition, focus movement, local theme state, and forwarding actions
to `useCityMind`; provider calls remain outside the layout.

---

## Feature Components

Contain one complete feature.

Examples

* CameraCard
* PersonaSelector
* RecommendationPanel
* InteractiveMap
* ChatPanel

These may compose multiple presentation components.

---

## Presentation Components

Display information only.

Examples

* Badge
* Card
* Icon
* Label
* Divider
* Avatar

Must be reusable.

---

## AI Components

Display AI-specific states.

Examples

* RecommendationCard
* VisionSummary
* AnalysisSteps
* ErrorState

These components never call AI directly.

---

## Map Components

`InteractiveMap` is the one map feature component. It dynamically imports
Mapbox GL JS after hydration, renders normalized GeoJSON supplied in
`RouteSummary`, marks origin and destination, exposes navigation/recenter
controls, and preserves text directions when the map cannot initialize. It
never geocodes or requests directions in the browser.

---

## Chat Components

`ChatPanel` contains the active-session transcript, suggested prompts, a
multiline input, and loading/disabled states. It forwards messages to the
workflow hook rather than calling OpenAI directly.

---

## Camera Components

`CameraCard` owns the browser camera stream through `useCamera`, upload and
demo-scene selection, preview, explicit “Confirm and analyze” action, retake,
and analysis progress. Selecting a photo never starts AI analysis until the
user confirms it.

---

# Shared Components

Reusable primitives live in `components/ui/`; workflow feedback helpers live in
`components/common/`.

Implemented examples

* `Button`, `Card`, `Badge`, `Input`, `Progress`, and `Textarea`
* `AnalysisSteps`
* `EmptyState`
* `ErrorState`

---

# UI Ownership Rules

## Pages

Responsible for:

* Layout
* Routing
* Feature composition

Must NOT contain business logic.

---

## Feature Components

Responsible for:

* Feature UI
* User interaction and accessible status feedback
* Event forwarding

Must NOT call CityMind providers directly. `InteractiveMap` may initialize the
Mapbox GL browser renderer with its public token, but destination resolution and
directions remain server-side.

---

## Services

Responsible for:

* AI communication
* Maps
* Business logic

No JSX.

No React.

---

# Component Communication

Preferred communication:

```text
CityMindApp
      |
      v
Feature component
      |
      v
useCityMind / local hook
      |
      v
/api route handler
      |
      v
service and provider
```

Avoid sibling-to-sibling communication.

---

# Component State

## Local State

Use for:

* Destination query and theme mode in `CityMindApp`
* Camera stream and Mapbox GL lifecycle
* Input fields, action notices, and temporary UI

---

## Workflow State

`useCityMind` is the single local workflow coordinator. It owns persona,
image preview/file, scene, recommendation, conversation, retries, and location
for the active browser session. It uses the explicit statuses `idle`,
`image-ready`, `analyzing`, `scene-ready`, `reasoning`, `ready`, `chatting`,
and `error`; no global state library or persistence is required.

---

# Component Lifecycle

Onboarding

↓

Image selected

↓

User confirms photo

↓

Vision analysis

↓

Scene-ready question or destination query

↓

Reasoning and typed route resolution

↓

Recommendation and map update

↓

Contextual follow-up conversation

Each stage should have dedicated UI states.

---

# Loading States

Every async component should support:

* Loading
* Success
* Error
* Empty

No blank screens.

`app/loading.tsx` covers initial route loading. `InteractiveMap` separately
announces map loading and falls back to a text-readable visual when Mapbox is
unavailable.

---

# Error Components

Standardized error cards should exist for:

* AI unavailable
* Camera unavailable
* Map unavailable
* Upload failed
* Invalid image
* Network failure

`app/error.tsx` catches unexpected route-segment rendering failures and offers
both retry and return-home actions. Workflow retries preserve the appropriate
last completed context: a selected image, scene/question/persona, or chat
turn, rather than restarting the entire flow.

---

# Animation Rules

Use Framer Motion for:

* Inline onboarding reveal
* Guidance-card entry
* State transitions that orient the user

Avoid decorative animations.

Animations should communicate state changes and respect the reduced-motion
preference exposed by the browser.

---

# Accessibility

Every component should support:

* Keyboard navigation
* Focus visibility
* Screen readers
* Semantic HTML
* Proper ARIA labels

---

# Reusability Rules

Before creating a new component ask:

* Does one already exist?
* Can the existing component be extended?
* Is this solving a unique problem?
* Can another feature reuse it?

Duplicate UI should never exist.

---

# Component Naming

Examples

```text
CameraCard.tsx

RecommendationCard.tsx

VisionSummary.tsx

PersonaSelector.tsx

InteractiveMap.tsx

ChatPanel.tsx
```

Always use PascalCase.

---

# Component Checklist

Before a component is complete:

* Single responsibility
* Reusable
* Typed
* Accessible
* Responsive
* Documented
* Tested manually
* No duplicated logic

---

# Future Components

Potential additions

* Voice Assistant
* Live Transit Widget
* Crowd Heatmap
* Weather Card
* Digital Twin View
* Timeline View
* AI Memory Panel

These are intentionally excluded from the MVP.

---

# Guiding Principle

Every component should be understandable in isolation.

A developer should be able to open any component and immediately understand:

* Its responsibility
* Its inputs
* Its outputs
* Its dependencies

without reading the rest of the application.

The component architecture should remain clean, predictable, and optimized for both human developers and AI-assisted development.
