# UI/UX Guidelines

**Project:** CityMind

**Version:** 1.0

**Status:** User Interface & User Experience Specification

---

# Purpose

This document defines the complete UI/UX experience of CityMind.

It describes every screen, interaction, layout, animation, navigation flow, responsive behavior, accessibility consideration, and visual hierarchy.

Unlike the Design System, which defines visual language, this document defines **how users experience the application**.

This document is the source of truth for frontend implementation.

---

# Design Philosophy

CityMind should feel like an intelligent assistant instead of a traditional application.

Every interaction should communicate:

* Intelligence
* Simplicity
* Confidence
* Speed
* Trust

The application should feel effortless.

---

# UX Principles

Every screen should satisfy:

* One clear primary action
* Minimal cognitive load
* Fast navigation
* Clear hierarchy
* Immediate feedback
* Context preservation
* Accessibility-first

Users should never wonder:

> "What should I do next?"

---

# Design Keywords

CityMind should feel:

* Premium
* AI-first
* Calm
* Spatial
* Helpful
* Modern
* Human-centered

---

# Navigation Structure

```text
Landing

↓

Home

↓

Capture Image

↓

Vision Analysis

↓

AI Conversation

↓

Recommendation

↓

Interactive Map

↓

Follow-up Questions
```

No deep navigation.

Everything should be achievable within 2–3 interactions.

---

# Information Architecture

```text
Home
│
├── Hero
├── Persona
├── Camera
├── Suggested Prompts
│
Vision Result
│
├── Scene Summary
├── AI Recommendation
├── Reasoning
├── Nearby Places
│
Map
│
Chat
```

---

# Screen List

### 1. Landing

Purpose

Introduce CityMind.

Contains

* Logo
* Tagline
* CTA
* Hero Illustration

Primary CTA

> Start Exploring

---

### 2. Home

Purpose

Main entry point.

Contains

* Hero section
* Camera card
* Upload button
* Persona selector
* Suggested prompts

This should be the cleanest page.

---

### 3. Camera Screen

Purpose

Capture surroundings.

Contains

* Live preview
* Capture button
* Upload image
* Retake
* Flash indicator (optional)

After capture

↓

Automatic AI analysis begins.

---

### 4. Vision Analysis

Purpose

Display AI processing.

Contains

* Image preview
* Loading animation
* Analysis progress
* AI thinking indicator

Avoid showing technical details.

Instead communicate progress naturally.

Example

> Understanding your surroundings...

---

### 5. AI Recommendation Screen

Purpose

Present the AI's answer.

Contains

* Recommendation Card
* Reasoning Card
* Confidence Indicator
* Action Buttons

Example

Recommended Entrance

Reason

Benefits

Open on Map

Ask Follow-up

---

### 6. Interactive Map

Purpose

Visualize recommendations.

Display

* Current location
* Suggested route
* Destination
* Nearby landmarks

The map should support:

* Zoom
* Pan
* Re-center

No excessive controls.

---

### 7. AI Chat

Purpose

Support natural follow-up conversations.

Layout

Conversation

↓

Prompt Suggestions

↓

Input

↓

Send Button

Context must persist throughout the session.

---

# Persona Selector

Purpose

Allow users to personalize recommendations.

Supported Personas

* Tourist
* Daily Commuter
* Elderly
* Wheelchair User
* Carrying Luggage

Changing personas should instantly affect future reasoning.

---

# Recommendation Cards

Every recommendation card contains:

* Icon
* Title
* Recommendation
* Explanation
* Benefits
* Confidence
* CTA

Cards should be visually distinct from chat messages.

---

# Confidence Indicator

Purpose

Communicate certainty.

Levels

High

Medium

Low

Low confidence should encourage verification.

---

# AI Thinking State

Instead of generic spinners,

display progressive steps.

Example

✓ Understanding the image

↓

✓ Identifying landmarks

↓

✓ Understanding your needs

↓

✓ Reasoning

↓

✓ Preparing recommendations

This creates perceived intelligence.

---

# Suggested Questions

Display contextual prompts.

Examples

* Which entrance is best?
* Is this accessible?
* What should I visit nearby?
* What's the fastest route?

Prompts should adapt after image analysis.

---

# Layout

Desktop

```text
--------------------------------

Sidebar | Main | Map

--------------------------------
```

---

Tablet

```text
Main

↓

Map

↓

Chat
```

---

Mobile

```text
Hero

↓

Camera

↓

Recommendations

↓

Map

↓

Chat
```

---

# Mobile Experience

The application should feel mobile-first.

Important actions must remain reachable with one hand.

Large touch targets.

Minimal scrolling.

---

# Animation Guidelines

Use motion only when it improves understanding.

Animate:

* Cards
* AI responses
* Image transitions
* Map updates
* Page transitions

Avoid decorative animations.

---

# Loading States

Every asynchronous operation must provide feedback.

Examples

Image Upload

↓

Uploading...

Vision

↓

Understanding your surroundings...

Reasoning

↓

Finding the best recommendation...

Maps

↓

Preparing route...

---

# Error States

Every failure should explain:

What happened.

What users can do next.

Never expose stack traces.

---

# Empty States

Examples

No image

"No image selected yet."

No recommendation

"Capture a location to receive AI guidance."

---

# Visual Hierarchy

Priority order

1. Recommendation

2. Reason

3. Map

4. Conversation

5. Additional information

Users should immediately notice the recommendation.

---

# Accessibility

Support

* Keyboard navigation
* Screen readers
* High contrast
* Reduced motion
* Semantic HTML
* Proper focus order

---

# User Feedback

Every interaction should provide feedback.

Examples

Button pressed

Image uploaded

AI started

AI completed

Route updated

Persona changed

Never leave users wondering if an action succeeded.

---

# Responsive Rules

Support

* Mobile
* Tablet
* Desktop
* Ultrawide

Layouts should adapt without changing interaction patterns.

---

# Interaction Principles

Users should:

Capture

↓

Understand

↓

Ask

↓

Receive

↓

Act

Every screen should reinforce this flow.

---

# UX Anti-Patterns

Avoid:

* Long forms
* Dense settings
* Hidden actions
* Multiple primary buttons
* Technical jargon
* Modal overload
* Excessive scrolling
* Confirmation dialogs for simple actions

---

# Hackathon Demo Optimization

During the demo, the interface should emphasize:

1. Camera
2. AI reasoning
3. Recommendation
4. Map
5. Persona switching

These elements should be immediately visible without unnecessary navigation.

---

# UX Success Checklist

The experience is successful when:

* Users understand the purpose within 30 seconds.
* The camera workflow feels natural.
* AI responses are easy to understand.
* Recommendations feel personalized.
* The interface remains uncluttered.
* Every action has immediate visual feedback.
* The product feels like a polished consumer application rather than a prototype.

---

# Guiding Principle

CityMind should not feel like an AI chatbot with a map attached.

It should feel like an intelligent urban companion that understands the world around the user and quietly guides them toward the best decision with minimal effort and maximum clarity.
