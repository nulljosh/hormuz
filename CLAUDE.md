# Hormuz
v1.0.0

Strait of Hormuz status, oil price, and a long/short momentum read, `hormuz.heyitsmejosh.com`. One static page + one Worker, no build step.

## Structure
- `web/index.html`: landing + app, single file. Live Google Maps embed, WTI chart drawn on canvas (no chart lib), scroll-density explainer.
- `worker.js`: `/api/oil?range=5d|1mo|1y` proxies Yahoo Finance (CL=F) since it has no CORS, cached in KV 15min. `/api/status` computes open/closed from IMF PortWatch transit counts, cached in KV 1h. `node test_status.mjs` checks the threshold.
- Deploy: `npx wrangler deploy`.

## Gotchas
- Yahoo Finance has no CORS headers, so the browser can't hit it directly, worker.js proxies it server-side.
- Status was hardcoded open until 2026-09-20. The strait closed 2026-02-28 and the site said otherwise for months. Never hardcode it again.
- PortWatch lags about a week. Closed = 7-day avg under 30% of 85/day (`CLOSED_RATIO` in worker.js).
