# User Journeys

**Project:** CityMind

**Version:** 1.0

**Status:** User Experience Specification

---

# Purpose

This document defines every end-to-end journey supported by the CityMind MVP.

Unlike user stories, user journeys describe the complete interaction from opening the application until achieving the desired outcome.

Every screen, API, AI prompt, and UI component should support one or more of these journeys.

---

# Design Principles

Every journey should feel:

* Fast
* Natural
* Intelligent
* Conversational
* Predictive
* Explainable

The user should never feel like they are "using AI."

Instead, they should feel like they are interacting with an intelligent urban assistant.

---

# Journey 1 — First-Time User

## Goal

Help users understand CityMind immediately.

---

### Flow

Open Application

↓

Beautiful onboarding screen

↓

Short introduction

↓

"What can CityMind help you with?"

↓

Choose Persona

↓

Continue

↓

Home Screen

---

### Expected Experience

Within 30 seconds users should understand:

* CityMind uses Vision AI.
* CityMind reasons about cities.
* Camera is the primary interaction.
* AI provides recommendations.

---

# Journey 2 — Camera Analysis (Hero Journey)

## Goal

Demonstrate Vision + Urban Reasoning.

---

### Flow

Open Camera

↓

Capture Image

↓

Upload to AI

↓

Vision Analysis

↓

Scene Understanding

↓

Context Generation

↓

User Question

↓

Urban Reasoning

↓

Recommendation

↓

Interactive Map

↓

Follow-up Questions

---

### Example

User captures Vyttila Metro Station.

↓

"I'm travelling with luggage."

↓

AI responds with evidence-aware guidance:

* Follow the best confirmed entrance or ask staff to verify it.
* Confirm elevator or ramp availability before committing to the route.
* Use visible signage to verify the correct exit.
* See the route estimate and its verification warnings.
* Here's why.

---

### Success Criteria

The complete flow should take less than one minute.

---

# Journey 3 — Tourist Exploration

## Goal

Help visitors understand unfamiliar places.

---

### Flow

Open Camera

↓

Capture Surroundings

↓

Ask:

"What can I visit nearby?"

↓

AI identifies surroundings

↓

Suggests:

* Attractions
* Cafés
* Metro connections
* Walking routes

↓

Map updates

---

### Outcome

Tourist feels confident exploring.

---

# Journey 4 — Accessibility Journey

## Goal

Support mobility-constrained users.

---

### Flow

Select Persona

↓

Wheelchair User

↓

Capture Scene

↓

Ask

"How do I reach Platform 2?"

↓

AI evaluates

* Elevators
* Ramps
* Entrances
* Walking effort

↓

Recommendation

↓

Map highlights the candidate walking path and accessibility verification needs

---

### Outcome

Barrier-free guidance.

---

# Journey 5 — Elderly Companion

## Goal

Reduce physical effort.

---

### Flow

Persona

↓

Elderly

↓

Camera

↓

Destination

↓

AI recommends

* Less walking
* Elevators
* Covered paths
* Rest areas (future)

---

# Journey 6 — Luggage Traveler

## Goal

Reduce carrying effort.

---

### Flow

Persona

↓

Carrying Luggage

↓

Scene Analysis

↓

Destination

↓

Recommendation

↓

Lowest-effort candidate path, pending on-site verification

↓

Map

---

# Journey 7 — Follow-up Conversation

## Goal

Allow natural conversations.

---

### Flow

Recommendation

↓

User asks

"Why?"

↓

AI explains.

↓

User asks

"What if it rains?"

↓

AI adapts.

↓

User asks

"Any cafés nearby?"

↓

AI responds without losing context.

---

### Expected Behaviour

Conversation should remain contextual within the active session.

---

# Journey 8 — Error Recovery

## Goal

Gracefully handle failures.

---

## Image Failure

Camera fails

↓

Retry

↓

Upload alternative image

---

## AI Failure

Model unavailable

↓

Friendly message

↓

Retry button

↓

Fallback explanation

---

## Map Failure

Map unavailable

↓

Text recommendations remain visible

↓

User can still continue.

---

# Journey 9 — Demo Flow (Hackathon)

This is the most important journey.

The live demo should follow exactly this order.

---

### Step 1

Open CityMind.

---

### Step 2

Select

Tourist

---

### Step 3

Open Camera.

---

### Step 4

Capture metro station.

---

### Step 5

Vision AI analyses scene.

---

### Step 6

Ask:

"I'm travelling with luggage to Fort Kochi."

---

### Step 7

AI responds:

* Best entrance
* Recommended exit
* Route
* Walking effort
* Explanation

---

### Step 8

Switch Persona

Wheelchair User

---

### Step 9

Same question.

Recommendations change immediately.

---

### Step 10

Show updated map.

---

### Step 11

Ask:

"Why?"

AI explains reasoning.

---

### Step 12

Finish.

---

# Emotional Journey

Users should experience the following emotions.

Beginning

↓

Curiosity

↓

Confidence

↓

Trust

↓

Relief

↓

Delight

---

# Journey Mapping Principles

Every journey should satisfy:

✓ Simple entry

✓ Minimal typing

✓ Camera-first interaction

✓ AI reasoning

✓ Personalized recommendations

✓ Clear explanations

✓ Easy follow-up

---

# UX Rules

Users should never:

* Wonder what to do next.
* Feel overwhelmed.
* Receive unexplained recommendations.
* Lose conversational context.
* Need multiple apps to complete one task.

---

# Journey Completion Metrics

Each journey is successful when the user:

* Understands the recommendation.
* Understands why it was generated.
* Can confidently act on it.
* Feels the AI understood both the environment and their personal situation.

---

# Future Journeys

Potential future experiences:

* Voice-only navigation
* Live metro guidance
* Crowd-aware routing
* Emergency evacuation
* Tourist itinerary generation
* Smart parking
* Public transport disruption handling
* Family group planning

These journeys are outside the MVP but align with the long-term vision of CityMind as an Urban Intelligence Platform.

This document is the canonical reference for designing user interactions and validating UX decisions throughout the project.
