# Implementation Plan

**Project:** CityMind

**Version:** 1.0

**Status:** Development Roadmap

---

# Purpose

This document defines the complete implementation strategy for CityMind.

Unlike the PRD, this document answers:

* What should be built?
* In what order?
* What are the dependencies?
* What is critical?
* What can be skipped?

This document is the engineering execution plan.

---

# Implementation Philosophy

The objective is **not** to build every possible feature.

The objective is to build the **best possible demo**.

Every implementation decision should maximize demo quality.

---

# Development Principles

Always:

* Build vertically.
* Finish features completely.
* Test continuously.
* Keep the application deployable.

Never:

* Build multiple unfinished features.
* Prematurely optimize.
* Refactor during the hackathon.
* Introduce unnecessary abstractions.

---

# Development Order

Implementation follows seven phases.

```text
Foundation

↓

Core UI

↓

Vision AI

↓

Urban Reasoning

↓

Maps

↓

Polish

↓

Demo
```

Each phase depends on the previous one.

---

# Phase 1 — Foundation

## Goal

Establish a stable project structure.

---

### Tasks

* Initialize Next.js project.
* Configure TypeScript.
* Install Tailwind CSS.
* Install shadcn/ui.
* Install Framer Motion.
* Configure ESLint.
* Configure Prettier.
* Configure environment variables.
* Create folder structure.
* Create base layout.

---

### Deliverables

* Working application.
* Clean architecture.
* Responsive layout.
* Shared design tokens.

---

### Exit Criteria

Project runs successfully.

Repository structure matches documentation.

---

# Phase 2 — Core UI

## Goal

Build the complete interface without functionality.

---

### Tasks

Landing Page

Home Screen

Navigation

Camera Card

Persona Selector

Recommendation Cards

Chat Layout

Interactive Map Placeholder

Loading Components

Error Components

Empty States

---

### Deliverables

Complete static interface.

---

### Exit Criteria

Every page exists.

Responsive layout complete.

---

# Phase 3 — Vision AI

## Goal

Integrate image understanding.

---

### Tasks

Image Upload

Camera

Image Preview

Vision API Integration

Structured Vision Output

Loading States

Retry Flow

---

### Deliverables

Image

↓

Vision

↓

Structured Scene

---

### Exit Criteria

AI consistently analyzes uploaded images.

---

# Phase 4 — Urban Reasoning

## Goal

Implement the core intelligence.

---

### Tasks

Context Builder

Persona Context

Prompt Loader

Reasoning Service

Recommendation Generator

Structured Output

---

### Deliverables

Vision

↓

Reasoning

↓

Recommendations

---

### Exit Criteria

Recommendations adapt to personas.

Reasoning is explainable.

---

# Phase 5 — Maps

## Goal

Visualize AI recommendations.

---

### Tasks

Leaflet + OpenStreetMap + OSRM

Current Location

Destination Marker

Route Display

Recommendation Overlay

---

### Deliverables

Recommendation

↓

Map

---

### Exit Criteria

Map updates correctly after reasoning.

---

# Phase 6 — Polish

## Goal

Transform prototype into product.

---

### Tasks

Animations

Loading Improvements

Better Empty States

Improved Error Handling

Responsive Refinement

Accessibility Review

Micro Interactions

Performance Optimization

---

### Deliverables

Premium user experience.

---

### Exit Criteria

Application feels production quality.

---

# Phase 7 — Demo Preparation

## Goal

Optimize for judging.

---

### Tasks

Prepare Demo Images

Prepare Demo Questions

Verify AI Responses

Improve Timing

Practice Presentation

Reduce Latency

Fix Visual Bugs

---

### Deliverables

Reliable demo.

---

### Exit Criteria

Complete demo can be performed repeatedly without failure.

---

# Feature Dependency Graph

```text
Foundation

↓

UI

↓

Camera

↓

Vision

↓

Reasoning

↓

Recommendations

↓

Map

↓

Conversation

↓

Polish
```

Nothing should bypass this dependency order.

---

# Component Build Order

1.

App Layout

2.

Navigation

3.

Hero Section

4.

Persona Selector

5.

Camera

6.

Image Upload

7.

Vision Results

8.

Recommendation Cards

9.

Map

10.

Chat

11.

Animations

12.

Responsive Refinement

---

# Service Build Order

1.

OpenAI Service

2.

Vision Service

3.

Prompt Loader

4.

Reasoning Service

5.

Map Service

6.

Conversation Service

---

# API Build Order

1.

Health

2.

/vision

3.

/reason

4.

/chat

5.

/map

---

# Testing After Every Phase

Never wait until the end.

After every phase verify:

* Build succeeds.
* TypeScript passes.
* No console errors.
* Mobile layout works.
* Desktop layout works.

---

# Definition of Complete

A phase is complete only if:

* Implementation finished.
* Manual testing complete.
* Documentation updated.
* No critical bugs.
* Ready for next phase.

---

# Risk Management

## High Risk

Vision API failures.

Mitigation

Graceful retry.

---

## High Risk

Slow AI responses.

Mitigation

Streaming responses.

Loading indicators.

---

## Medium Risk

Map integration.

Mitigation

Implement after reasoning engine.

---

## Medium Risk

Responsive issues.

Mitigation

Develop mobile-first.

---

# Scope Protection

During implementation, reject features that are not directly related to:

* Vision
* Reasoning
* Recommendations
* Maps
* Personas

Examples of rejected scope:

* Authentication
* Notifications
* Dashboards
* User Profiles
* Admin Panels
* Saved History
* Analytics

---

# Deployment Strategy

Deploy continuously.

Every major phase should end with:

* Successful build.
* Successful deployment.
* Working demo.

Never allow the application to remain broken.

---

# Engineering Checklist

Before writing any code:

* Read README.
* Read PROJECT_OVERVIEW.
* Read PRD.
* Read Architecture.
* Read Feature Specification.

Before committing:

* Run lint.
* Verify types.
* Test manually.
* Update documentation.

---

# Final MVP Checklist

Foundation

☐

UI

☐

Vision AI

☐

Reasoning

☐

Persona Switching

☐

Map Integration

☐

Recommendation Cards

☐

Chat

☐

Animations

☐

Responsive Design

☐

Error Handling

☐

Deployment

☐

Demo Ready

☐

---

# Guiding Principle

Current implementation status:

* Foundation, UI, vision, reasoning, persona switching, map integration,
  recommendation cards, chat, animations, responsive design, and error handling
  are implemented.
* Live OpenAI and OSRM paths are implemented. OSRM defaults to the public demo
  endpoint and can be replaced with `OSRM_BASE_URL`.
* Deterministic fallback mode is implemented for local demos without external
  credentials.
* A local demo scene asset is available at `public/demo/metro-station.svg` and
  can be loaded from the camera panel.
* Deployment is ready for Vercel after environment variables are configured.

The implementation should optimize for **clarity over complexity**.

Every hour invested should make the **Vision → Context → Urban Reasoning → Recommendation** workflow more impressive.

If a task does not strengthen the core demo, it should not be implemented during the hackathon.
