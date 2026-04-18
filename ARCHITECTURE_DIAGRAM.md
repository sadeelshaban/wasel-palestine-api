# Wasel Palestine - System Architecture

This document describes the architecture of the Wasel Palestine backend as implemented in this repository. It is written to align with the course project specification for a backend-centric smart mobility platform: versioned REST APIs, relational persistence, JWT security, Docker-based deployment support, external integrations, and performance evaluation.

The **authoritative operation-level contract** is the OpenAPI document produced by the running service (`GET /openapi.json`). This file explains structure, responsibilities, and data concepts without replacing per-endpoint documentation in API Dog.

## 1. System overview

Wasel Palestine is an API-centric system. Clients integrate through HTTP JSON endpoints. The service persists operational data in PostgreSQL and enforces access control using JWT bearer authentication for protected routes.

High-level logical view:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Clients (mobile apps, dashboards, integrations)                                 │
└──────────────────────────────────────────────────────────────────────────────┘
                 │
                 │ HTTPS / JSON
                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ Wasel Palestine API (NestJS)                                                  │
│ Global prefix: /api/v1 (application endpoints)                               │
│ Public probes/docs: /health, /api-docs, /openapi.json                        │
│ Optional demo utility: /gui (HTML operator console, not a coursework UI)       │
└──────────────────────────────────────────────────────────────────────────────┘
                 │
                 │ Prisma ORM
                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│ PostgreSQL                                                                    │
│ Relational schema + migrations (prisma/migrations)                            │
└──────────────────────────────────────────────────────────────────────────────┘

External data providers are integrated through dedicated service modules. Those
integrations are treated as unreliable dependencies: failures should degrade
gracefully and must not destabilize core persistence workflows.
```

## 2. Technology stack

- **Application**: NestJS + TypeScript
- **Persistence**: PostgreSQL
- **ORM and migrations**: Prisma (`prisma/schema.prisma`, `prisma/migrations`)
- **Authentication**: JWT access tokens and refresh token storage/hashing (Auth module)
- **API documentation**: Swagger UI + OpenAPI export (`/api-docs`, `/openapi.json`)
- **Containerization**: Docker Compose for local PostgreSQL (`docker-compose.yml`)
- **Performance testing**: k6 scripts (`performance/`)

## 3. Modular application architecture (NestJS)

The codebase is organized into NestJS modules that map to domain areas. Routes are exposed under `/api/v1` unless explicitly excluded (for example `GET /health`).

Domain modules (conceptual grouping):

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ NestJS application modules                                                    │
├──────────────────────────────────────────────────────────────────────────────┤
│ Authentication (/api/v1/auth/...)                                             │
│ - Registration, login, refresh rotation, logout                               │
│ - Password change and reset flows (environment-dependent email behavior)      │
├──────────────────────────────────────────────────────────────────────────────┤
│ Users (/api/v1/users/...)                                                     │
│ - Profile operations for authenticated users                                  │
│ - Administrative user management for privileged roles                         │
├──────────────────────────────────────────────────────────────────────────────┤
│ Admin (/api/v1/admin/...)                                                     │
│ - Audit log access for accountability                                         │
├──────────────────────────────────────────────────────────────────────────────┤
│ Checkpoints (/api/v1/checkpoints/...)                                         │
│ - Registry and lifecycle operations                                           │
│ - Status history for traceability                                             │
├──────────────────────────────────────────────────────────────────────────────┤
│ Incidents (/api/v1/incidents/...)                                             │
│ - Incident reporting and moderation-style state transitions where applicable  │
├──────────────────────────────────────────────────────────────────────────────┤
│ Reports (/api/v1/reports/...)                                                 │
│ - Crowdsourced reporting, moderation, voting/flagging mechanics               │
├──────────────────────────────────────────────────────────────────────────────┤
│ Alerts (/api/v1/alerts/...)                                                   │
│ - Subscriptions and user alert feeds                                          │
├──────────────────────────────────────────────────────────────────────────────┤
│ Route estimation (/api/v1/routes/...)                                         │
│ - Heuristic/integrated route estimation entry points                          │
├──────────────────────────────────────────────────────────────────────────────┤
│ External (/api/v1/external/...)                                               │
│ - Weather and routing preview helpers backed by external providers            │
├──────────────────────────────────────────────────────────────────────────────┤
│ Health (GET /health)                                                          │
│ - Process and dependency readiness reporting                                  │
└──────────────────────────────────────────────────────────────────────────────┘
```

Implementation note: the exact method list and schemas evolve with the codebase; use Swagger/OpenAPI as the precise contract.

## 4. Security architecture (JWT)

Authentication follows a standard JWT pattern:

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Authentication flow (conceptual)                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 1) Registration                                                                │
│    - Client submits credentials to POST /api/v1/auth/register                 │
│    - Password is stored using a slow password hash (bcrypt)                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ 2) Login                                                                       │
│    - Client submits credentials to POST /api/v1/auth/login                    │
│    - Server returns access token + refresh token (rotation policy applies)    │
├──────────────────────────────────────────────────────────────────────────────┤
│ 3) Authenticated requests                                                      │
│    - Client sends Authorization: Bearer <access_token>                      │
│    - Server validates JWT signature and expiry                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ 4) Refresh                                                                     │
│    - Client submits refresh token to POST /api/v1/auth/refresh                │
│    - Server validates refresh token and issues a new access token             │
│    - Refresh token rotation may invalidate prior refresh tokens               │
├──────────────────────────────────────────────────────────────────────────────┤
│ 5) Logout                                                                      │
│    - Client revokes a refresh token via POST /api/v1/auth/logout              │
└──────────────────────────────────────────────────────────────────────────────┘
```

Authorization is role-aware (`USER`, `MODERATOR`, `ADMIN` in the Prisma schema). Administrative routes must enforce elevated privileges at the controller/guard level.

**Incidents (course security alignment):** `GET /api/v1/incidents` and `GET /api/v1/incidents/:id` are **public** (read intelligence). `POST`, `PUT`, `PATCH` (verify/close), and `DELETE` on incidents require **JWT** and role **`MODERATOR` or `ADMIN`** (`AuthGuard('jwt')` + `RolesGuard` + `@Roles`).

**Checkpoints:** `GET` list, `GET :id`, and `GET :id/history` are **public**. `POST`, `PUT`, `DELETE`, and `POST :id/status` require **`MODERATOR` or `ADMIN`** with JWT.

## 5. Data architecture (ERD-oriented summary)

Course ERD deliverable (visual + machine-readable):

- **`docs/ERD.png`** — diagram image for hand-ins and slides  
- **`docs/ERD.mmd`** — Mermaid source; regenerate with:  
  `npx -y @mermaid-js/mermaid-cli -i docs/ERD.mmd -o docs/ERD.png -b white`

The Prisma schema is the source of truth for tables and relationships. The following is a concise entity summary aligned to `prisma/schema.prisma`:

```
User
- Identity and profile fields
- Role and blocked flag
- Relations: refresh tokens, password reset tokens, reports, votes, flags,
  subscriptions, alerts

Checkpoint
- Name and coordinates
- Status with history table for auditing transitions
- Relation: incidents may reference a checkpoint when relevant

CheckpointStatusHistory
- Append-only history of checkpoint status changes

Incident
- Type, severity, status, description, coordinates
- Optional checkpoint linkage
- Relation: alerts may be generated in response to incident lifecycle events

Report
- Crowdsourced report with category, description, coordinates
- Moderation status and a credibility score field used by community mechanics
- Relations: votes and flags

Vote / Flag
- Per-user report voting and abuse reporting constructs

Subscription
- Geographic subscription parameters for alert targeting

Alert
- User-visible alert records tied to incidents (uniqueness enforced per user/incident)

AuditLog
- Administrative audit trail entries with JSON metadata for extensibility

RefreshToken / PasswordResetToken
- Hashed token storage supporting rotation and password reset workflows
```

Indexes are defined in Prisma where needed for listing patterns (for example report status, geography-related lookups, and feed ordering).

## 6. External integrations

The coursework requires at least two external-style integrations (routing/geolocation and contextual data such as weather), with defensive handling for authentication, rate limits, timeouts, and caching.

Implementation details in `ExternalService`:

- **Routing**: OSRM-compatible `GET /route/v1/driving/...` against `OSRM_BASE_URL` (default public OSRM demo). Responses drive distance and duration when available; failures fall back to a local haversine estimate so core flows stay available.
- **Weather**: if `OPENWEATHER_API_KEY` is set, **OpenWeatherMap** is used (authenticated). Otherwise **Open-Meteo** is used (public, keyless). Failures fall back to a simple static profile.
- **Timeouts**: outbound requests use `EXTERNAL_HTTP_TIMEOUT_MS` (default 10 seconds).
- **Caching**: in-memory TTL caches keyed by rounded coordinates (`WEATHER_CACHE_TTL_SEC`, `ROUTE_CACHE_TTL_SEC`).
- **Rate limiting**: an in-process sliding window caps outbound external calls per minute (`EXTERNAL_OUTBOUND_RPM`) to avoid hammering public endpoints; when the cap is hit, the service uses the same fallbacks as on HTTP errors.

## 7. Deployment architecture (local-first)

Typical local engineering topology:

```
Developer laptop
  - Node.js runs the NestJS process
  - Docker Compose runs PostgreSQL (and optionally the API container)

Docker Compose (this repository)
  - `db`: PostgreSQL 16
  - `api`: image built from `Dockerfile`, runs `prisma migrate deploy` then the Nest app

Production-like deployment (pattern)
  - Container image for the API (`Dockerfile`)
  - Managed or containerized PostgreSQL
  - Environment variables for secrets and provider keys
```

## 8. Performance and reliability testing

The coursework requires k6-based evaluation. This repository includes k6 scripts under `performance/`: `read-heavy.js`, `write-heavy.js`, `mixed.js`, `spike.js`, and `soak.js`. Use optional `BASE_URL` and `SOAK_DURATION` environment variables when running k6. Capture results in `performance/PERFORMANCE_REPORT.md`.

Reporting should include:

- Average response time and tail latency (p95)
- Throughput and error rate
- Observed bottlenecks and mitigations

## 9. Documentation and API Dog workflow

API Dog deliverables should be generated from the running service OpenAPI export:

- Import `GET /openapi.json` into API Dog
- Maintain environment configurations (base URL, auth tokens)
- Keep request/response examples aligned with actual validation rules
- Export the collection and environment JSON into `delivery/api-dog/` for hand-in (see `delivery/api-dog/INSTRUCTIONS.txt`)

## 10. Collaboration model (engineering ownership)

The project is intentionally split into cohesive backend workstreams that match the coursework feature areas:

- Platform foundations: authentication, user administration, auditability, API documentation plumbing
- Core mobility domain: checkpoints, incidents, querying and pagination
- Community reporting: reports, credibility signals, moderation workflows
- Integrations and route intelligence: external providers, route estimation, performance testing

This section is organizational; exact contributor mapping is maintained via version control history and pull requests.
