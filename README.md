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
- **Incident write security:** creating, updating, verifying, closing, or deleting incidents requires **JWT** and role **MODERATOR** or **ADMIN**; listing and reading a single incident remain **public**.
- **Checkpoint write security:** creating, updating, deleting checkpoints and posting status transitions require **JWT** and **MODERATOR** or **ADMIN**; listing, detail, and status history remain **public**.
- **Docker** support for local deployment via `docker-compose.yml`.
- **External integrations** via `ExternalModule`: real HTTP calls to **OSRM** (routing) and **Open-Meteo** or **OpenWeatherMap** (weather), with in-memory caching, outbound rate limiting, timeouts, and fallbacks when providers fail or limits are hit (see `.env.example`).
- **Performance evaluation** using **k6** scripts under `performance/` (`read-heavy`, `write-heavy`, `mixed`, `spike`, `soak`; run separately; k6 is not a Node dependency). Record outcomes in `performance/PERFORMANCE_REPORT.md`.

Primary API documentation for coursework deliverables should be maintained in **API Dog** using the exported OpenAPI document from a running service.

## Architecture documentation

For a structured architecture narrative, diagrams, and ERD-oriented notes, see:

- `ARCHITECTURE_DIAGRAM.md`
- **`docs/ERD.png`** — ERD figure for coursework (see also `docs/ERD.mmd` for Mermaid source)

## Technology stack

- **Runtime**: Node.js
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT access tokens and refresh token rotation (implementation details in Auth module)
- **HTTP documentation**: Swagger UI + OpenAPI JSON served by the application
- **Containerization**: `docker-compose.yml` runs **PostgreSQL** and an **`api`** service built from `Dockerfile` (migrations on startup, then NestJS)

## Repository layout (practical)

- `src/` NestJS application code (modules, controllers, services)
- `prisma/` Prisma schema, migrations, seed script
- `performance/` k6 load test scripts and performance report template
- `delivery/api-dog/` place exported API Dog collection and environments for coursework hand-in
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

## Run database and API with Docker Compose

This runs PostgreSQL and the API container (migrations run automatically before the server starts).

```bash
docker compose up --build
```

### JWT secret and `.env` with Docker

Docker Compose reads the **project-root** `.env` file (create it from `.env.example` if you do not have one yet). The `api` service receives `JWT_SECRET` from that file: see `JWT_SECRET: ${JWT_SECRET:-...}` in `docker-compose.yml`. Without a real secret, Compose falls back to a **development-only** placeholder; for coursework demos, shared machines, or anything beyond a throwaway local run, **set `JWT_SECRET` yourself** so tokens are not predictable.

1. Copy `.env.example` to `.env` in the repository root (same folder as `docker-compose.yml`).
2. Set `JWT_SECRET` to a long random string (at least 32 bytes of entropy is a reasonable target). Example using Node (works on Windows, macOS, and Linux):

   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

   Paste the output into `.env` as the value of `JWT_SECRET` (keep quotes if your value contains characters that need them).

3. Leave **`DATABASE_URL` in `.env` for local Node** pointing at `localhost` if you use `npm run dev` against the Compose database. The **`api` container ignores that URL for DB access**: Compose injects an internal URL that reaches the `db` service (`postgresql://postgres:1234@db:5432/...`).

4. Run `docker compose up --build` again after changing `.env` so the API container picks up the new secret.

Never commit `.env`; only `.env.example` belongs in Git.

The API listens on **`http://localhost:3000`** by default. If you see `bind: ... 3000 ... already permitted`, something else is using port 3000 (often a local `npm run dev`). Either stop that process or set **`DOCKER_API_PORT=3001`** in `.env` and open **`http://localhost:3001`** instead (see `.env.example`).

Optional: add `OPENWEATHER_API_KEY` to your `.env` so weather data uses OpenWeatherMap instead of Open-Meteo.

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

Requires **`DATABASE_URL`** (same DB as local dev). For **RBAC admin assertions**, run **`npm run db:seed`** once so `admin@wasel.local` exists (or set `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD` to match your `.env`). If the DB is missing, the RBAC suite is **skipped** automatically.

Performance tests (k6):

- See scripts in `performance/` (`read-heavy.js`, `write-heavy.js`, `mixed.js`, `spike.js`, `soak.js`)
- Run k6 using your platform installation; the scripts are not executed by `npm test` automatically.
- Optional: `BASE_URL=http://localhost:3000 k6 run performance/soak.js` (defaults to `http://localhost:3000` if unset)
- **Write-heavy script** logs in as the seeded admin (`ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars override defaults) so `POST /api/v1/incidents` succeeds after RBAC.
- **Without installing k6:** use Docker, for example:  
  `docker run --rm -v "%CD%:/work" -w /work -e BASE_URL=http://host.docker.internal:3000 grafana/k6 run --summary-export=/work/performance/k6-summary-read-heavy.json --vus 5 --duration 10s /work/performance/read-heavy.js`  
  (on Unix shells use `"$PWD"` instead of `%CD%`; add `--add-host=host.docker.internal:host-gateway` on Linux if needed.)
- Example metrics and JSON exports are committed under `performance/` (`PERFORMANCE_REPORT.md`, `k6-summary-*.json`). Re-run after changes to refresh numbers.

## OpenAPI export (API Dog hand-in)

With PostgreSQL available (`DATABASE_URL` set, migrations applied):

```bash
npm run export:openapi
```

If the API is already running and you only need the document from `GET /openapi.json`:

```bash
npm run export:openapi:http
```

Outputs go to `delivery/api-dog/openapi.json` (see `delivery/api-dog/INSTRUCTIONS.txt`).

## API Dog (one-time checklist before submission)

The repository already ships **`delivery/api-dog/openapi.json`** (refresh with `npm run export:openapi` or `npm run export:openapi:http` when the API changes). For coursework, do this **once** in API Dog so documentation matches what graders see:

1. Start the API (`npm run dev` or `docker compose up --build`) and confirm **`DATABASE_URL`** and **`JWT_SECRET`** are set in `.env` so login works.
2. In **API Dog**: **Import → OpenAPI** → choose `delivery/api-dog/openapi.json`, or import from **`http://localhost:3000/openapi.json`** (use the correct host port if you set `DOCKER_API_PORT` or `PORT`).
3. Open the imported spec and confirm **endpoints are grouped sensibly** (NestJS tags from controllers should appear as sections in the tool).
4. Import **`delivery/api-dog/environment.local.json`** (or recreate the same variables), then call **`POST /api/v1/auth/login`** and set the returned access token on secured requests (Bearer).
5. If the instructor expects a **native API Dog export** (not only OpenAPI), use **Export** inside API Dog for the **collection** and **environment**, and save the files under `delivery/api-dog/` using the names your brief requires (for example `wasel-palestine-api-dog-collection.json` plus a matching environment export). Keep **`openapi.json`** updated for reviewers who prefer the raw spec.

Step-by-step notes for the folder live in **`delivery/api-dog/INSTRUCTIONS.txt`**.

## Version control expectations

The coursework requires traceable engineering practice:

- Work on feature branches
- Merge via pull requests into `main`
- Use clear, conventional commit messages

## Security notes (operational)

- Never commit real `.env` secrets.
- Treat JWT secrets as sensitive configuration.
- For shared demo environments, disable or rotate default seeded credentials.
- **`npm audit`:** run `npm audit` / `npm audit fix` before releases. This repo uses an **`overrides`** entry for `@hono/node-server` so `npm audit` reports **0 vulnerabilities** while staying on **Prisma 7**.
- The optional **`/gui`** page sends **Content-Security-Policy** and related headers to reduce common browser risks (inline script is still allowed because the console is a single embedded page).

## License

See repository settings for license terms (if applicable).
