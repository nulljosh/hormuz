// ponytail: single Worker route, no DB, Yahoo has no CORS so we proxy+cache it here
export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === "/api/oil") return oil(url, env);
    if (url.pathname === "/api/status") return status(env);
    return env.ASSETS.fetch(req);
  },
};

// Computed from IMF PortWatch daily transit counts (chokepoint6 = Hormuz).
// ponytail: closed = 7-day avg under 30% of the pre-crisis baseline. PortWatch lags
// about a week, so this confirms a closure, it won't break the news. Tune CLOSED_RATIO
// if partial reopenings read wrong.
const BASELINE = 85; // avg daily transits before 2026-02-28
const CLOSED_RATIO = 0.3;
const PORTWATCH =
  "https://services9.arcgis.com/weJ1QsnbMYJlCHdG/arcgis/rest/services/Daily_Chokepoints_Data/FeatureServer/0/query" +
  "?where=portid%3D%27chokepoint6%27&outFields=date,n_total,n_tanker&orderByFields=date%20DESC&resultRecordCount=7&f=json";

export function readStatus(days) {
  const avg = days.reduce((a, d) => a + d.n_total, 0) / days.length;
  const open = avg >= BASELINE * CLOSED_RATIO;
  return {
    strait: "hormuz",
    open,
    transits_per_day: Math.round(avg * 10) / 10,
    baseline_per_day: BASELINE,
    as_of: days[0].date,
    last_closure: "2026-02-28",
    note: open
      ? "Traffic is flowing. Iran shut the strait on 2026-02-28, the first real closure in modern history."
      : `Effectively closed. About ${Math.round(avg)} ships a day against ${BASELINE} normal. Shut since 2026-02-28, with a brief reopening in June.`,
    source: "IMF PortWatch",
  };
}

async function status(env) {
  const key = "status";
  const cached = await env.KV.get(key, "json");
  if (cached && Date.now() - cached.fetchedAt < 60 * 60 * 1000) return json(cached.body);

  const res = await fetch(PORTWATCH, { headers: { "User-Agent": "Mozilla/5.0" } });
  const days = res.ok ? ((await res.json()).features || []).map((f) => f.attributes) : [];
  if (!days.length) {
    if (cached) return json(cached.body); // stale is better than nothing
    return new Response("upstream error", { status: 502 });
  }
  const body = readStatus(days);
  // no expirationTtl: keep the last good read around as the stale fallback
  await env.KV.put(key, JSON.stringify({ fetchedAt: Date.now(), body }));
  return json(body);
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
