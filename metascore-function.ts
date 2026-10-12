// Supabase Edge Function: metascore
// Dashboard > Edge Functions > Deploy a new function > "Via Editor" > adı: metascore
// Function details > "Enforce JWT Verification" KAPALI olmalı (sitede herkese açık çağrılır).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const ALLOWED = ["https://www.qwerst.com", "https://qwerst.com", "http://localhost:8000", "http://127.0.0.1:5500"];
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const HIT_TTL = 7 * 24 * 3600 * 1000;  // puan bulundu: 7 gün sakla
const MISS_TTL = 1 * 3600 * 1000;      // Metacritic net 'yok' dedi: 1 saat sonra tekrar dene

const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

function cors(origin: string | null) {
  return {
    "Access-Control-Allow-Origin": origin && ALLOWED.includes(origin) ? origin : ALLOWED[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Vary": "Origin",
  };
}

type Res = { score: number | null; status: number }; // status: HTTP durumu, 0 = ağ hatası

// 1) Oyun sayfasındaki JSON-LD aggregateRating
async function fromPage(slug: string): Promise<Res> {
  try {
    const r = await fetch(`https://www.metacritic.com/game/${slug}/`, {
      headers: { "User-Agent": UA, "Accept": "text/html,application/xhtml+xml", "Accept-Language": "en-US,en;q=0.9" },
    });
    if (!r.ok) return { score: null, status: r.status };
    const html = await r.text();
    const m = html.match(/"aggregateRating"\s*:\s*\{[^}]*?"ratingValue"\s*:\s*"?(\d{1,3})"?/);
    const n = m ? parseInt(m[1], 10) : NaN;
    return { score: n >= 1 && n <= 100 ? n : null, status: r.status };
  } catch (_) { return { score: null, status: 0 }; }
}

// 2) Metacritic'in kendi sitesinin kullandığı JSON uç noktası
export function findCriticScore(j: any): number | null {
  const comps: any[] = Array.isArray(j?.components) ? j.components : [];
  for (const c of comps) {
    if (!JSON.stringify(c?.meta ?? {}).toLowerCase().includes("critic-score")) continue;
    const stack: any[] = [c?.data];
    while (stack.length) {
      const o = stack.pop();
      if (o && typeof o === "object") {
        if (Number.isInteger(o.score) && o.score >= 1 && o.score <= 100) return o.score;
        for (const v of Object.values(o)) stack.push(v);
      }
    }
  }
  return null;
}
async function fromApi(slug: string): Promise<Res> {
  try {
    const r = await fetch(`https://backend.metacritic.com/composer/metacritic/pages/games/${slug}/web?apiKey=1MOZgmNFxvmljaQR1X9KAij9Mo4xAY3u`, {
      headers: { "User-Agent": UA, "Accept": "application/json" },
    });
    if (!r.ok) return { score: null, status: r.status };
    return { score: findCriticScore(await r.json()), status: r.status };
  } catch (_) { return { score: null, status: 0 }; }
}

const sleep = (ms: number) => new Promise((ok) => setTimeout(ok, ms));
// Engelleme/hız sınırı/geçici hata: 403, 429, 5xx ve ağ hatası. Bunlar "puan yok" demek DEĞİL.
const isTransient = (st: number) => st === 0 || st === 403 || st === 429 || st >= 500;

// Dönüş: score doluysa bulundu; transient true ise Metacritic şu an cevap vermedi (saklanmaz, istemci tekrar dener)
async function lookup(slug: string): Promise<{ score: number | null; cached: boolean; transient: boolean; reason?: string }> {
  const { data } = await sb.from("metascore_cache").select("score,fetched_at").eq("slug", slug).maybeSingle();
  if (data) {
    const age = Date.now() - new Date(data.fetched_at).getTime();
    if (age < (data.score ? HIT_TTL : MISS_TTL)) return { score: data.score, cached: true, transient: false };
  }
  const p = await fromPage(slug);
  if (p.score) { await sb.from("metascore_cache").upsert({ slug, score: p.score, fetched_at: new Date().toISOString() }); return { score: p.score, cached: false, transient: false }; }
  await sleep(250);
  const a = await fromApi(slug);
  if (a.score) { await sb.from("metascore_cache").upsert({ slug, score: a.score, fetched_at: new Date().toISOString() }); return { score: a.score, cached: false, transient: false }; }
  if (isTransient(p.status) || isTransient(a.status)) {
    return { score: null, cached: false, transient: true, reason: `page:${p.status} api:${a.status}` }; // KAYDEDİLMEZ
  }
  // Metacritic net cevap verdi (404 ya da sayfada puan yok): kısa süre sakla
  await sb.from("metascore_cache").upsert({ slug, score: null, fetched_at: new Date().toISOString() });
  return { score: null, cached: false, transient: false, reason: `page:${p.status} api:${a.status}` };
}

Deno.serve(async (req) => {
  const h = { ...cors(req.headers.get("Origin")), "Content-Type": "application/json" };
  if (req.method === "OPTIONS") return new Response(null, { headers: h });
  const raw = new URL(req.url).searchParams.get("slug") ?? "";
  const slugs = raw.split(",").map((s) => s.trim().toLowerCase()).filter((s) => /^[a-z0-9][a-z0-9-]{0,99}$/.test(s)).slice(0, 3);
  if (!slugs.length) return new Response(JSON.stringify({ score: null, error: "slug gerekli" }), { status: 400, headers: h });
  let transient = false, reason = "";
  for (const slug of slugs) {
    const r = await lookup(slug);
    if (r.score) return new Response(JSON.stringify({ score: r.score, slug, cached: r.cached }), { headers: { ...h, "Cache-Control": "public, max-age=3600" } });
    if (r.transient) transient = true;
    if (r.reason) reason = `${slug} ${r.reason}`;
  }
  // geçici hata varsa tarayıcı/CDN bunu önbelleğe almasın
  return new Response(JSON.stringify({ score: null, transient, reason }), { headers: { ...h, "Cache-Control": transient ? "no-store" : "public, max-age=600" } });
});
