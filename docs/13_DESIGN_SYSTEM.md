# Design System

**Project:** CityMind

**Version:** 1.2

**Status:** Skeuomorphic Accessibility-First Design Specification

---

# Purpose

This document defines the visual language for CityMind: its staged workspace,
color tokens, surfaces, typography, spacing, interactive states, and motion.
Every screen and component must feel like part of one calm urban-assistance
product rather than a collection of disconnected dashboard cards.

---

# Design Direction

CityMind should feel:

- Intelligent
- Calm
- Premium
- Minimal
- Tactile
- Trustworthy

The UI uses **restrained skeuomorphism** inspired by soft, physical controls:
cool-toned canvas surfaces, gently raised panels, inset review areas, and
controls that visibly press when activated. This is a visual and interaction
language, not a decorative style exercise. It should orient a user through one
decision at a time.

Skeuomorphic effects must never reduce legibility, hide an affordance, or be
the only signal for a state. Text labels, icons where useful, semantic color,
visible focus, and native control behavior remain mandatory.

---

# Experience Structure

The desktop shell contains a tactile step rail beside one active, raised
workspace. The active workspace presents exactly one of these stages:

```text
01 Capture -> 02 Confirm -> 03 Ask -> 04 Act
```

The stage number, label, descriptive copy, completed icon, disabled state, and
header status all reinforce progression. The user should not see a dense
three-column dashboard containing a camera, form, map, and chat at once.

On smaller viewports, the rail appears before the active workspace. Stages
continue to use the same hierarchy; the design must not turn mobile into a
long page of simultaneous panels.

---

# Color System

Colors are semantic tokens rather than component-local values. The current
light theme is a quiet blue-slate canvas with a high-contrast ink color:

| Token role        | Light intent             | Dark intent                  | Use                                                    |
| ----------------- | ------------------------ | ---------------------------- | ------------------------------------------------------ |
| Background        | Blue-gray canvas         | Deep blue-slate canvas       | Page and inset background.                             |
| Card              | Lifted pale blue surface | Lifted charcoal-blue surface | Workspace and raised panels.                           |
| Foreground        | Deep navy ink            | Near-white ink               | Primary text and icons.                                |
| Primary           | Clear CityMind blue      | Lighter CityMind blue        | Primary action, active state, focus-adjacent emphasis. |
| Secondary / muted | Soft slate               | Deep muted slate             | Subtle supporting surfaces and metadata.               |
| Accent            | Emerald                  | Brighter emerald             | Confirmed or success states only.                      |
| Warning           | Amber                    | Amber                        | Verification and uncertainty.                          |
| Destructive       | Red                      | Red                          | Error and irreversible-risk states.                    |

The token system includes background, foreground, card, popover, primary,
secondary, muted, accent, destructive, border, input, ring, and shared
skeuomorphic-shadow values. Components must consume those tokens so light and
dark mode retain the same hierarchy.

Blue distinguishes CityMind actions; it never proves a route is accessible.
Emerald indicates a completed or positive state, not a guarantee about urban
infrastructure. Amber communicates uncertainty, estimation, or a required
verification step.

---

# Surface Language

## Raised Surfaces

Use raised surfaces for the app workspace, step rail, stage cards, and primary
interactive controls. They use a subtle light-to-card gradient, a fine border,
and paired soft shadows that imply elevation from the surrounding canvas.

Examples:

- The workflow rail.
- The active stage workspace.
- A recommendation, question, or persona panel.
- Primary buttons and control groups.

## Inset Surfaces

Use inset surfaces for review, status, photo framing, location state, and
secondary information that should feel contained rather than elevated. They use
inner shadows and a quieter background.

Examples:

- Selected-scene image frame.
- Step-rail context note.
- Location status.
- Input wells and progress areas.

## Pressed Surfaces

Interactive controls may move by a very small distance and exchange raised
shadow for inset shadow while pressed. This supports tactile feedback but must
not replace the standard active, selected, disabled, or focus states.

Avoid heavy shadows, high-contrast bevels, glass glare, ornamental texture, or
photorealistic objects. The result should be soft and modern, not nostalgic or
visually noisy.

---

# Typography

Use Geist as the primary typeface with Inter and the system sans-serif stack as
fallbacks.

| Level           | Role                                    | Guidance                                            |
| --------------- | --------------------------------------- | --------------------------------------------------- |
| Stage heading   | Orient the current decision             | Large, semibold, high contrast.                     |
| Section heading | Group one active-stage area             | Semibold and concise.                               |
| Body            | Explain a recommendation or next action | Comfortable line height and restrained width.       |
| Label           | Name an input or control                | Medium weight; never supplied by placeholder alone. |
| Metadata        | Status, source, route detail            | Smaller but still contrast-compliant.               |

Uppercase tracked labels are reserved for compact stage eyebrows and must
remain readable at their displayed size. Do not use light gray text for
essential instructions.

---

# Spacing, Radius, and Layout

Use a 4-point spacing rhythm, favoring:

```text
4, 8, 12, 16, 20, 24, 32, 40, 48, 64
```

The workflow shell uses generous whitespace so each stage feels like a focused
moment. Nested surfaces should have a clear spacing relationship and should not
create a stack of equally heavy cards.

Use generous but purposeful radii:

- Workspace and rail: approximately 30-34 px.
- Stage panels and image frames: approximately 24-30 px.
- Controls and step rows: approximately 16-22 px.
- Status chips: fully rounded where the compact shape improves scanning.

Desktop uses a narrow sticky rail beside a flexible workspace. Tablet and
mobile stack the layout in reading order and preserve a safe bottom margin for
touch interaction.

---

# Workflow Components

## Step Rail

The step rail is a raised surface with four numbered controls. Each row must
show:

- Number or completion icon.
- Stage label and short description.
- Current state via text position and `aria-current`.
- Disabled state for unavailable future stages.

An active row is visibly raised and carries primary-color emphasis. A completed
row carries a check icon. A disabled row has lower visual prominence but still
remains legible enough to explain the future workflow.

## Capture

Capture uses a focused camera/upload surface. Once an image is selected, it is
shown in a softly inset frame alongside a clear Continue to confirm action.
Replacement remains available. Selecting a photo never visually implies that
analysis has started.

## Confirm

Confirm pairs the selected image with a context surface for persona and
optional location. The Analyze this scene action is the visual culmination of
the step. Analysis progress is an explicit status layer over the preview, not a
decorative shimmer.

## Ask

Ask presents a scene summary next to a raised question surface. The question is
the visual priority; the optional destination is adjacent supporting context.
Suggested prompts are tactile chips with clear button semantics.

## Act

Act presents the recommendation before supporting route context and follow-up
chat. The route panel and chat sit in their own raised surfaces; map failure
does not leave an empty dark rectangle or hide textual route information.

---

# Controls and State

## Buttons

- **Primary:** Blue, raised, and used for the one next action in a stage.
- **Secondary / outline:** Used for replacement, back, and optional actions.
- **Ghost:** Used for compact, low-emphasis controls such as theme change.
- **Disabled:** Clearly inactive in both text and shape; do not imply it can be
  pressed.
- **Pressed:** Small position and shadow change only; no motion if reduced
  motion is enabled.

Every button needs visible label or accessible name. Icon-only buttons require
an explicit accessible label and tooltip-equivalent title where useful.

## Inputs

Inputs and textareas use calm inset wells with a visible border/ring on focus.
Labels remain visible when fields are populated. Placeholders give examples,
not required instructions. Error text is adjacent to the associated field and
announced appropriately.

## Chips and Badges

Chips are compact, raised controls or status indicators. Suggested prompts are
buttons, not decorative tags. Badges use both text and color to communicate
status.

---

# AI, Route, and Map Presentation

AI-generated content should have a clear structure: summary, recommendation,
reason, benefits, confidence/uncertainty, and next action. It must never be
rendered as raw model output.

Leaflet displays origin/destination markers, a walking-route
polyline, route status, distance, duration, and turn summary when the browser
can initialize it. The map exposes standard zoom, map-type, fullscreen, and
Street View controls; an optional map ID enables Advanced Markers and custom
styling. A live route is visually distinct from an estimated fallback route.
Neither style asserts step-free accessibility. Route source, status, and
accessibility verification notes remain readable in text alongside the visual
map.

When Leaflet/OpenStreetMap cannot initialize, use the local visual fallback and retain the
same textual route metrics and instructions. Do not disguise provider failure
with a decorative empty map surface.

---

# Motion

Use Framer Motion for one purpose: orientation.

- Active-stage entry can fade and rise slightly.
- Analysis and status feedback may communicate ongoing work.
- Pressed controls can use a short, subtle transform.
- No perpetual decorative animation, bouncing, or parallax.

The default stage transition is brief and should not make the user wait. The
global reduced-motion preference removes positional animation and smooth scroll
behavior.

---

# Themes

Light and dark modes share the same semantic token names and tactile hierarchy.
The first visit honors the device color preference; a manual toggle is stored
locally in the browser and restored on later visits. It is not user-account
data.

Dark mode uses quieter paired shadows, subtle borders, and sufficient text
contrast. Never copy light-mode white highlights into dark mode at a brightness
that causes glare or makes focus state unclear.

---

# Accessibility Requirements

The soft visual style creates specific accessibility risks, so every component
must satisfy all of the following:

- WCAG AA-aware contrast for text, controls, and focus rings.
- Keyboard operation for the step rail, all forms, map controls, and chat.
- Visible focus that is stronger than a shadow-only cue.
- Semantic headings, forms, buttons, lists, labels, and status text.
- Screen-reader labels for icon-only controls, camera, map, and route state.
- At least comfortably touchable target sizes; do not create tiny ornamental
  controls.
- State communicated through text/icon/position as well as color and depth.
- Reduced-motion support.
- Textual route metrics and instructions when the map canvas is unavailable.

---

# Token and Component Rules

Colors, radii, shadows, typography, spacing, and motion values belong in shared
tokens or reusable primitives. A feature component may choose a documented
surface pattern but must not invent a private visual language.

Every screen review must verify:

- Clear current stage and primary action.
- No simultaneous dashboard overload.
- Calm, restrained tactile depth.
- Strong contrast and focus visibility.
- Responsive reading order.
- Empty, loading, error, and disabled states.
- Honest route and accessibility communication.
- No unnecessary visual noise.

The guiding principle is simple: every pixel should make the next urban
decision easier to understand and act on.
