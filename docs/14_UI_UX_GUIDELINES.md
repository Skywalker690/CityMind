# UI/UX Guidelines

**Project:** CityMind

**Version:** 1.1

**Status:** Implemented MVP Experience Contract

---

# Purpose

This document describes the CityMind MVP as users experience it. It is the
frontend contract for the vision-first workflow, including its onboarding,
photo confirmation, route honesty, map fallback, recovery, and accessibility
behavior.

---

# Experience Principles

CityMind should feel:

* Calm, premium, and purposeful.
* Vision-first rather than form-first.
* Clear about what is known, estimated, and unverified.
* Personal without requiring an account.
* Fast to understand and forgiving when a provider is unavailable.

Every screen has one primary next action. The app never asks users to interpret
raw AI output or a provider error.

---

# Navigation Model

CityMind is a single responsive workspace, not a multi-page onboarding funnel.

~~~text
Open CityMind
      |
      v
Inline onboarding and photo capture
      |
      v
Review and confirm the selected photo
      |
      v
Scene understanding
      |
      v
Ask a question and optionally add a destination
      |
      v
Recommendation, route context, map, and follow-up chat
~~~

The inline onboarding appears only before an image or scene exists. Its primary
action scrolls and focuses the capture workflow. There is no separate landing,
settings, or account screen in the MVP.

---

# Application Shell

## Header

The header contains:

* CityMind identity and concise product explanation.
* Workflow-status badge.
* Optional location request with clear granted/loading/denied states.
* A keyboard-accessible light/dark theme toggle.

The header must not hide the primary action behind navigation. The theme applies
immediately for the current page session and is not a persisted account
preference.

## Main Layout

Desktop uses a three-column workspace:

~~~text
Persona + camera | guidance and destination | map + conversation
~~~

On smaller viewports, panels stack in workflow order. The mobile sequence is:

~~~text
Onboarding -> persona -> camera -> destination -> guidance -> map -> chat
~~~

Sticky side panels are a desktop enhancement only; no important information is
hidden when they unstick on tablet or mobile.

---

# Hero Flow

## 1. Choose Context

Persona chips expose Tourist, Daily Commuter, Elderly, Wheelchair User, and
Luggage Traveler. The selected state is visible and announced with native
button semantics. Persona controls are disabled while CityMind is processing.

If a scene and prior question already exist, changing persona reruns the same
reasoning context. It does not require another photo upload.

## 2. Capture or Upload a Scene

The camera card supports:

* Opening and stopping the browser camera.
* Capturing a camera frame.
* Uploading an image.
* Loading a repeatable local demo scene.
* Retaking, replacing, or discarding a photo.

The UI must explain camera permission failure and keep upload available as an
alternative.

## 3. Review Before Analysis

After selection, CityMind shows the image preview and an explicit Confirm and
analyze action. AI analysis does not begin on image selection alone. The
preview guidance asks users to check that the relevant entrance, signs, or path
are visible.

Retake and choose-another actions remain available until analysis starts. While
analysis is active, the preview receives a non-technical progress overlay and
the analysis steps communicate what CityMind is doing.

## 4. Understand the Scene

When vision completes, the scene summary appears alongside a clear
scene-understood status. Suggested prompts change from generic ideas to
contextual follow-ups. Low confidence and fallback observations are shown as
warnings, not hidden behind confidence percentages alone.

## 5. Ask and Plan

The user can ask a natural-language question in the chat panel or select a
suggested prompt. The optional destination field supports a place name such as
Fort Kochi ferry. Its Plan route action is disabled until a scene exists and is
not busy.

A destination is passed as a typed destinationQuery. If no destination can be
confidently resolved, CityMind explains whether it is missing, unavailable, or
not found instead of drawing a route to a default place.

## 6. Receive and Act

Recommendation cards present:

* Recommendation title and action.
* Explanation and benefits.
* Effort and confidence.
* Suggested action.
* Warnings and verification needs.

Recommendation actions move keyboard focus to the route/map area for navigation,
accessibility, and transport advice, or to the conversation area for a
follow-up. Nearby places use an Ask CityMind action instead of pretending to be
live place data.

## 7. Inspect Route Context

The map panel receives a normalized walking route after destination resolution.

When Mapbox GL is available it displays:

* Current location and resolved destination markers.
* Route GeoJSON.
* Distance, duration, travel mode, and turn summary.
* Navigation and recenter controls.
* Route source/status and an accessibility-verification notice.

A live route is visually distinct from an estimated fallback route. A walking
route is never presented as step-free or accessible solely because the selected
persona has accessibility needs.

When Mapbox is unavailable, unauthorized, or unsupported, CityMind preserves
the route summary and instructions in a text-readable local map fallback. This
is a degraded visualization state, not a failed recommendation flow.

## 8. Continue the Conversation

Chat retains the active browser-session context only. It supports a multiline
input, suggested prompts, disabled state before scene readiness, and a visible
sending state. CityMind currently returns complete replies rather than
token-streamed output.

---

# State Feedback

| Workflow state | User-facing feedback | Primary recovery or next action |
| --- | --- | --- |
| idle | Capture or upload prompt and onboarding | Select a photo. |
| image-ready | Preview and confirm prompt | Confirm, retake, or choose another. |
| analyzing | Analysis steps and image overlay | Wait; retry the selected photo after failure. |
| scene-ready | Scene summary and contextual prompts | Ask a question or add a destination. |
| reasoning | Reasoning status and disabled duplicate actions | Wait; retry the same scene/question/persona after failure. |
| ready | Recommendation, warnings, map, and chat | Act on guidance or ask a follow-up. |
| chatting | Visible send state | Wait; retry the same follow-up after failure. |
| error | Calm ErrorState with specific retry label | Retry the last incomplete operation. |

Initial route loading is covered by a page-level skeleton. An unexpected
route-segment render failure is caught by the error boundary and provides retry
and return-home actions.

---

# Error and Fallback Experience

Users must always know what happened and what they can do next.

* Camera failure: explain the permission or device issue; offer upload.
* Invalid or oversized image: explain the image requirement without technical
  provider details.
* OpenAI failure: use typed deterministic fallback data and show uncertainty.
* Destination search failure: ask for a more specific place; do not fabricate a
  destination.
* Live directions failure: show an explicitly estimated guide only after live
  providers cannot route.
* Map rendering failure: retain textual directions and local route visual.
* Chat failure: preserve the user's last message and offer a no-duplicate retry.

Retry behavior is operation-specific. It must not re-run vision after a chat
error or silently discard a resolved scene when reasoning fails.

---

# Accessibility

CityMind supports:

* Semantic headings, forms, buttons, lists, and labels.
* Keyboard navigation with visible focus rings.
* Skip link to the capture workflow.
* Live status messaging for workflow, map, and action notices.
* Screen-reader labels for camera, map, route controls, and theme control.
* WCAG-aware semantic color tokens.
* Reduced-motion behavior for animations and scroll/focus movement.
* Text route metrics and instructions as an alternative to the interactive map.

Accessibility statements in AI guidance remain cautious. CityMind asks users to
verify elevators, ramps, curb cuts, surfaces, and closures when route data does
not contain trusted evidence.

---

# Responsive and Visual Rules

* Keep the recommendation visually ahead of secondary detail.
* Preserve all capture, confirmation, destination, and retry actions on narrow
  screens.
* Use large touch targets and avoid hover-only behavior.
* Do not trap critical content below an oversized map.
* Use light and dark semantic tokens consistently; map-provider UI can be a
  visual exception but must not reduce surrounding contrast.
* Motion communicates workflow state and respects reduced-motion preferences.

---

# MVP Success Checklist

The experience is successful when a new user can:

1. Understand CityMind within 30 seconds.
2. Capture or upload an urban scene and explicitly approve analysis.
3. Select a persona and receive a contextual, explained recommendation.
4. Add a destination and understand whether a route is live, estimated, or not
   available.
5. Continue after an AI, map, or chat issue without losing completed work.
6. Use the core workflow with keyboard, screen reader, reduced motion, or
   fallback map support.
