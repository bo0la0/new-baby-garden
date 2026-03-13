// src/app/api/moodle-admin/route.ts
//
// Server-side proxy that uses the ADMIN token (from .env.local).
// Used for operations students can't do with their own token,
// e.g. core_user_update_users (update profile / change password).
//
// The admin token never leaves the server — it's read from env only.

import { NextRequest, NextResponse } from "next/server";

const MOODLE_URL   = process.env.NEXT_PUBLIC_MOODLE_URL  || "http://localhost";
// Use dedicated profile token if set, otherwise fall back to main admin token
const ADMIN_TOKEN  = process.env.MOODLE_PROFILE_TOKEN || process.env.MOODLE_ADMIN_TOKEN || "";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fn, params = {} } = body;

    if (!fn) {
      return NextResponse.json({ error: "Missing 'fn' parameter" }, { status: 400 });
    }

    // Use POST body (form-encoded) — required for array params like users[0][id]
    const formData = new URLSearchParams();
    formData.set("wstoken",            ADMIN_TOKEN);
    formData.set("wsfunction",         fn);
    formData.set("moodlewsrestformat", "json");

    Object.entries(params).forEach(([k, v]) => {
      formData.set(k, String(v));
    });

    const response = await fetch(`${MOODLE_URL}/webservice/rest/server.php`, {
      method:  "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body:    formData.toString(),
    });

    const text = await response.text();

    // Moodle returns null (empty) on success for update functions
    let data: any = null;
    try { data = JSON.parse(text); } catch { data = null; }

    if (data === null) {
      return NextResponse.json({ success: true });
    }

    if (data?.exception || data?.errorcode) {
      return NextResponse.json(
        { error: data.message || "Moodle error", errorcode: data.errorcode },
        { status: 400 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: "Moodle admin proxy running ✅" });
}