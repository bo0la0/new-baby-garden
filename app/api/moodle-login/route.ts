import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const MOODLE_URL = process.env.NEXT_PUBLIC_MOODLE_URL || "http://localhost";

    //console.log("Login attempt:", { MOODLE_URL, username });

    // Use POST with form encoding to handle special characters safely
    const loginRes = await fetch(`${MOODLE_URL}/login/token.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        username,
        password,
        service: "moodle_mobile_app",
      }).toString(),
    });

    const loginData = await loginRes.json();
    //console.log("Moodle login response:", loginData);

    if (loginData.error) {
      return NextResponse.json(
        { error: loginData.error },
        { status: 401 }
      );
    }

    // Get user info
    const infoRes = await fetch(
      `${MOODLE_URL}/webservice/rest/server.php?wstoken=${loginData.token}&wsfunction=core_webservice_get_site_info&moodlewsrestformat=json`
    );
    const infoData = await infoRes.json();
    //console.log("User info:", infoData);

    return NextResponse.json({
      token:     loginData.token,
      userId:    infoData.userid,
      username:  infoData.username,
      fullname:  infoData.fullname,
      moodleUrl: MOODLE_URL,
    });

  } catch (error: any) {
    //console.error("Login error:", error);
    return NextResponse.json(
      { error: error.message || "Login failed" },
      { status: 500 }
    );
  }
}