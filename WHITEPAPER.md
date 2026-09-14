# Hormuz Technical Whitepaper

**v1.0.0** | September 2026

Oil markets move on a headline that's almost never true: that the Strait of
Hormuz is about to close. It hasn't, not once, not for a day, in the modern
era. Hormuz exists to put the map, the price, and that fact on one page, so
the next time the headline runs you can check it in five seconds instead of
believing it.
Live at [hormuz.heyitsmejosh.com](https://hormuz.heyitsmejosh.com).

## The mechanic

A live Google Maps embed centers on the strait itself, 26.5667°N 56.25°E,
because a status claim about a place should show the place. Next to it, a
status pill reads open or closed. It's hardcoded open, because it always is;
the only way this becomes a real detector is a news or AIS feed, which isn't
worth building until the day it's actually needed.

Below that, WTI crude (`CL=F`), fetched from Yahoo Finance's chart API.
Yahoo sets no CORS header, so the browser can't call it directly — a
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
the real explanation for "why doesn't it ever close" is genuinely more
interesting the deeper you go: the threat is more valuable to Iran unfired
than fired, since firing it would cut off Iran's own export route and pull
the U.S. Fifth Fleet in directly. War-risk insurance premiums and tanker
routing are the real signal, months before anything would actually stop.

## Design

Dark, Helvetica-first, big numbers. The status pill and the price are the
two things a visitor is actually here for, so they're the largest text on
the page. The explainer intentionally breaks the "one clear read" rule on
purpose, since its whole point is to demonstrate that the real answer is
buried under increasing layers of nuance most headlines skip.

## Security / Privacy

No accounts, no client-side secrets. The Worker holds no API key — Yahoo's
chart endpoint is public and keyless. Cached responses in KV carry no
per-visitor data, only the shared oil-price series.

## License

MIT 2026, Joshua Trommel
