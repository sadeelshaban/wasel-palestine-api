# Wasel Palestine API

Backend API for **Wasel Palestine**, a smart mobility and checkpoint intelligence platform developed as a course project for **Advanced Software Engineering - Spring 2026**.

Wasel Palestine provides versioned REST APIs for managing checkpoints, incidents, community reports, route estimation, alerts, and selected external context such as weather and routing data.

The project focuses on backend engineering concerns including API design, persistence, authentication and authorization, external integrations, automated testing, and performance evaluation.

---

## Technology Stack

* **Runtime:** Node.js
* **Framework:** NestJS + TypeScript
* **Database:** PostgreSQL
* **ORM:** Prisma
* **Authentication:** JWT access and refresh tokens
* **API Documentation:** Swagger / OpenAPI
* **Containerization:** Docker + Docker Compose
* **Testing:** Jest
* **Performance Testing:** k6

### Why NestJS?

NestJS was selected because its modular architecture, dependency injection, guards, configuration patterns, and OpenAPI support provide a structured foundation for a maintainable backend application.

---

## Main Features

### Authentication & Authorization

* JWT-based authentication
* Access and refresh token flows
* Role-based authorization
* Protected administrative and moderation operations

### Checkpoints

* Create, update, and delete checkpoints
* Retrieve checkpoint details
* View checkpoint status history
* Manage checkpoint status transitions

### Incidents

* Create and manage incidents
* Public incident listing and details
* Moderation and administrative controls for incident lifecycle operations

### External Integrations

The API integrates with external services for:

* **Routing:** OSRM
* **Weather:** Open-Meteo or OpenWeatherMap

External requests include caching, timeouts, rate limiting, and fallback handling.

### Performance Evaluation

The repository includes k6 scenarios covering:

* Read-heavy workloads
* Write-heavy workloads
* Mixed workloads
* Spike testing
* Soak testing

Performance results are documented in:

`performance/PERFORMANCE_REPORT.md`

---

## API Structure

Application endpoints are versioned under:

```text
/api/v1/...
```

Additional service endpoints include:

```text
GET /health
GET /api-docs
GET /openapi.json
```

Swagger UI is available through `/api-docs`, while `/openapi.json` provides the OpenAPI specification.

Protected endpoints use:

```text
Authorization: Bearer <access_token>
```

---

## Architecture

The application follows a modular NestJS architecture with separate modules for major domain areas such as authentication, checkpoints, incidents, external services, and other API functionality.

Database access is handled through Prisma with PostgreSQL migrations stored under:

```text
prisma/migrations/
```

Architecture documentation is available in:

* `ARCHITECTURE_DIAGRAM.md`
* `docs/ERD.png`
* `docs/ERD.mmd`

---

## Repository Structure

```text
wasel-palestine-api/
├── src/                 # NestJS application
├── prisma/              # Prisma schema, migrations, and seed
├── test/                # Automated tests
├── performance/         # k6 performance scenarios and reports
├── delivery/
│   └── api-dog/         # API documentation / API Dog deliverables
├── docs/                # Architecture and ERD documentation
├── swagger/             # Swagger customization
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## Prerequisites

* Node.js 18+
* PostgreSQL
* Docker Desktop or another Docker-compatible environment
* Git

Optional:

* k6 for performance testing

---

## Local Setup

Clone the repository:

```bash
git clone https://github.com/sadeelshaban/wasel-palestine-api.git
cd wasel-palestine-api
```

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root. Set `DATABASE_URL` for PostgreSQL and `JWT_SECRET` for signing tokens. Optional integration settings such as `OPENWEATHER_API_KEY` and `OSRM_BASE_URL` can be added when you use those services.

Apply database migrations and generate the Prisma client:

```bash
npx prisma migrate dev
npx prisma generate
```

Seed the database if required:

```bash
npm run db:seed
```

Start the development server:

```bash
npm run dev
```

The API runs on:

```text
http://localhost:3000
```

---

## Docker

The project includes Docker Compose configuration for running the API and PostgreSQL together.

```bash
docker compose up --build
```

---

## Testing

Run the automated test suite:

```bash
npm test
```

Run end-to-end tests:

```bash
npm run test:e2e
```

End-to-end tests require a configured PostgreSQL database.

---

## Performance Testing

Performance scenarios are located in:

```text
performance/
```

Available scenarios:

```text
read-heavy.js
write-heavy.js
mixed.js
spike.js
soak.js
```

Run a scenario with k6:

```bash
BASE_URL=http://localhost:3000 k6 run performance/read-heavy.js
```

Performance results and analysis are documented in:

```text
performance/PERFORMANCE_REPORT.md
```

---

## API Documentation

The project exposes an OpenAPI document at:

```text
GET /openapi.json
```

Swagger UI is available at:

```text
GET /api-docs
```

The generated OpenAPI specification can also be imported into **API Dog** for API testing and coursework documentation.

Course-related API Dog deliverables are stored under:

```text
delivery/api-dog/
```

---

## Development Practices

The project follows standard version-control practices:

* Feature branches for development
* Pull requests for merging changes
* Clear and conventional commit messages
* Database migrations tracked through Prisma
* Automated testing for backend functionality

---

## License

See the repository settings for licensing information.
