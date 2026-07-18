# Design System

**Project:** CityMind

**Version:** 1.0

**Status:** Design Specification

---

# Purpose

This document defines the complete visual language of CityMind.

Every screen, component, animation, spacing rule, typography choice, color, and interaction should follow this document.

The goal is to make CityMind feel like one cohesive product rather than a collection of pages.

---

# Design Philosophy

CityMind should feel:

* Intelligent
* Calm
* Modern
* Premium
* Minimal
* Trustworthy

The interface should communicate confidence.

The user should focus on the AI, not the UI.

---

# Design Principles

Every screen should satisfy:

* Minimal cognitive load
* Strong visual hierarchy
* Consistent spacing
* Smooth motion
* Accessibility
* Mobile-first
* Desktop optimized

---

# Visual Identity

CityMind represents urban intelligence.

The design should combine:

* AI
* Maps
* Navigation
* Spatial awareness

The visual language should communicate intelligence without appearing futuristic or overly technical.

---

# Color Palette

## Primary

Blue

Purpose

* Primary actions
* AI highlights
* Links
* Active elements

---

## Secondary

Slate

Purpose

* Navigation
* Cards
* Backgrounds

---

## Accent

Emerald

Purpose

* Success
* Recommendations
* Confirmed or live route state

---

## Warning

Amber

Purpose

* Warnings
* Accessibility notices

---

## Danger

Red

Purpose

* Errors
* Blocked routes

---

## Background

Light

* White
* Light Gray

Dark

* Near Black
* Dark Slate

Both themes are implemented with the shared CSS token set. The header theme
toggle adds or removes the `dark` class on the document root for the current
session; it is intentionally a low-friction local preference rather than a
stored user account setting.

---

# Typography

Primary Font

Geist

Fallback

Inter

System Sans

---

## Heading

Bold

Large

High contrast

---

## Body

Regular

Comfortable reading width

---

## Caption

Small

Muted

---

# Spacing System

Use an 8-point spacing system.

Allowed values

```text
4

8

12

16

24

32

40

48

64
```

Avoid arbitrary spacing values.

---

# Border Radius

Cards

Large

Buttons

Medium

Inputs

Medium

Badges

Full

Maintain consistency.

---

# Shadows

Three elevation levels.

Low

Cards

Medium

Floating panels

High

Dialogs

Avoid excessive shadows.

---

# Layout Principles

Maximum content width

Readable.

Centered.

Generous whitespace.

Avoid dense interfaces.

---

# Grid

Desktop

12-column

Tablet

8-column

Mobile

4-column

---

# Cards

Cards should contain:

* Title
* Description
* Content
* Optional action

Padding should remain consistent.

---

# Buttons

Primary

Filled

---

Secondary

Outlined

---

Ghost

Transparent

---

Danger

Red

---

Disabled

Muted

Buttons should clearly indicate interaction state.

---

# Icons

Use Lucide React only.

Icons should remain:

* Simple
* Consistent
* Minimal

Avoid mixing icon libraries.

---

# Motion

Use Framer Motion.

Animations should communicate:

* State
* Progress
* Focus

Not decoration.

---

# Implemented Motion

* A restrained fade-and-rise entrance for onboarding and guidance content.
* Analysis steps and explicit workflow-status changes instead of decorative
  motion.
* Smooth focus scrolling only when the user has not requested reduced motion.

The global reduced-motion media query reduces animation and scrolling duration.

---

# AI Components

AI-generated content should have a distinct appearance.

Examples

* AI badge
* Thinking indicator
* Confidence score
* Recommendation card

These should visually distinguish AI output from user input.

---

# Recommendation Cards

Each recommendation card should contain:

* Title
* Recommendation
* Explanation
* Benefits
* Confidence
* Optional CTA

Cards should prioritize readability.

---

# Chat UI

Messages

Rounded

Comfortable spacing

Clear sender distinction

Visible sending state

Multiline input and suggested prompts

CityMind currently returns complete structured chat replies rather than token
streaming. The sending state must never pretend that a response is streaming.

---

# Camera UI

Camera should provide:

* Live preview
* Capture button
* Upload option
* Repeatable demo-scene option
* Selected-image preview
* Explicit "Confirm and analyze" action
* Retake
* Loading overlay

Selecting an image is a review state, not permission to send it to AI. The
confirmation affordance must remain visually dominant until analysis begins.

---

# Map UI

Mapbox GL should display:

* Current location and resolved destination markers
* Walking-route GeoJSON and route status
* Distance, duration, walking mode, and turn summary
* Minimal navigation and recenter controls
* An explicit accessibility-verification notice

Blue communicates a live routed walk; amber communicates an estimated fallback
route. Neither color makes an accessibility claim. If Mapbox cannot initialize,
the map panel must keep the route metrics and text instructions visible and
replace the interactive canvas with an accessible local visual fallback.

---

# Loading States

Every async component requires:

* A visible loading surface or progress indicator
* A success state
* A recovery path when it fails

The app shell uses a route-level skeleton, the camera shows analysis steps, the
chat panel shows its sending state, and the map announces loading separately.
Never leave blank space.

---

# Empty States

Empty states should:

Explain

Guide

Encourage action

Example

"No image selected yet.

Capture your surroundings to begin."

---

# Error States

Error screens should:

Explain the issue.

Provide recovery actions.

Never expose technical details.

Workflow errors use a reusable ErrorState with a retry action that preserves
the right prior context. The framework-level error boundary uses the same calm
language and offers both retry and return-home actions.

---

# Accessibility

Support:

* WCAG AA contrast
* Keyboard navigation
* Screen readers
* Focus indicators
* Reduced motion preferences

The interactive map has an accessible label and status messaging, while its
route metrics and instructions remain available as a text alternative. Focus
movement initiated by recommendation actions must land on the corresponding map
or conversation section.

Accessibility is mandatory.

---

# Responsive Design

The application should support:

Desktop

Tablet

Mobile

Landscape

Portrait

The same experience should remain intuitive across devices.

---

# Theme Support

Light and dark modes share semantic CSS color tokens for backgrounds, cards,
foregrounds, borders, focus rings, warnings, and recommendations. The visible
header control has an explicit accessible label that describes the destination
theme. The app starts in light mode and does not persist a preference across a
full reload in the MVP.

---

# Design Tokens

All colors, spacing, typography, shadows, radii, and motion durations should be centralized as reusable design tokens.

Avoid hardcoded values inside components.

---

# Component Consistency

Every component should use:

* Shared typography
* Shared spacing
* Shared colors
* Shared radius
* Shared shadows

No component should define its own visual language.

---

# Design Review Checklist

Before approving a screen:

* Consistent spacing
* Proper hierarchy
* Accessible colors
* Responsive layout
* Reusable components
* Smooth motion
* Clear call-to-action
* No unnecessary visual noise

---

# Guiding Principle

CityMind should feel less like a hackathon project and more like a polished production product.

Every pixel should reinforce clarity, trust, and intelligence.

A user should be able to recognize any screen as part of CityMind without seeing the logo because the visual language remains consistent throughout the application.
