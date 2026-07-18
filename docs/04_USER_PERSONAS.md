# User Personas

**Project:** CityMind

**Version:** 1.0

**Status:** Product Research

---

# Purpose

This document defines the target users of CityMind.

Every feature, UI decision, AI prompt, and reasoning workflow should be evaluated against these personas.

If a feature does not provide meaningful value to at least one primary persona, it should be reconsidered for the MVP.

---

# Primary Persona

# Daily Metro Commuter

## Profile

Age: 20–45

Uses public transport frequently.

Travels between work, college, and home.

Often under time pressure.

Values efficiency over exploration.

---

## Goals

* Reach destinations quickly.
* Minimize walking.
* Avoid unnecessary transfers.
* Find the correct entrance and exit.
* Receive reliable recommendations.

---

## Frustrations

* Multiple station exits.
* Confusing navigation.
* Walking longer than necessary.
* Lack of accessibility information.
* Switching between multiple applications.

---

## CityMind Value

CityMind understands the commuter's surroundings and recommends the smartest route based on the current context.

---

# Persona 2

# Tourist

## Profile

Age: Any

First time visiting the city.

Limited knowledge of public transport.

May not understand local landmarks.

---

## Goals

* Explore confidently.
* Find nearby attractions.
* Understand metro connections.
* Receive simple directions.
* Discover useful services nearby.

---

## Frustrations

* Fear of getting lost.
* Language barriers.
* Too many unfamiliar choices.
* Poor understanding of local transportation.

---

## CityMind Value

Acts as an intelligent local guide.

Instead of simply showing locations, it explains where to go and why.

---

# Persona 3

# Elderly Traveler

## Profile

Usually accompanied by family.

May experience reduced mobility.

Requires comfortable travel.

---

## Goals

* Avoid stairs.
* Minimize walking.
* Use elevators whenever possible.
* Receive safe navigation.

---

## Frustrations

* Long walking distances.
* Crowded areas.
* Difficult station layouts.
* Poor accessibility.

---

## CityMind Value

Generates recommendations that prioritize comfort and accessibility.

---

# Persona 4

# Wheelchair User

## Profile

Requires fully accessible navigation.

Accessibility is essential rather than optional.

---

## Goals

* Accessible entrances.
* Elevator availability.
* Ramp access.
* Accessible restrooms.
* Barrier-free movement.

---

## Frustrations

* Missing accessibility information.
* Unexpected stairs.
* Broken elevators.
* Inaccessible routes.

---

## CityMind Value

Produces accessibility-aware recommendations rather than generic navigation.

---

# Persona 5

# Traveler With Luggage

## Profile

Airport passengers.

Business travelers.

Tourists carrying baggage.

---

## Goals

* Reduce walking.
* Avoid stairs.
* Find elevators.
* Reach transport quickly.

---

## Frustrations

* Long corridors.
* Carrying luggage upstairs.
* Wrong exits.
* Poor signage.

---

## CityMind Value

Optimizes recommendations based on physical effort rather than distance alone.

---

# Persona Attributes

| Persona               | Priority | Accessibility | Exploration | Speed  |
| --------------------- | -------- | ------------- | ----------- | ------ |
| Daily Commuter        | High     | Medium        | Low         | High   |
| Tourist               | High     | Medium        | High        | Medium |
| Elderly               | High     | High          | Low         | Medium |
| Wheelchair User       | High     | Critical      | Low         | Medium |
| Traveler With Luggage | Medium   | High          | Low         | Medium |

---

# Persona Selection in MVP

The MVP will provide a simple persona selector before or during interaction.

Supported options:

* Daily Commuter
* Tourist
* Elderly
* Wheelchair User
* Carrying Luggage

The selected persona becomes part of the AI reasoning context.

---

# AI Context Variables

Each persona contributes structured context to the AI.

### Daily Commuter

Prioritize:

* Speed
* Efficiency
* Fewer transfers

---

### Tourist

Prioritize:

* Simplicity
* Landmarks
* Nearby attractions
* Helpful explanations

---

### Elderly

Prioritize:

* Comfort
* Safety
* Reduced walking
* Elevators

---

### Wheelchair User

Prioritize:

* Accessibility
* Barrier-free routes
* Elevators
* Ramps

---

### Traveler With Luggage

Prioritize:

* Minimal carrying effort
* Elevators
* Wider pathways
* Shorter walking distance

---

# Persona Switching

Users may change personas at any time.

Changing personas should immediately influence:

* AI reasoning
* Recommendation cards
* Route suggestions
* Accessibility advice

without requiring a new image upload.

---

# Design Principles

Every persona should feel:

* Understood
* Supported
* Included

The AI should never provide identical recommendations across all personas unless the situation genuinely warrants it.

---

# Future Personas

Outside the MVP, CityMind may support:

* Parents with strollers
* Cyclists
* Visually impaired users
* Delivery personnel
* Emergency responders
* Students
* Business travelers
* International visitors

These are intentionally excluded from the current hackathon scope to maintain focus on a polished core experience.

This document serves as the canonical reference for user-centric design and AI personalization throughout the project.
