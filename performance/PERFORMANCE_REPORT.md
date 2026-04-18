# Performance and load testing report (k6)

## Run metadata

| Field | Value |
|--------|--------|
| Date | 2026-04-18 |
| API base URL | `http://host.docker.internal:3000` (k6 in Docker → Nest on host port 3000) |
| Database | PostgreSQL 16 via `docker compose` (`wasel_palestine`) |
| k6 | `grafana/k6:latest` (Docker); summaries exported as JSON alongside this file |
| Nest | `node scripts/run-prod.cjs` (compiled app) |

Raw machine-readable summaries (for reproducibility):

- `performance/k6-summary-read-heavy.json`
- `performance/k6-summary-write-heavy.json`
- `performance/k6-summary-mixed.json`
- `performance/k6-summary-spike.json`
- `performance/k6-summary-soak.json`

To re-run locally without installing k6 (from repo root, API reachable at `http://localhost:3000` on the host):

```bash
docker run --rm -v "%CD%:/work" -w /work -e BASE_URL=http://host.docker.internal:3000 grafana/k6 run --summary-export=/work/performance/k6-summary-read-heavy.json --vus 5 --duration 10s /work/performance/read-heavy.js
```

On Linux/macOS, replace `%CD%` with `"$PWD"` and ensure `host.docker.internal` is available (Docker Desktop provides it; on Linux you may need `--add-host=host.docker.internal:host-gateway`).

## Scenarios

| Scenario | Script | k6 settings used here |
|----------|--------|------------------------|
| Read-heavy | `read-heavy.js` | 5 VUs, 10s |
| Write-heavy | `write-heavy.js` | 3 VUs, 10s (uses `setup()` admin login — same as production RBAC) |
| Mixed | `mixed.js` | 4 VUs, 10s |
| Spike | `spike.js` | default stages (ramp to 120 VUs, ~60s) |
| Soak | `soak.js` | 8 VUs, 45s (`SOAK_DURATION=45s`) |

## Metrics (`http_req_duration` unless noted)

### Read-heavy

| Metric | Value |
|--------|--------|
| Average response time | **36.6 ms** |
| p95 latency | **242.0 ms** |
| Throughput (`http_reqs`) | **4.81 req/s** |
| Error rate (`http_req_failed`) | **0%** (0 / 50) |

### Write-heavy

| Metric | Value |
|--------|--------|
| Average response time | **24.1 ms** |
| p95 latency | **102.1 ms** |
| Throughput | **2.92 req/s** |
| Error rate | **0%** (0 / 30) |

### Mixed (GET incidents + POST route estimate)

| Metric | Value |
|--------|--------|
| Average response time | **138.1 ms** |
| p95 latency | **730.4 ms** |
| Throughput | **6.17 req/s** |
| Error rate | **0%** (0 / 66) |

### Spike

| Metric | Value |
|--------|--------|
| Average response time | **124.5 ms** |
| p95 latency | **280.8 ms** |
| Throughput | **278.2 req/s** |
| Error rate | **0%** (0 / 16700) |
| Total HTTP requests | **16700** |

### Soak

| Metric | Value |
|--------|--------|
| Average response time | **10.6 ms** |
| p95 latency | **19.4 ms** |
| Throughput | **30.55 req/s** |
| Error rate | **0%** (0 / 1384) |

## Bottlenecks and root causes

- **Mixed workload tail latency (p95 ~730 ms)** is driven primarily by **`POST /api/v1/routes/estimate`**, which performs outbound calls (OSRM / weather) and more server work per iteration than a plain listing.
- **Spike average ~124 ms** reflects sustained concurrent read load on `GET /api/v1/incidents` as virtual users ramp up; the median stays in a similar band, indicating relatively stable handling on this laptop-class setup for the chosen duration.

## Optimizations already present in code

- **Outbound caching and rate limiting** for external routing/weather (`ExternalService`) to reduce repeated provider latency and protect public endpoints.
- **Relational indexes** on high-churn listing paths (see Prisma schema) for incidents/reports/alerts patterns.

## Before / after comparison

Not applicable for this snapshot: the table above documents a **single measurement campaign** after the optimizations listed in the architecture notes. Re-run the same Docker k6 commands after any major change and paste new numbers beside these for a true before/after appendix.
