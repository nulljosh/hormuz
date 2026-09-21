# Architecture

Strait of Hormuz geopolitical monitor. Map, oil price, shipping status. One page with live data. No build step.

## How it runs

`web/index.html` embeds a live Google Maps centered on the strait (26.5667°N 56.25°E). A status pill displays open/closed based on IMF PortWatch ship transit data. A WTI crude price chart is drawn on canvas (no charting library). A momentum indicator (long/short) tracks 7-day momentum based on price change. The Worker proxies Yahoo Finance (which has no CORS headers) and caches responses in KV for 15 minutes. Ship status is cached for 1 hour.

| File | What it owns |
|---|---|
| `web/index.html` | Sole page. Google Maps embed (strait location), status pill, WTI canvas chart, momentum indicator, explainer. Fetches `/api/oil?range=` and `/api/status` from the Worker. |
| `worker.js` | Cloudflare Worker. `/api/oil?range=5d|1mo|1y` proxies Yahoo Finance (CL=F) with 15-min KV cache. `/api/status` computes strait open/closed from IMF PortWatch 7-day transit average (closed = avg < 30% of 85 ships/day), cached 1h. |
| `test_status.mjs` | Unit tests for status computation logic. |
| `kmp/` | Kotlin Multiplatform: Android and desktop Compose clients. Same data fetching logic as web, renders status, price, and momentum in Compose UI. CI builds msi, deb, apk via native-release.yml. |
| `wrangler.toml` | Cloudflare Worker deployment config. KV namespace for caching. |
