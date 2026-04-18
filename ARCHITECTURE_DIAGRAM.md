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

## 5. Data architecture (ERD-oriented summary)

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

External providers are integrated to satisfy the coursework requirement for at least two external API categories (routing/geolocation context and contextual data such as weather). In this codebase, external access is isolated behind `ExternalModule` services so that:

- HTTP failures can be handled without corrupting local transactional workflows
- timeouts and provider-specific constraints can be centralized
- future caching or circuit breaking can be added without rewriting controllers

## 7. Deployment architecture (local-first)

Typical local engineering topology:

```
Developer laptop
  - Node.js runs the NestJS process
  - Docker Compose runs PostgreSQL

Production-like deployment (pattern)
  - Container image for the API (deployment-specific)
  - Managed or containerized PostgreSQL
  - Environment variables for secrets and provider keys
```

## 8. Performance and reliability testing

The coursework requires k6-based evaluation. This repository includes k6 scripts under `performance/` to exercise read-heavy, write-heavy, mixed, spike, and soak-style scenarios as appropriate to your test plan.

Reporting should include:

- Average response time and tail latency (p95)
- Throughput and error rate
- Observed bottlenecks and mitigations

## 9. Documentation and API Dog workflow

API Dog deliverables should be generated from the running service OpenAPI export:

- Import `GET /openapi.json` into API Dog
- Maintain environment configurations (base URL, auth tokens)
- Keep request/response examples aligned with actual validation rules

## 10. Collaboration model (engineering ownership)

The project is intentionally split into cohesive backend workstreams that match the coursework feature areas:

- Platform foundations: authentication, user administration, auditability, API documentation plumbing
- Core mobility domain: checkpoints, incidents, querying and pagination
- Community reporting: reports, credibility signals, moderation workflows
- Integrations and route intelligence: external providers, route estimation, performance testing

This section is organizational; exact contributor mapping is maintained via version control history and pull requests.
