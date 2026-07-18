# API Specification

**Project:** CityMind

**Version:** 1.2

**Status:** Implemented MVP Contract

---

# Purpose

This document defines the HTTP contract between the CityMind client and its
Next.js route handlers. Route handlers validate requests, call services, and
return typed envelopes. OpenAI, Google Maps Platform, and OSRM details never reach the
browser as raw provider responses.

---

# Common Contract

All successful responses use:

```json
{
  "success": true,
  "data": {}
}
```

All failures use:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request could not be validated.",
    "details": []
  }
}
```

The client must render data only after checking success. Route handlers use Zod
for request validation; service outputs are normalized and validated before
they are returned or rendered.

Base URL in development and production:

```
/api
```

---

# Endpoint Overview

| Endpoint | Method | Purpose                                                                 |
| -------- | ------ | ----------------------------------------------------------------------- |
| /vision  | POST   | Analyze a selected image into a VisionScene.                            |
| /reason  | POST   | Produce persona-aware recommendations and optional route context.       |
| /chat    | POST   | Continue the active, non-persistent conversation.                       |
| /map     | POST   | Resolve a destination and prepare a walking route without AI reasoning. |
| /persona | POST   | Validate and return the selected persona profile.                       |
| /health  | GET    | Report configured provider health at a high level.                      |

---

# Shared Types

## Coordinates

```json
{
  "latitude": 9.9674,
  "longitude": 76.3183
}
```

Latitude must be between -90 and 90; longitude must be between -180 and 180.

## Persona IDs

```
daily-commuter | tourist | elderly | wheelchair | luggage
```

## Destination Input

The client can provide an explicit coordinate target or a text target:

```json
{
  "label": "Fort Kochi ferry",
  "coordinates": {
    "latitude": 9.9652,
    "longitude": 76.2422
  }
}
```

label and coordinates are optional independently, but at least one is required
when a destination object is supplied. destinationQuery is a separate trimmed
string between 2 and 160 characters.

## Destination Resolution

Every route attempt returns a typed resolution object:

```json
{
  "status": "resolved",
  "destination": {
    "label": "Fort Kochi ferry",
    "coordinates": {
      "latitude": 9.9652,
      "longitude": 76.2422
    },
    "source": "google-places",
    "query": "Fort Kochi ferry"
  },
  "query": "Fort Kochi ferry"
}
```

status is one of resolved, missing, unavailable, or not-found. Explicit
coordinates have priority. Otherwise CityMind evaluates destinationQuery, then a
destination label, then a destination phrase safely extracted from the user
prompt. Text is resolved through Google Places API (New) Text Search. If it cannot be resolved,
CityMind returns the status and user-facing message; it never routes to a
guessed coordinate.

## Route Summary

An available route is represented by RouteSummary, not a provider payload. It
includes:

- origin, destination, waypoints, and normalized coordinates;
- GeoJSON LineString route geometry;
- distance, duration, walking mode, and normalized steps;
- source: google, osrm, or fallback;
- status: routed or estimated;
- a separate accessibility object with verified, evidence, and warnings.

accessible is retained for compatibility and is true only when trusted evidence
verifies accessibility. A persona preference, a walking profile, or a
Google Maps Platform/OSRM response alone is not proof of elevators, ramps, curb cuts, surface
conditions, or temporary closures.

---

# POST /vision

## Purpose

Turn a camera capture or upload into a validated VisionScene.

## Request

Content type: multipart/form-data

| Field    | Required | Contract                           |
| -------- | -------- | ---------------------------------- |
| image    | Yes      | An image file no larger than 5 MB. |
| location | No       | JSON-encoded Coordinates.          |

Images must use an image/* MIME type. Vector SVG demo assets are kept in a
deterministic local path rather than sent to live vision; use a camera capture,
JPEG, or PNG for live vision analysis.

## Successful data

```json
{
  "scene": {},
  "visionSummary": {
    "sceneType": "Metro station approach",
    "summary": "...",
    "landmarks": [],
    "accessibility": []
  },
  "confidence": 0.82
}
```

scene contains scene type, summary, landmarks, infrastructure, accessibility
observations, navigation cues, warnings, confidence, and optional location. A
low-confidence or fallback observation is still structured and clearly warns the
user to verify it.

---

# POST /reason

## Purpose

Combine a validated scene, persona, question, optional location, and optional
destination into an explainable recommendation. This is the normal hero-flow
endpoint.

## Request

```json
{
  "scene": {},
  "persona": "luggage",
  "userPrompt": "What is the best route to the ferry?",
  "location": {
    "latitude": 9.9674,
    "longitude": 76.3183
  },
  "destinationQuery": "Fort Kochi ferry",
  "destination": {
    "label": "Fort Kochi ferry"
  }
}
```

scene, persona, and a non-empty userPrompt are required. location,
destinationQuery, and destination are optional. Supplying a destination is
recommended for a route but is not required for a useful recommendation.

## Processing

1. Normalize the vision scene and construct persona-aware reasoning context.
2. Resolve the destination using the shared destination contract.
3. Request Google Routes API Compute Routes for a walking route when a destination resolves.
4. Retry with configured OSRM foot routing if Google Routes cannot provide
   a usable route.
5. Use OpenAI structured reasoning when available; otherwise return the
   deterministic fallback reasoning contract.
6. Merge provider and route warnings without allowing AI output to replace
   trusted route data.

## Successful data

```json
{
  "scene": {},
  "intent": "navigation",
  "reasoning": "...",
  "recommendations": [],
  "destination": {},
  "destinationResolution": {},
  "route": {},
  "nearbyPlaces": [],
  "warnings": [],
  "confidence": 0.78
}
```

route is null when no destination resolves. destinationResolution tells the UI
why, so it can request a more specific place rather than showing a false route.

---

# POST /map

## Purpose

Resolve a destination and prepare route data independently of OpenAI. This
supports clients that need a route update without another reasoning request.

## Request

```json
{
  "origin": {
    "latitude": 9.9674,
    "longitude": 76.3183
  },
  "destinationQuery": "Fort Kochi ferry",
  "persona": "tourist"
}
```

origin and persona are required. At least one of destination or
destinationQuery is required.

## Successful data

```json
{
  "route": {},
  "destination": {},
  "destinationResolution": {},
  "distance": 1240,
  "duration": 1020,
  "warnings": []
}
```

When no route is available, route, destination, distance, and duration are
null; destinationResolution and warnings remain available.

---

# POST /chat

## Purpose

Continue the current browser-session conversation using the active persona,
scene, and recommendation when available. CityMind does not persist chat
history in the MVP.

## Request

```json
{
  "conversation": [],
  "latestMessage": "Can I avoid stairs?",
  "persona": "wheelchair",
  "scene": {},
  "recommendation": {}
}
```

conversation, latestMessage, and persona are required. scene and
recommendation are optional but normally supplied by the active workflow.

## Successful data

```json
{
  "message": "...",
  "reasoning": "...",
  "suggestedQuestions": []
}
```

---

# POST /persona

Validates a persona ID and returns its typed profile:

```json
{
  "persona": "tourist"
}
```

```json
{
  "success": true,
  "data": {
    "persona": {}
  }
}
```

The frontend updates persona locally and reruns the active reasoning context
when a scene and prior question exist; this endpoint remains available for
explicit API clients.

---

# GET /health

Returns a high-level readiness snapshot without exposing credentials:

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "services": {
      "ai": "live",
      "geocoding": "live",
      "routing": "live"
    }
  }
}
```

status may be degraded when CityMind is using fallback capability or lacks a
provider configuration. routing is live with Google Routes, fallback when
only an optional OSRM endpoint is configured, and unavailable when neither is
available.

---

# Provider Failures, Timeouts, and Fallbacks

The API is intentionally useful without every provider configured, but it does
not misrepresent certainty.

| Condition                                                              | API behavior                                                                                                     |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| OpenAI missing, fails, or times out                                    | Return a deterministic typed vision, reasoning, or chat fallback with warnings.                                  |
| Google Places Text Search missing, fails, or finds no confident result | Return destinationResolution as unavailable or not-found; do not manufacture a route.                            |
| Google Routes fails after resolution                                   | Try configured OSRM foot routing.                                                                                |
| OSRM also fails                                                        | Return an explicitly estimated fallback route with source fallback, status estimated, and verification warnings. |
| Browser Google Maps JavaScript API fails                               | The API route remains valid; the client shows text directions and a local visual map fallback.                   |

The shared timeout helper aborts OpenAI vision, reasoning, and chat requests
after 30 seconds. Google Places search, Google Routes, and OSRM routing are aborted after
10 seconds.

---

# Errors and Status Codes

| Status | Meaning                                                              |
| ------ | -------------------------------------------------------------------- |
| 200    | A typed success response, including a usable deterministic fallback. |
| 400    | Zod validation failure or malformed request.                         |
| 503    | The route handler could not produce a typed, recoverable response.   |

Expected provider unavailability normally becomes a documented typed fallback or
resolution status rather than an opaque 5xx response. Error bodies never include
stack traces, raw provider messages, tokens, or uploaded image data.

---

# Security and Privacy

- OpenAI and `GOOGLE_MAPS_SERVER_API_KEY` remain server-only.
- The browser uses only `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` and the optional
  `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID`; restrict the browser key to approved app
  origins in Google Cloud.
- The server may fall back to the public Google Maps key only for local/demo
  compatibility; deployed environments require a dedicated server key.
- Uploaded images are processed in memory and are not persisted by the MVP.
- Prompt and image inputs are treated as untrusted and validated before service
  use where applicable.
- API consumers should not treat route geometry as verified accessibility data.

---

# Verification

Unit tests cover validators, response normalization, destination resolution,
provider-result normalization, and fallback routes. The GitHub Actions quality
workflow runs formatting, linting, typechecking, tests, and a production build
for pull requests and pushes to main.
