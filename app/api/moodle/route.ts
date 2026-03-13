// src/app/api/moodle/route.ts
import { NextRequest, NextResponse } from "next/server";

const DEFAULT_MOODLE_URL = process.env.NEXT_PUBLIC_MOODLE_URL || "http://localhost";
const ADMIN_TOKEN        = process.env.MOODLE_ADMIN_TOKEN     || "";

// ─── CACHE CONFIG ────────────────────────────────────────────
const TTL: Record<string, number> = {
  core_enrol_get_users_courses:                5 * 60 * 1000,
  core_course_get_contents:                    5 * 60 * 1000,
  core_course_get_courses:                     5 * 60 * 1000,
  core_webservice_get_site_info:              10 * 60 * 1000,
  gradereport_user_get_grade_items:            2 * 60 * 1000,
  gradereport_overview_get_course_grades:      2 * 60 * 1000,
  core_calendar_get_action_events_by_timesort: 3 * 60 * 1000,
  core_user_get_users_by_field:                5 * 60 * 1000,
};
const DEFAULT_TTL = 60 * 1000;

const NO_CACHE = new Set([
  "core_user_update_users",
  "core_user_create_users",
  "core_user_delete_users",
  "mod_assign_save_grade",
  "mod_assign_save_submission",
]);

interface CacheEntry { data: any; expires: number; }
const cache    = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<any>>();

function getCacheKey(fn: string, params: Record<string, any>, token: string, lang: string): string {
  return `${token}:${fn}:${lang}:${JSON.stringify(params)}`;
}

function fromCache(key: string): any | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expires) { cache.delete(key); return null; }
  return entry.data;
}

function toCache(key: string, data: any, fn: string): void {
  const ttl = TTL[fn] ?? DEFAULT_TTL;
  cache.set(key, { data, expires: Date.now() + ttl });
  if (cache.size > 2000) {
    const now = Date.now();
    for (const [k, v] of cache.entries()) {
      if (now > v.expires) cache.delete(k);
    }
  }
}

const rateMap = new Map<string, { count: number; resetAt: number }>();
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const r   = rateMap.get(ip);
  if (!r || now > r.resetAt) { rateMap.set(ip, { count: 1, resetAt: now + 60_000 }); return false; }
  if (r.count >= 60) return true;
  r.count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    const body      = await req.json();
    const moodleUrl = body.moodleUrl || DEFAULT_MOODLE_URL;
    const token     = body.token     || ADMIN_TOKEN;
    const { fn, params = {}, lang } = body;

    if (!fn) {
      return NextResponse.json({ error: "Missing fn" }, { status: 400 });
    }

    const shouldCache = !NO_CACHE.has(fn);
    const cacheKey    = getCacheKey(fn, params, token, lang || "en");

    if (shouldCache) {
      const cached = fromCache(cacheKey);
      if (cached) {
        return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } });
      }
      const existing = inFlight.get(cacheKey);
      if (existing) {
        const data = await existing;
        return NextResponse.json(data, { headers: { "X-Cache": "DEDUP" } });
      }
    }

    const url = new URL(`${moodleUrl}/webservice/rest/server.php`);
    url.searchParams.set("wstoken",            token);
    url.searchParams.set("wsfunction",         fn);
    url.searchParams.set("moodlewsrestformat", "json");

    if (lang) {
      url.searchParams.set("moodlewssettingfilter", "true");
      url.searchParams.set("moodlewssettinglang",   lang);
    }

    Object.entries(params).forEach(([k, v]) =>
      url.searchParams.set(k, String(v))
    );

    const fetchPromise = (async () => {
      const controller = new AbortController();
      const timeout    = setTimeout(() => controller.abort(), 15_000);
      try {
        const response = await fetch(url.toString(), { signal: controller.signal });
        const data     = await response.json();
        if (shouldCache) toCache(cacheKey, data, fn);
        return data;
      } finally {
        clearTimeout(timeout);
        inFlight.delete(cacheKey);
      }
    })();

    if (shouldCache) inFlight.set(cacheKey, fetchPromise);

    const data = await fetchPromise;
    return NextResponse.json(data, { headers: { "X-Cache": "MISS" } });

  } catch (error: any) {
    if (error.name === "AbortError") {
      return NextResponse.json({ error: "Moodle request timed out" }, { status: 504 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Moodle proxy running ✅", cache_size: cache.size });
}