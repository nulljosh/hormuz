// ponytail: single Worker route, no DB — Yahoo has no CORS so we proxy+cache it here
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === "/api/oil") return oil(url, env);
    if (url.pathname === "/api/status") return status();
    return env.ASSETS.fetch(req);
  },
};

// ponytail: strait has never actually closed — hardcode true, upgrade to a
// news/AIS feed if that ever stops being true
function status() {
  return json({
    strait: "hormuz",
    open: true,
    last_closure: null,
    note: "No sustained closure has ever occurred. Threats spike oil futures; no tanker has been stopped from transit.",
  });
}

async function oil(url, env) {
  const range = url.searchParams.get("range") || "1mo"; // 5d | 1mo | 1y
  const interval = range === "5d" ? "15m" : range === "1mo" ? "1d" : "1wk";
  const key = `oil:${range}`;

  const cached = await env.KV.get(key, "json");
  if (cached && Date.now() - cached.fetchedAt < 15 * 60 * 1000) {
    return json(cached.body);
  }

  const upstream = `https://query1.finance.yahoo.com/v8/finance/chart/CL=F?range=${range}&interval=${interval}`;
  const res = await fetch(upstream, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) {
    if (cached) return json(cached.body); // stale is better than nothing
    return new Response("upstream error", { status: 502 });
  }
  const raw = await res.json();
  const r = raw.chart.result[0];
  const body = {
    symbol: "CL=F",
    timestamps: r.timestamp,
    closes: r.indicators.quote[0].close,
    price: r.meta.regularMarketPrice,
    prevClose: r.meta.chartPreviousClose,
  };
  await env.KV.put(key, JSON.stringify({ fetchedAt: Date.now(), body }), {
    expirationTtl: 3600,
  });
  return json(body);
}

function json(body) {
  return new Response(JSON.stringify(body), {
    headers: { "content-type": "application/json", "cache-control": "public, max-age=300" },
  });
}
