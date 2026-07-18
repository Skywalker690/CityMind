# User Journeys

**Project:** CityMind

**Version:** 1.1

**Status:** Staged User Experience Specification

---

# Purpose

This document defines the end-to-end journeys supported by the CityMind MVP.
It describes how a person moves from an urban scene to an explained next action
without being asked to understand every input, result, route, and conversation
control at once.

Every screen, API, AI prompt, and UI component must support one or more of
these journeys. The product is one responsive route, but it is a controlled
workflow rather than a simultaneous multi-panel dashboard.

---

# Journey Principles

Every journey should feel:

* Fast
* Natural
* Intelligent
* Conversational
* Explainable
* Deliberate rather than crowded

The user should feel as though they are working with an intelligent urban
assistant, not operating a collection of AI tools.

Each visible stage has one clear primary action. Soft, tactile visual treatment
can make surfaces feel approachable, but it must never be the only indicator of
progress, availability, selection, or error.

---

# Staged Workflow Model

CityMind organizes the hero experience into four stages:

```text
Capture -> Confirm -> Ask -> Act
```

| Stage | User decision | Required context | Result / next unlock |
| --- | --- | --- | --- |
| Capture | Select the relevant urban scene. | Camera frame, uploaded image, or demo image. | A selected image unlocks Confirm. |
| Confirm | Check the photo, choose mobility context, optionally share location, and approve analysis. | Selected image and persona. | A structured scene unlocks Ask. |
| Ask | State the immediate need and optionally add a destination. | Scene understanding. | Recommendation and route context unlock Act. |
| Act | Review, verify, and refine the guidance. | Recommendation. | Route inspection and contextual follow-up chat. |

The step rail makes current progress visible. Later stages are unavailable until
their prerequisites exist. A person can revisit the current or completed stage
to correct input; future controls remain disabled. Successful analysis,
reasoning, and chat operations move focus and the active stage forward without
discarding the active browser-session context.

This is progressive disclosure, not a rigid wizard: people can return to a
completed stage, but they should not be confronted with a destination form,
route map, and chat composer before their scene has been understood.

---

# Journey 1 - First-Time User

## Goal

Help users understand CityMind and begin the core experience without an
onboarding detour.

## Flow

1. The user opens CityMind and sees the Capture stage and step rail.
2. They select a scene with the camera, upload control, or repeatable demo
   scene.
3. The selected-image state makes the next action, Continue to confirm,
   unambiguous.
4. In Confirm, they choose a persona, optionally share location, and approve
   analysis.
5. The successful scene summary advances them to Ask.

## Expected Experience

Within 30 seconds the user should understand:

* CityMind uses vision to understand an urban scene.
* CityMind adapts guidance to mobility context.
* A photo is reviewed and explicitly approved before it is sent to AI.
* The next required decision is shown by the active stage and primary action.

---

# Journey 2 - Camera Analysis (Hero Journey)

## Goal

Demonstrate Vision + Urban Reasoning from a real or demo urban scene.

## Flow

1. **Capture:** Open the camera, upload an image, or select the demo scene.
2. **Confirm:** Inspect the preview; make sure the relevant sign, entrance,
   path, or accessibility cue is visible. Select a persona and optionally share
   location.
3. Choose **Analyze this scene**. Image selection alone never starts AI work.
4. CityMind displays a non-technical analysis state and, on success, a scene
   summary.
5. **Ask:** Enter a question and, when useful, a text destination.
6. CityMind combines scene, persona, location, question, and destination into
   structured reasoning and route context.
7. **Act:** Review the recommendation, warnings, route/map state, and use
   follow-up chat to refine the decision.

## Example

A user captures Vyttila Metro Station and asks, "I'm travelling with luggage."
CityMind responds with evidence-aware guidance:

* Follow the best confirmed entrance or ask staff to verify it.
* Confirm elevator or ramp availability before committing to a path.
* Use visible signage to verify the correct exit.
* Inspect the walking route status and its verification warnings.
* Read why this is the recommended next move.

## Success Criteria

The complete flow should take less than one minute. No scene leaves the device
for analysis until the user approves it in Confirm.

---

# Journey 3 - Tourist Exploration

## Goal

Help visitors understand an unfamiliar place without pretending that uncertain
place information is live or verified.

## Flow

1. Capture an urban scene.
2. Confirm with the Tourist persona and approve analysis.
3. In Ask, enter "What can I visit nearby?" and optionally add a destination.
4. In Act, review context-aware ideas, route context when a destination is
   resolved, and appropriate verification notes.
5. Select a nearby-place follow-up to ask CityMind for more context rather than
   treating it as a live operational place listing.

## Outcome

The tourist feels confident exploring and understands what should be checked in
person.

---

# Journey 4 - Accessibility Journey

## Goal

Support mobility-constrained users with honest, evidence-aware guidance.

## Flow

1. Capture a scene that includes the relevant route, entrance, sign, or
   platform context.
2. In Confirm, select Wheelchair User and approve analysis.
3. In Ask, enter a question such as "How do I reach Platform 2?"
4. CityMind evaluates visible cues, walking effort, route data, and known
   uncertainty.
5. In Act, the user sees a candidate walking path plus the accessibility
   verification needs.

## Outcome

The user receives context-aware guidance that calls out elevators, ramps,
entrances, and uncertainty where relevant. A route is never represented as
barrier-free without trusted accessibility evidence.

---

# Journey 5 - Elderly Companion

## Goal

Reduce physical effort for a person traveling with an elderly companion.

## Flow

1. Capture the relevant scene.
2. In Confirm, select Elderly Companion.
3. In Ask, add a destination when route-aware guidance would help.
4. In Act, review advice that prioritizes lower walking effort, potential
   elevators, covered paths, and on-site verification.

---

# Journey 6 - Luggage Traveler

## Goal

Reduce carrying effort while preserving route honesty.

## Flow

1. Capture the relevant scene.
2. In Confirm, select Luggage Traveler.
3. In Ask, provide the immediate question and optional destination.
4. In Act, review the lowest-effort candidate path and verify infrastructure
   before travel.

---

# Journey 7 - Follow-up Conversation

## Goal

Allow a natural refinement after CityMind has produced guidance.

## Flow

1. Complete Ask and arrive at Act with a recommendation.
2. Inspect the recommendation and route context first; this keeps the decision
   grounded in the visible evidence.
3. Use the Act-stage chat to ask "Why?", "What if it rains?", or "What should
   I verify before I go?"
4. CityMind answers with the active browser-session context only.

## Expected Behaviour

The chat composer is unavailable before a recommendation exists. Sending state
is visible, prevents duplicate submissions, and a retry preserves the failed
message without repeating vision or reasoning work.

---

# Journey 8 - Error Recovery

## Goal

Recover from a failure without discarding completed work or confusing the user
about the active stage.

| Failure | User-facing recovery | Preserved context |
| --- | --- | --- |
| Camera unavailable | Explain the device or permission issue and offer upload. | Capture remains available. |
| Image issue | Explain the image requirement and allow replacement. | The user stays in Capture or Confirm. |
| Vision failure | Show a calm retry action or typed fallback observation. | Selected image and persona remain available. |
| Reasoning failure | Offer a retry of the same scene, question, persona, and destination. | The user returns to Ask with context intact. |
| Destination failure | Explain missing, unavailable, or not-found status; do not invent a place. | Question and scene remain available. |
| Directions or map failure | Preserve readable route information and local map fallback when possible. | Act remains usable for recommendation and chat. |
| Chat failure | Preserve the unsent message and offer a no-duplicate retry. | Recommendation and route remain available. |

The error card uses the operation-specific retry label and does not restart the
whole workflow unless the user intentionally changes the photo.

---

# Journey 9 - Demo Flow (Hackathon)

This is the most important demonstration path.

1. Open CityMind and point out the four-step rail.
2. In **Capture**, select a metro station with the camera, upload control, or
   deterministic demo scene.
3. In **Confirm**, choose Tourist, optionally use location, review the preview,
   and choose **Analyze this scene**.
4. Wait for the scene summary to unlock **Ask**.
5. In **Ask**, enter "I'm travelling with luggage to Fort Kochi." and, if
   appropriate, set Fort Kochi as the destination.
6. In **Act**, explain the recommendation, verification needs, walking route
   status, and map fallback behavior.
7. Return to **Confirm**, switch to Wheelchair User, then ask the same
   question again. Show that the mobility context changes the reasoning but
   does not fabricate accessibility verification.
8. Use Act-stage chat to ask "Why?" and show the explanation.

---

# Emotional Journey

```text
Curiosity -> Confidence -> Trust -> Relief -> Delight
```

Progressive disclosure is intended to make each transition feel like a
confident next move rather than a form to complete.

---

# Journey Mapping Rules

Every journey must provide:

* Simple entry through Capture.
* Minimal typing in Ask.
* Explicit approval before vision analysis.
* Persona-aware reasoning.
* Clear explanation and verification notes.
* Controlled return to completed stages.
* Easy contextual follow-up in Act.

Users must never:

* Wonder what to do next.
* Be confronted with future-stage controls before required context exists.
* Receive unexplained recommendations.
* Lose conversational context after a recoverable error.
* Need multiple applications to complete the core decision.

---

# Journey Completion Metrics

Each journey is successful when the user:

* Understands the current stage and its primary action.
* Understands the recommendation and why it was generated.
* Can distinguish live, estimated, and unverified route information.
* Can confidently act or ask for clarification.
* Can recover from a provider failure without losing completed work.

---

# Future Journeys

Potential future experiences include voice-only navigation, live transit
guidance, crowd-aware routing, emergency evacuation, tourist itinerary
generation, smart parking, public-transport disruption handling, and family
group planning. They are outside the MVP and must not weaken the current
Capture -> Confirm -> Ask -> Act experience.

This document is the canonical reference for designing and validating CityMind
user interactions.
