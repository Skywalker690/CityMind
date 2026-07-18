# API Specification

**Project:** CityMind

**Version:** 1.0

**Status:** API Contract

---

# Purpose

This document defines the complete API contract for the CityMind MVP.

Every frontend request, backend endpoint, AI interaction, request schema, response schema, validation rule, and error response is defined here.

This document acts as the implementation contract between the frontend, API layer, and AI orchestration layer.

Any API change must update this document.

---

# API Design Principles

CityMind APIs should be:

* RESTful
* Stateless
* Predictable
* Typed
* Secure
* Versionable
* AI-friendly

Every endpoint must:

* Validate input.
* Return structured output.
* Handle failures gracefully.
* Never expose internal implementation details.

---

# Base URL

Development

```text
/api
```

Future

```text
/api/v1
```

---

# API Architecture

```text
Client

↓

Next.js Route Handler

↓

Validation

↓

Business Service

↓

OpenAI / OSRM

↓

Response Formatter

↓

Client
```

---

# Endpoint Overview

| Endpoint | Method | Purpose                  |
| -------- | ------ | ------------------------ |
| /vision  | POST   | Analyze uploaded image   |
| /reason  | POST   | Generate recommendations |
| /chat    | POST   | Continue conversation    |
| /map     | POST   | Route generation         |
| /persona | POST   | Update reasoning context |
| /health  | GET    | Health check             |

---

# POST /vision

## Purpose

Analyze uploaded image.

---

## Request

Content-Type

multipart/form-data

---

Fields

```json
image
```

Optional

```json
location
```

---

## Processing

* Validate image
* Compress if required
* Send to OpenAI Vision
* Parse structured output

---

## Success Response

```json
{
  "success": true,
  "scene": {},
  "visionSummary": {},
  "confidence": 0.94
}
```

---

## Error Response

```json
{
  "success": false,
  "message": "Unable to analyze image."
}
```

---

# POST /reason

## Purpose

Generate AI recommendations.

---

## Request

```json
{
  "scene": {},
  "persona": {},
  "userPrompt": "",
  "location": {}
}
```

---

## Processing

* Build reasoning context
* Load prompt
* Execute reasoning
* Parse structured response

---

## Success Response

```json
{
  "recommendations": [],
  "reasoning": "",
  "warnings": [],
  "nearbyPlaces": []
}
```

---

# POST /chat

## Purpose

Continue AI conversation.

---

## Request

```json
{
  "conversation": [],
  "latestMessage": "",
  "persona": {}
}
```

---

## Processing

Maintain conversational context.

Generate follow-up answer.

---

## Response

```json
{
  "message": "",
  "reasoning": ""
}
```

---

# POST /map

## Purpose

Generate optimized route.

---

## Request

```json
{
  "origin": {},
  "destination": {},
  "destinationQuery": "optional text destination",
  "persona": "tourist"
}
```

---

## Processing

Resolve explicit destination coordinates when supplied.

Call OSRM when route coordinates are available.

Normalize every route into the shared route contract with:

* walking travel mode
* source (`osrm` or `fallback`)
* routed or estimated status
* accessibility verification metadata
* GeoJSON LineString geometry
* user-facing warnings

Return route metadata.

---

## Response

```json
{
  "route": {},
  "distance": "",
  "duration": ""
}
```

---

# POST /persona

## Purpose

Update active persona.

---

## Request

```json
{
  "persona": "tourist"
}
```

---

## Response

```json
{
  "success": true
}
```

---

# GET /health

Purpose

Simple health endpoint.

---

Response

```json
{
  "status": "healthy"
}
```

---

# Validation Rules

Every endpoint validates:

* Required fields
* Image size
* Empty prompts
* Unsupported personas
* Invalid coordinates

Use Zod for validation.

---

# Error Codes

| Status | Meaning                |
| ------ | ---------------------- |
| 200    | Success                |
| 400    | Validation error       |
| 401    | Unauthorized (future)  |
| 404    | Resource not found     |
| 429    | Rate limit exceeded    |
| 500    | Internal server error  |
| 503    | AI service unavailable |

---

# Standard Error Format

```json
{
  "success": false,
  "error": {
    "code": "",
    "message": "",
    "details": []
  }
}
```

Never return raw stack traces.

---

# Standard Success Format

```json
{
  "success": true,
  "data": {}
}
```

Maintain consistent response envelopes.

The standard success and error envelopes are authoritative for every endpoint.
Endpoint-specific examples describe the shape inside `data`.

---

# MVP Fallback Behavior

If OpenAI, OSRM, or OpenStreetMap tiles are unavailable, API routes may return
deterministic fallback data using the same success envelope and typed schemas.

Fallback responses must:

* Keep `success: true` only when a usable structured response is available.
* Include warnings when data is simulated or unverified.
* Never expose provider errors, stack traces, or credentials.
* Continue using Zod validation before returning data to the client.

---

# AI Request Lifecycle

```text
Frontend

↓

Validation

↓

Vision Service

↓

Context Builder

↓

Prompt Loader

↓

Reasoning Engine

↓

Structured Output

↓

Validation

↓

Frontend
```

---

# Timeouts

Vision

30 seconds

Reasoning

30 seconds

Maps

10 seconds

If exceeded:

Return graceful error.

---

# Security

* Validate all inputs.
* Limit image size.
* Never expose API keys.
* Reject malformed requests.
* Sanitize prompt input where practical.

---

# Future Endpoints

Potential additions:

* /voice
* /weather
* /history
* /favorites
* /memory
* /feedback
* /events
* /alerts

These are outside the MVP.

---

# API Versioning

Future APIs should use:

```text
/api/v1
```

Breaking changes should never modify existing contracts directly.

---

# API Checklist

Every endpoint must satisfy:

* Input validation
* Typed request
* Typed response
* Error handling
* Documentation
* Logging
* Structured output
* No duplicated logic

---

# Guiding Principle

The API layer should be as thin as possible.

Its job is to orchestrate services, validate data, and return predictable responses—not to contain complex business logic.

Business logic belongs in the service layer, and AI reasoning belongs in the AI orchestration layer.
