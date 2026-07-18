# UI/UX Guidelines

**Project:** CityMind

**Version:** 1.2

**Status:** Implemented Staged Experience Contract

---

# Purpose

This document describes the CityMind MVP as users experience it. It is the
frontend contract for the staged vision-first workflow, its tactile visual
language, photo confirmation, route honesty, map fallback, recovery, and
accessibility behavior.

---

# Experience Principles

CityMind should feel:

- Calm, premium, and purposeful.
- Vision-first rather than form-first.
- Clear about what is known, estimated, and unverified.
- Personal without requiring an account.
- Focused: one required decision at a time.
- Tactile, but never dependent on visual depth alone.

Every visible stage has one primary next action. The app never asks users to
interpret raw AI output, a provider error, or a dense dashboard with unrelated
actions competing for attention.

---

# Navigation Model

CityMind uses one responsive application route with a controlled four-stage
workspace. It is not a separate onboarding funnel and it is not a single page
where all feature panels remain visible simultaneously.

```text
Capture -> Confirm -> Ask -> Act
```

| Stage   | Primary user action | Main content                                        | Unlock condition      |
| ------- | ------------------- | --------------------------------------------------- | --------------------- |
| Capture | Select a scene.     | Camera, upload, or demo input; image review.        | Image selected.       |
| Confirm | Approve analysis.   | Photo review, persona, optional location, progress. | Scene understood.     |
| Ask     | Request guidance.   | Scene summary, question, optional destination.      | Recommendation ready. |
| Act     | Inspect and refine. | Recommendation, route context, map, follow-up chat. | Result exists.        |

The step rail is always visible in the application shell. The active step is
announced as the current step. Future steps remain disabled until their required
context exists; current and completed steps remain available so a user can
correct a photo or context choice. Successful provider work automatically moves
the user to the next meaningful stage.

Returning to an earlier stage does not discard progress unless the user makes a
change that logically invalidates it, such as replacing the image. The rail must
not allow a user to skip the required confirmation or ask for guidance without a
scene.

---

# Application Shell

## Header

The header contains:

- CityMind identity and concise product explanation.
- Workflow-status badge.
- Location-status indicator.
- Keyboard-accessible light/dark theme toggle.

Location is requested in Confirm, not from a competing header action. The first
visit follows the operating-system theme when available; a manual choice is
stored locally in the browser and restored on subsequent visits.

## Main Layout

Desktop layout:

```text
Step rail | One active stage workspace
```

The step rail can remain sticky as a desktop enhancement. The active workspace
is the visual focus and contains one stage at a time. On tablet and mobile, the
rail stacks above the workspace; it may use a compact grid but preserves the
same labels, ordering, and unavailable states.

No critical action may be hidden because a desktop rail is sticky, and no
important content may be placed below an oversized map.

---

# Stage Specifications

## 1. Capture

Capture is the entry point. It supports:

- Opening and stopping the browser camera.
- Capturing a camera frame.
- Uploading an existing image.
- Loading a repeatable local demo scene.
- Replacing or discarding a selected photo.

Before selection, the camera/upload surface explains that CityMind needs a view
of the relevant entrance, path, sign, or street decision. After selection, an
inset image review surface and a prominent **Continue to confirm** action make
the next step clear. The user can replace the photo at this point.

Image selection alone never sends content to AI.

## 2. Confirm

Confirm is the informed decision to analyze the selected scene. It includes:

- The selected image and guidance to check that the relevant context is visible.
- Persona choices: Tourist, Daily Commuter, Elderly Companion, Wheelchair User,
  and Luggage Traveler.
- Optional device-location request and a clear granted, loading, denied, or
  unavailable state.
- A clearly dominant **Analyze this scene** action.
- Return to Capture to change the image before analysis begins.

Analysis overlays non-technical progress on the preview and exposes analysis
steps. While it is active, duplicate and conflicting controls are disabled.
Successful analysis automatically opens Ask.

Changing a persona after a previous question exists reruns that saved question
with the new mobility context. This gives users a direct comparison without
requiring a second photo, while retaining route and accessibility uncertainty.

## 3. Ask

Ask turns scene understanding into a request for help. It displays:

- A concise scene summary.
- A multiline natural-language question field.
- An optional destination field for route-aware guidance.
- Suggested prompt controls.
- One primary **Get guidance** action.

The form accepts a question, a destination, or both. When only a destination is
provided, CityMind constructs a route-oriented request. A text destination is
passed as a typed `destinationQuery`; it is never silently replaced by a default
place. Inputs are disabled while reasoning is in progress.

Successful reasoning automatically opens Act.

## 4. Act

Act presents the decision before the supporting detail:

1. Structured recommendation, explanation, benefits, confidence, warnings,
   and verification needs.
2. Route context with live/estimated/unavailable state and interactive map when
   possible.
3. Follow-up chat for refinement.

Recommendation actions move keyboard focus to the route context. Nearby places
use an **Ask CityMind** style follow-up, not an unqualified claim that a live
place listing exists. Chat remains unavailable until a recommendation exists.

---

# Tactile Visual Rules

The design uses restrained skeuomorphic elements inspired by softly molded
mobile controls:

- Raised workflow rail, stage workspace, panels, and primary controls.
- Inset wells for photo review, status, and supporting input areas.
- Small, fast pressed-state feedback for enabled controls.
- Generous rounding, cool blue-slate surfaces, and paired soft shadows.
- Clear primary blue, emerald success, amber verification, and red error
  semantics.

These effects are intentionally quiet. Avoid excessive layers, dark inset
shadows that reduce contrast, glossy decoration, fake materials, or ornamental
icons. A tactile surface must still look and behave like a semantic button,
form field, status, or content region.

Use text, icon, position, and semantics alongside color and depth for selected,
complete, disabled, busy, and error states. Focus rings must remain more visible
than any shadow treatment.

---

# Route and Map Experience

The Act-stage map receives a normalized walking route only after a destination
is resolved. When Google Maps JavaScript API is available it displays:

- Current-location and resolved-destination markers.
- Route polyline.
- Distance, duration, walking mode, and turn summary.
- Zoom, map-type, fullscreen, Street View, and recenter controls.
- Advanced Markers and custom map styling when an optional map ID is configured.
- Route source/status and an accessibility-verification notice.

A live route is visually distinct from an explicitly estimated fallback route.
Neither a walking route nor a persona preference may be presented as proof of a
step-free or accessible path.

When Google Maps is unavailable, unauthorized, or unsupported, Act retains route
metrics and instructions in a text-readable local visual fallback. This is a
degraded visualization state, not a failed recommendation flow.

---

# State Feedback

| Workflow state | Active or likely stage | User-facing feedback                                         | Recovery or next action                                |
| -------------- | ---------------------- | ------------------------------------------------------------ | ------------------------------------------------------ |
| idle           | Capture                | Camera/upload/demo prompt.                                   | Select a photo.                                        |
| image-ready    | Confirm                | Preview and context-confirmation prompt.                     | Analyze, replace, or return to Capture.                |
| analyzing      | Confirm                | Analysis steps and preview overlay.                          | Wait; retry selected photo after failure.              |
| scene-ready    | Ask                    | Scene summary and contextual prompts.                        | Ask a question or add a destination.                   |
| reasoning      | Ask                    | Guidance preparation status and disabled duplicate controls. | Wait; retry same scene/question/persona after failure. |
| ready          | Act                    | Recommendation, warnings, route context, and chat.           | Inspect, act, or refine.                               |
| chatting       | Act                    | Visible send state.                                          | Wait; retry same follow-up after failure.              |
| error          | Relevant prior stage   | Calm ErrorState with operation-specific retry label.         | Retry the incomplete operation.                        |

Initial route loading is covered by a page-level skeleton. An unexpected route
segment render failure is caught by the error boundary and provides retry and
return-home actions.

---

# Error and Fallback Experience

Users must always know what happened and what they can do next.

- Camera failure: explain the device or permission issue; offer upload.
- Invalid or oversized image: explain the image requirement without technical
  provider details.
- OpenAI failure: use typed deterministic fallback data and show uncertainty.
- Destination search failure: say whether it is missing, unavailable, or not
  found; ask for a more specific place and do not fabricate a destination.
- Live-directions failure: show an explicitly estimated guide only after live
  providers cannot route.
- Map-rendering failure: retain textual directions and the local route visual.
- Chat failure: preserve the user's last message and offer a no-duplicate retry.

Retry is operation-specific. It must not re-run vision after a chat error,
silently discard a scene when reasoning fails, or trap the user in a stage that
cannot be completed.

---

# Accessibility

CityMind supports:

- Semantic headings, forms, buttons, lists, and labels.
- Keyboard navigation with visible focus rings.
- A skip link to the active workflow stage.
- Live status messaging for workflow, map, and action notices.
- Screen-reader labels for camera, map, route controls, and theme control.
- WCAG-aware semantic color tokens.
- Reduced-motion behavior for animations and scroll/focus movement.
- Text route metrics and instructions as an alternative to the interactive map.
- Disabled future stages that remain understandable without being focus traps.

Accessibility claims in AI guidance remain cautious. CityMind asks users to
verify elevators, ramps, curb cuts, surfaces, and closures when route data does
not contain trusted evidence.

---

# Responsive and Success Rules

- Keep one primary stage action visible on narrow screens.
- Preserve capture, confirmation, destination, retry, and back actions on all
  viewports.
- Use large touch targets; do not create hover-only workflow behavior.
- Keep the recommendation ahead of secondary route detail.
- Do not trap essential content below the map or behind the rail.
- Respect light/dark semantic tokens, reduced motion, and screen-reader flow.

The experience is successful when a new user can:

1. Understand Capture -> Confirm -> Ask -> Act within 30 seconds.
2. Capture or upload an urban scene and explicitly approve analysis.
3. Select a persona and receive a contextual, explained recommendation.
4. Add a destination and understand whether a route is live, estimated, or not
   available.
5. Continue after an AI, map, or chat issue without losing completed work.
6. Use the workflow with keyboard, screen reader, reduced motion, or fallback
   map support.
