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
* Safe routes

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

Both themes should be supported.

---

# Typography

Primary Font

Geist

Fallback

Inter

System Sans

The application must not depend on runtime Google Fonts downloads during
production builds. Geist remains the preferred face when available locally or
through the browser environment, with Inter and system sans-serif fallbacks.

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

# Standard Animations

Fade

Slide

Scale

Layout transitions

Loading shimmer

Typing indicator

AI response reveal

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

Streaming animation

Markdown support (future)

---

# Camera UI

Camera should provide:

* Live preview
* Capture button
* Upload option
* Retake
* Loading overlay

---

# Map UI

Map should display:

* Current location
* Route
* Destination
* Recommendation overlay

Map controls should remain minimal.

---

# Loading States

Every async component requires:

* Skeleton
* Spinner
* Progress indicator

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

---

# Accessibility

Support:

* WCAG AA contrast
* Keyboard navigation
* Screen readers
* Focus indicators
* Reduced motion preferences

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

Support:

Light Mode

Dark Mode

Both themes should maintain visual consistency.

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
