# Hormuz Technical Whitepaper

**v1.0.0** | September 2026

Oil markets move on one headline: the Strait of Hormuz is about to close.
For forty years it never did. On February 28, 2026 it did. Hormuz puts the
map, the price, and the real ship count on one page, so you can check the
headline in five seconds instead of believing it.
Live at [hormuz.heyitsmejosh.com](https://hormuz.heyitsmejosh.com).

## The mechanic

A live Google Maps embed centers on the strait itself, 26.5667°N 56.25°E,
because a status claim about a place should show the place. Next to it, a
status pill reads open or closed. The Worker computes it from IMF PortWatch
daily transit counts: a 7-day average under 30% of the pre-crisis 85 ships a
day reads closed. It used to be hardcoded open. That stopped being true.
PortWatch runs about a week behind, so the pill confirms a closure. It does
not break the news.

Below that, WTI crude (`CL=F`), fetched from Yahoo Finance's chart API.
Yahoo sets no CORS header, so the browser can't call it directly, a
Cloudflare Worker proxies the request server-side and caches the response in
KV for 15 minutes, which keeps the page fast and keeps Yahoo from seeing
every visitor's IP. The chart itself is drawn straight to a `<canvas>`, no
charting library, because a line and a gradient fill is a hundred lines of
code, not a dependency.

A long/short read comes off the same data: percent change from the first to
the last point in the visible range. Up favors long, down favors short. It's
trend-following, not a Hormuz call, and the page says so.

Underneath, a scroll-triggered explainer answers the actual question. Each
paragraph gets denser and smaller than the last, like an eye chart, because
the real story gets more interesting the deeper you go: why the threat went
unfired for forty years, what changed in 2026, and how war-risk insurance
closes a strait without a blockade line.

## Design

Dark, Helvetica-first, big numbers. The status pill and the price are the
two things a visitor is actually here for, so they're the largest text on
the page. The explainer intentionally breaks the "one clear read" rule on
purpose, since its whole point is to demonstrate that the real answer is
buried under increasing layers of nuance most headlines skip.

## Security / Privacy

No accounts, no client-side secrets. The Worker holds no API key, Yahoo's
chart endpoint and PortWatch's ArcGIS endpoint are both public and keyless. Cached responses in KV carry no
per-visitor data, only the shared oil-price series.

## License

MIT 2026, Joshua Trommel
