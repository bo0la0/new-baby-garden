import { NextRequest, NextResponse } from "next/server";

const DEFAULT_MOODLE_URL = process.env.NEXT_PUBLIC_MOODLE_URL || "http://localhost";
const ADMIN_TOKEN = process.env.MOODLE_ADMIN_TOKEN || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Use provided values OR fall back to env variables
    const moodleUrl = body.moodleUrl || DEFAULT_MOODLE_URL;
    const token     = body.token     || ADMIN_TOKEN;
    const { fn, params = {}, lang } = body;

    if (!fn) {
      return NextResponse.json({ error: "Missing fn" }, { status: 400 });
    }

    const url = new URL(`${moodleUrl}/webservice/rest/server.php`);
    url.searchParams.set("wstoken", token);
    url.searchParams.set("wsfunction", fn);
    url.searchParams.set("moodlewsrestformat", "json");

    // Tell Moodle to run text filters (multilang) and use the requested language.
    // moodlewssettingfilter=true  → activates all text filters including multilang
    // moodlewssettinglang=xx      → sets the language for the filtered response
    if (lang) {
      url.searchParams.set("moodlewssettingfilter", "true");
      url.searchParams.set("moodlewssettinglang",   lang);
    }

    Object.entries(params).forEach(([k, v]) =>
      url.searchParams.set(k, String(v))
    );

    const response = await fetch(url.toString());
    const data = await response.json();
    return NextResponse.json(data);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Moodle proxy running ✅" });
}