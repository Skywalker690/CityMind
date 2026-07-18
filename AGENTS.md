# AGENTS.md

# CityMind AI Development Instructions

This file defines the mandatory working rules for any AI coding agent contributing to this repository.

These instructions override assumptions and should be followed throughout the project.

---

# Mission

Your objective is to build **CityMind**, an AI-powered Urban Mobility Assistant that uses:

* Vision AI
* Context Awareness
* Urban Reasoning
* Interactive Maps
* Conversational AI

The primary experience is:

Image

↓

Scene Understanding

↓

User Context

↓

Reasoning

↓

Recommendation

↓

Explanation

↓

Map Visualization

Every implementation decision must improve this experience.

---

# Read Before Coding

Before writing or modifying code, read these files in order:

```
README.md

docs/00_PROJECT_OVERVIEW.md

docs/01_PRODUCT_VISION.md

docs/02_PRODUCT_REQUIREMENTS.md

docs/03_FEATURE_SPECIFICATION.md

docs/06_SYSTEM_ARCHITECTURE.md

docs/07_AI_ARCHITECTURE.md

docs/08_TECH_STACK.md

docs/09_PROJECT_STRUCTURE.md

docs/10_COMPONENT_ARCHITECTURE.md

docs/11_API_SPECIFICATION.md

docs/12_AI_PROMPT_LIBRARY.md

docs/13_DESIGN_SYSTEM.md

docs/14_UI_UX_GUIDELINES.md

docs/15_IMPLEMENTATION_PLAN.md
```

Never implement features before understanding the documentation.

---

# Source of Truth

The documentation is the project's contract.

If documentation and implementation disagree:

Update the implementation.

Do not silently ignore documentation.

Whenever implementation changes:

Update the corresponding documentation in the same task.

Documentation and code must remain synchronized.

---

# Architecture Rules

Respect the documented architecture.

Never:

* Move business logic into UI.
* Duplicate functionality.
* Hardcode prompts.
* Ignore folder boundaries.
* Bypass services.
* Mix responsibilities.

---

# Technology Rules

Always use:

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion
* OpenAI Responses API
* Mapbox
* Zod

Do not introduce additional frameworks unless explicitly requested.

Avoid unnecessary dependencies.

---

# Coding Standards

Code must be:

* Modular
* Typed
* Reusable
* Readable
* Production quality

Avoid:

* Large components
* Duplicate code
* Magic values
* Deep nesting
* Premature optimization

---

# UI Standards

The interface should feel:

* Modern
* Premium
* Minimal
* Accessible
* AI-first

Use the documented Design System.

Animations should communicate state, not decoration.

---

# AI Rules

AI responses should:

* Be contextual
* Be explainable
* Be structured
* Be personalized

Never return raw model output directly to the UI.

Always validate structured AI responses.

---

# Prompt Rules

Prompts belong only inside:

```
prompts/
```

Never embed prompts inside:

* React components
* Route handlers
* Services

Prompt changes should be documented.

---

# Repository Rules

Follow the documented folder structure.

Do not create unnecessary folders.

Do not move files without updating documentation.

---

# State Management

Keep state minimal.

Prefer local state.

Share state only when necessary.

Avoid introducing global state libraries unless justified.

---

# API Rules

Every endpoint must:

* Validate input
* Return typed responses
* Handle failures gracefully
* Never expose secrets
* Use consistent response formats

---

# Error Handling

Every async workflow must support:

* Loading
* Success
* Failure
* Retry

Never leave users without feedback.

---

# Accessibility

All UI must support:

* Keyboard navigation
* Semantic HTML
* Screen readers
* Visible focus states
* WCAG-compliant contrast

Accessibility is mandatory.

---

# Performance

Prefer:

* Server Components
* Lazy loading
* Optimized images
* Small bundles
* Minimal re-renders

Avoid unnecessary API calls.

---

# Documentation Rules

Whenever you modify:

* Features
* APIs
* Architecture
* Prompts
* UI
* Folder structure

Update the corresponding documentation immediately.

Never leave documentation outdated.

---

# Scope Protection

Do not implement features outside the MVP.

Rejected scope includes:

* Authentication
* Payments
* Notifications
* User accounts
* Analytics
* Admin panels
* Saved history
* Social features

Unless explicitly requested.

---

# Working Process

For every task:

1. Understand the requirement.
2. Read the relevant documentation.
3. Inspect existing code.
4. Design the solution.
5. Implement.
6. Review your own work.
7. Update documentation if required.
8. Verify the build.

---

# Self-Review Checklist

Before completing any task, verify:

* Documentation followed
* No duplicated logic
* Types are correct
* Responsive design maintained
* Accessibility preserved
* Error states handled
* Loading states implemented
* Components reusable
* Architecture respected

---

# Decision Making

When multiple implementations are possible:

Choose the solution that is:

* Simpler
* More maintainable
* Easier to understand
* More reusable
* More consistent with existing architecture

Do not optimize for cleverness.

Optimize for maintainability.

---

# Communication Style

When responding during implementation:

* Explain your plan briefly.
* State assumptions explicitly.
* Highlight risks.
* Summarize completed work.
* Suggest the next logical task.

Do not make undocumented assumptions.

---

# Guiding Principle

CityMind is not a chatbot.

It is an AI-powered Urban Reasoning Platform.

Every line of code should strengthen the core experience:

**Vision → Context → Reasoning → Recommendation → Explanation**

If a proposed implementation does not improve that workflow, reconsider it before proceeding.
