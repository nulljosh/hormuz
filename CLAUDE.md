# Hormuz
v1.0.0

Strait of Hormuz status, oil price, and a long/short momentum read, `hormuz.heyitsmejosh.com`. One static page + one Worker, no build step.

## Structure
- `web/index.html`: landing + app, single file. Live Google Maps embed, WTI chart drawn on canvas (no chart lib), scroll-density explainer.
- `worker.js`: `/api/oil?range=5d|1mo|1y` proxies Yahoo Finance (CL=F) since it has no CORS, cached in KV 15min. `/api/status` returns the open/closed read.
- Deploy: `npx wrangler deploy`.

## Gotchas
- Yahoo Finance has no CORS headers, so the browser can't hit it directly — worker.js proxies it server-side.
- `open: true` in `/api/status` is hardcoded, not computed. The strait has never had a sustained closure; wire a real news/AIS feed only if that changes.
