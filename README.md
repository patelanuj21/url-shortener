# URL Shortener — Cloudflare Workers + D1

A serverless URL shortener built on Cloudflare's developer platform. Create short links, track usage, and handle redirects at the edge using Cloudflare Workers (TypeScript) and D1 (SQLite). A React frontend is served directly from the same Worker using Workers Assets — no separate hosting required.

## Architecture

```
Browser
  │
  └─► Cloudflare Workers  (single deployment)
        │
        ├── Static Assets (Workers Assets)
        │     React + Vite frontend served from frontend/dist/
        │     ShortenForm  →  POST /api/shorten   (same origin, no CORS)
        │     StatsPanel   →  GET  /api/stats/:code
        │
        └── Hono API (TypeScript)
              POST   /api/shorten       →  validate URL, write to D1, return short link
              GET    /:code             →  302 redirect + increment click_count in D1
              GET    /api/stats/:code   →  click count + metadata from D1
              DELETE /api/links/:code   →  remove record from D1
              GET    /api/docs          →  interactive Swagger UI
              GET    /api/openapi.json  →  OpenAPI 3.0 spec
                    │
                    └─► D1 (SQLite at edge)
                          Table: urls
                          Columns: short_code, original_url, click_count, created_at
```

## Stack

| Layer | Technology |
|---|---|
| Edge compute | Cloudflare Workers |
| Backend router | Hono.js + `@hono/zod-openapi` |
| Validation + API docs | Zod schemas → OpenAPI 3.0 + Swagger UI |
| Database | Cloudflare D1 (SQLite) |
| Frontend | React + Vite (TypeScript) |
| Frontend hosting | Workers Assets (`[assets]` binding — same Worker, no CORS) |
| CI/CD | GitHub Actions + Wrangler CLI |

## Local Development

### Prerequisites

- Node.js 18+
- Wrangler CLI: `npm install -g wrangler`
- Cloudflare account (free tier works)

### Setup

```bash
# Install Worker dependencies
npm install

# Create D1 database (one-time) — copy the database_id into wrangler.toml
wrangler d1 create url-shortener-db

# Apply schema to local D1
wrangler d1 execute url-shortener-db --local --file=schema.sql

# Install frontend dependencies and build
cd frontend && npm install && npm run build && cd ..

# Start local dev server (serves API + React app at http://localhost:8787)
wrangler dev
```

Open **http://localhost:8787/api/docs** for the interactive Swagger UI.

## API Reference

Full interactive docs available at `/api/docs` (Swagger UI) or `/api/openapi.json` (raw spec).

### POST /api/shorten

Create a short URL.

```bash
curl -X POST http://localhost:8787/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://cloudflare.com"}'

# With a custom short code
curl -X POST http://localhost:8787/api/shorten \
  -H "Content-Type: application/json" \
  -d '{"url": "https://cloudflare.com", "custom_code": "cf"}'
```

Response `201`:
```json
{
  "short_code": "abc123",
  "short_url": "https://url-shortener.YOUR_SUBDOMAIN.workers.dev/abc123",
  "original_url": "https://cloudflare.com"
}
```

### GET /:code

Redirects to the original URL (302). Increments `click_count` in D1.

```bash
curl -L http://localhost:8787/abc123
```

### GET /api/stats/:code

Returns usage statistics for a short code.

```bash
curl http://localhost:8787/api/stats/abc123
```

Response `200`:
```json
{
  "short_code": "abc123",
  "original_url": "https://cloudflare.com",
  "click_count": 14,
  "created_at": "2026-03-22T10:00:00.000Z"
}
```

### DELETE /api/links/:code

Deletes a short link.

```bash
curl -X DELETE http://localhost:8787/api/links/abc123
```

Response: `204 No Content`

## Error Responses

All errors return a consistent JSON body:

```json
{ "error": "Human-readable message", "code": "MACHINE_READABLE_CODE" }
```

| Code | HTTP Status | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 422 | Invalid URL format or short code format |
| `CODE_CONFLICT` | 409 | Custom short code already exists |
| `NOT_FOUND` | 404 | Short code does not exist |
| `DB_ERROR` | 500 | D1 query failed |

## Debugging with `wrangler tail`

Every request emits a structured JSON log. Stream live logs from your deployed Worker:

```bash
wrangler tail
```

Example log entry:
```json
{
  "timestamp": "2026-03-22T10:00:00.000Z",
  "request_id": "550e8400-e29b-41d4-a716-446655440000",
  "method": "POST",
  "path": "/api/shorten",
  "status": 422,
  "duration_ms": 11,
  "error": "Invalid url",
  "error_code": "VALIDATION_ERROR"
}
```

Filter by error code to find patterns:

```bash
wrangler tail --format=json | grep VALIDATION_ERROR
```

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---|---|---|
| `404` on redirect | Short code not in D1 | `wrangler d1 execute url-shortener-db --command "SELECT * FROM urls WHERE short_code='abc'"` |
| `409` on shorten | Custom code already exists | Use a different `custom_code` or omit for auto-generation |
| `422` on shorten | URL fails Zod validation | Ensure URL includes protocol (`https://`) |
| Frontend shows blank page | Assets not built | Run `cd frontend && npm run build` before `wrangler dev` |
| Worker not updating after deploy | CF cache | Wait ~30s or check `wrangler deployments list` |
| D1 returns empty locally | Schema not applied locally | `wrangler d1 execute url-shortener-db --local --file=schema.sql` |

## Deployment

### Manual

```bash
# Build frontend first
cd frontend && npm run build && cd ..

# Apply schema to production D1
wrangler d1 execute url-shortener-db --file=schema.sql

# Deploy Worker + static assets in one command
wrangler deploy
```

### CI/CD (GitHub Actions)

Deployments to production happen automatically on push to `main`.

Required GitHub secrets:
- `CLOUDFLARE_API_TOKEN` — create at Cloudflare dashboard → My Profile → API Tokens (needs Workers + D1 permissions)
- `CLOUDFLARE_ACCOUNT_ID` — found in Cloudflare dashboard sidebar
