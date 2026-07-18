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
App

├── Layout

│

├── Home Page

│ ├── Hero

│ ├── Persona Selector

│ ├── Camera Card

│ ├── Upload Button

│ └── AI Prompt Suggestions

│

├── Camera Module

│ ├── Camera Preview

│ ├── Image Capture

│ ├── Image Upload

│ ├── Image Preview

│ └── Analysis Status

│

├── Chat Module

│ ├── Conversation

│ ├── Message Bubble

│ ├── Typing Indicator

│ ├── Prompt Input

│ └── Suggested Questions

│

├── Recommendation Module

│ ├── Recommendation Card

│ ├── Reason Card

│ ├── Confidence Badge

│ ├── Warning Card

│ └── Nearby Places

│

├── Map Module

│ ├── Map View

│ ├── Route Overlay

│ ├── Marker

│ ├── Route Legend

│ └── Bottom Sheet

│

└── Shared UI
```

---

# Component Categories

## Layout Components

Responsible for page structure.

Examples

* AppLayout
* MainContainer
* Sidebar
* Header
* Footer

No business logic.

---

## Feature Components

Contain one complete feature.

Examples

* CameraCard
* PersonaSelector
* RecommendationPanel
* MapPanel
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

* AIThinking
* ReasoningTimeline
* RecommendationCard
* ConfidenceIndicator
* VisionSummary

These components never call AI directly.

---

## Map Components

Examples

* MapContainer
* RouteOverlay
* Marker
* DestinationCard
* CurrentLocation

---

## Chat Components

Examples

* ChatContainer
* ChatMessage
* UserMessage
* AIMessage
* PromptInput
* SuggestedPrompt

---

## Camera Components

Examples

* CameraPreview
* CaptureButton
* UploadButton
* ImagePreview
* AnalysisProgress

---

# Shared Components

Located inside

```text
components/common/
```

Examples

* Button
* Card
* Badge
* Loader
* Modal
* EmptyState
* ErrorState
* Skeleton
* Tooltip

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
* User interaction
* Event forwarding

Must NOT call external APIs directly.

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
Page

↓

Feature Component

↓

Hook

↓

Service

↓

API
```

Avoid sibling-to-sibling communication.

---

# Component State

## Local State

Use for:

* Modal visibility
* Input fields
* Temporary UI

---

## Shared State

Use for:

* Persona
* Conversation
* Uploaded image
* AI response

Shared state should be minimal.

---

# Component Lifecycle

Camera

↓

Image Selected

↓

Vision Analysis

↓

Reasoning

↓

Recommendation

↓

Map Update

↓

Conversation

Each stage should have dedicated UI states.

---

# Loading States

Every async component should support:

* Loading
* Success
* Error
* Empty

No blank screens.

---

# Error Components

Standardized error cards should exist for:

* AI unavailable
* Camera unavailable
* Map unavailable
* Upload failed
* Invalid image
* Network failure

---

# Animation Rules

Use Framer Motion for:

* Page transitions
* Recommendation appearance
* Loading indicators
* Chat messages
* Cards
* Bottom sheets

Avoid decorative animations.

Animations should communicate state changes.

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

ReasoningPanel.tsx

PersonaSelector.tsx

InteractiveMap.tsx

PromptSuggestions.tsx
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
