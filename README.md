# Wasel Palestine API

Course project (Advanced Software Engineering, Spring 2026)  
Instructor: Dr. Amjad AbuHassan

Wasel Palestine is a backend-first smart mobility and checkpoint intelligence platform. It exposes versioned REST APIs that clients (mobile apps, dashboards, or integrations) can consume to work with checkpoints, incidents, community reports, route estimation, alerts, and curated external context (for example weather and routing helpers).

This repository implements the **backend** for that platform. The official coursework scope emphasizes API design, persistence, security, integrations, testing, and performance analysis. Any lightweight HTML operator console shipped in this repo is a **non-required convenience** for demonstrations and manual operations; it is not a substitute for the primary API documentation and testing workflow.

## Why NestJS (technology justification)

NestJS is used as the implementation framework because it aligns well with the non-functional goals stated in the coursework documentation:

- **Maintainability and structure**: module boundaries, dependency injection, and conventions reduce accidental coupling as the API surface grows.
- **Security ergonomics**: middleware/guards patterns map cleanly to authentication, authorization, and audit-friendly request handling.
- **Operational readiness**: structured logging hooks, configuration patterns, and first-class OpenAPI support help keep documentation close to the running system.
- **Team scalability**: clear module ownership boundaries match a multi-contributor backend where features evolve in parallel.

## Course requirements mapping (high level)

This project is designed to satisfy the backend requirements described in the course specification, including:

- **Relational database** using PostgreSQL, accessed through **Prisma** (ORM) and backed by migrations under `prisma/migrations`.
- **Versioned APIs** under `/api/v1/...` for application endpoints.
- **JWT authentication** with access and refresh token flows (see Authentication module).
- **Docker** support for local deployment via `docker-compose.yml`.
- **External integrations** implemented as dedicated modules with defensive handling (timeouts and pragmatic error behavior; see External module).
- **Performance evaluation** using **k6** scripts under `performance/` (run separately; k6 is not a Node dependency).

Primary API documentation for coursework deliverables should be maintained in **API Dog** using the exported OpenAPI document from a running service.

## Architecture documentation

For a structured architecture narrative, diagrams, and ERD-oriented notes, see:

- `ARCHITECTURE_DIAGRAM.md`

## Technology stack

- **Runtime**: Node.js
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT access tokens and refresh token rotation (implementation details in Auth module)
- **HTTP documentation**: Swagger UI + OpenAPI JSON served by the application
- **Containerization**: Docker Compose for PostgreSQL (and optional app containerization depending on your deployment approach)

## Repository layout (practical)

- `src/` NestJS application code (modules, controllers, services)
- `prisma/` Prisma schema, migrations, seed script
- `performance/` k6 load test scripts
- `swagger/` Swagger UI theme overrides
- `test/` automated tests (Jest)

## Prerequisites

- Node.js 18 or newer
- Docker Desktop (or compatible Docker engine) and Docker Compose
- Git

Optional:

- k6 (for running performance scenarios locally)

## Local development setup

Clone the repository, install dependencies, configure environment variables, start PostgreSQL, apply migrations, generate the Prisma client, seed baseline data (if used in your environment), then start the API.

```bash
git clone https://github.com/sadeelshaban/wasel-palestine-api.git
cd wasel-palestine-api

npm install

copy .env.example .env
# Edit .env to match your local PostgreSQL connection settings.

docker compose up -d

npx prisma migrate dev
npx prisma generate

npm run db:seed

npm run dev
```

Notes:

- Use `cp` instead of `copy` on Unix-like shells.
- The exact migration name is not important for local development; `prisma migrate dev` will apply pending migrations.

## Default administrator account (seed)

If your database is seeded using the provided seed workflow, a default administrator may exist. Treat this as a **development default** and rotate credentials for any shared or public environment.

- Email: `admin@wasel.local`
- Password: `ChangeMeAdmin123!`

## Running the service

Development:

```bash
npm run dev
```

Production-style entrypoint (as configured in this repo):

```bash
npm run start:prod
```

Default port: `3000` (override with `PORT` in `.env`).

## API surface and documentation

Application endpoints are served under:

- `/api/v1/...`

Operational and documentation endpoints (not under `/api/v1`):

- `GET /health` health probe
- `GET /api-docs` Swagger UI
- `GET /openapi.json` OpenAPI document (recommended import source for API Dog)
- `GET /gui` optional operator console (demo utility)

Authenticate protected operations using:

`Authorization: Bearer <access_token>`

## Testing

Unit and integration tests (Jest):

```bash
npm test
```

End-to-end tests (if you run them in your environment):

```bash
npm run test:e2e
```

Performance tests (k6):

- See scripts in `performance/`
- Run k6 using your platform installation; the scripts are not executed by `npm test` automatically.

## Version control expectations

The coursework requires traceable engineering practice:

- Work on feature branches
- Merge via pull requests into `main`
- Use clear, conventional commit messages

## Security notes (operational)

- Never commit real `.env` secrets.
- Treat JWT secrets as sensitive configuration.
- For shared demo environments, disable or rotate default seeded credentials.

## License

See repository settings for license terms (if applicable).
