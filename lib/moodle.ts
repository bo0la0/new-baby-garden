// lib/moodle.ts
// All Moodle API calls go through the Next.js proxy (no CORS)

export async function callMoodle(
  moodleUrl: string,
  token: string,
  fn: string,
  params: Record<string, any> = {},
  lang: string = "en"
) {
  const res = await fetch("/api/moodle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moodleUrl, token, fn, params, lang }),
  });
  const data = await res.json();
  if (data.exception || data.errorcode) {
    throw new Error(data.message || "Moodle API error");
  }
  return data;
}

// ─── AUTH ────────────────────────────────────────────────────
// Get site info + logged-in user details
export async function getSiteInfo(url: string, token: string) {
  return callMoodle(url, token, "core_webservice_get_site_info");
}

// Login and get token (Moodle login API)
export async function loginMoodle(url: string, username: string, password: string) {
  const res = await fetch("/api/moodle-login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ moodleUrl: url, username, password }),
  });
  return res.json();
}

// ─── COURSES ─────────────────────────────────────────────────
// Get all courses a user is enrolled in
export async function getUserCourses(url: string, token: string, userId: number, lang: string = "en") {
  return callMoodle(url, token, "core_enrol_get_users_courses", {
    userid: userId,
  }, lang);
}

// Get all courses on site (admin)
export async function getAllCourses(url: string, token: string, lang: string = "en") {
  return callMoodle(url, token, "core_course_get_courses", {}, lang);
}

// ─── GRADES ──────────────────────────────────────────────────
// Get grade items for a user in a course
export async function getUserGrades(
  url: string,
  token: string,
  courseId: number,
  userId: number
) {
  return callMoodle(url, token, "gradereport_user_get_grade_items", {
    courseid: courseId,
    userid: userId,
  });
}

// Get grades overview for all courses
export async function getGradesOverview(url: string, token: string, userId: number) {
  return callMoodle(url, token, "gradereport_overview_get_course_grades", {
    userid: userId,
  });
}

// ─── ATTENDANCE ──────────────────────────────────────────────
// Get attendance summary for a user
export async function getAttendanceSummary(
  url: string,
  token: string,
  userId: number
) {
  return callMoodle(url, token, "mod_attendance_get_user_data", {
    userid: userId,
  });
}

// Get attendance sessions for a course
export async function getAttendanceSessions(
  url: string,
  token: string,
  courseId: number
) {
  return callMoodle(url, token, "mod_attendance_get_sessions", {
    courseid: courseId,
  });
}

// ─── USERS ───────────────────────────────────────────────────
// Get all users (admin only)
export async function getAllUsers(url: string, token: string, lang: string = "en") {
  return callMoodle(url, token, "core_user_get_users", {
    "criteria[0][key]": "email",
    "criteria[0][value]": "%%",
  }, lang);
}

// Get a single user by ID
export async function getUserById(url: string, token: string, userId: number) {
  return callMoodle(url, token, "core_user_get_users_by_field", {
    field: "id",
    "values[0]": userId,
  });
}

// Create users in bulk
export async function createUsers(url: string, token: string, users: object[]) {
  return callMoodle(url, token, "core_user_create_users", { users });
}

// ─── DATA TRANSFORMERS ───────────────────────────────────────
// Transform Moodle course data to our UI format
export function transformCourse(moodleCourse: any) {
  return {
    id: moodleCourse.id,
    enName: moodleCourse.fullname,
    arName: moodleCourse.fullname, // Moodle stores one name
    shortName: moodleCourse.shortname,
    progress: moodleCourse.progress || 0,
    color: getCourseColor(moodleCourse.id),
    icon: getCourseIcon(moodleCourse.shortname),
  };
}

// Transform Moodle grade to our UI format
export function transformGrade(moodleGrade: any) {
  const percentage = moodleGrade.percentageformatted
    ? parseFloat(moodleGrade.percentageformatted)
    : moodleGrade.graderaw && moodleGrade.grademax
    ? Math.round((moodleGrade.graderaw / moodleGrade.grademax) * 100)
    : 0;
  return {
    id: moodleGrade.id,
    enName: moodleGrade.itemname || "Unknown",
    arName: moodleGrade.itemname || "غير معروف",
    grade: moodleGrade.graderaw || 0,
    maxGrade: moodleGrade.grademax || 100,
    percentage,
    feedback: moodleGrade.feedback || "",
  };
}

// Transform Moodle attendance to our UI format
export function transformAttendance(sessions: any[]) {
  return sessions.map((s: any) => ({
    date: new Date(s.sessdate * 1000).toLocaleDateString("en-GB", {
      weekday: "short", day: "numeric",
    }),
    status: s.statusdescription?.toLowerCase().includes("present") ? "present"
          : s.statusdescription?.toLowerCase().includes("absent")  ? "absent"
          : s.statusdescription?.toLowerCase().includes("late")    ? "late"
          : "excused",
    sessionId: s.id,
  }));
}

// ─── HELPERS ─────────────────────────────────────────────────
function getCourseColor(id: number): string {
  const colors = ["#ef4444","#6366f1","#0ea5e9","#10b981","#f59e0b","#ec4899","#8b5cf6","#14b8a6"];
  return colors[id % colors.length];
}

function getCourseIcon(shortname: string): string {
  const s = (shortname || "").toLowerCase();
  if (s.includes("math") || s.includes("رياض")) return "∑";
  if (s.includes("arab") || s.includes("عرب"))  return "ع";
  if (s.includes("eng")  || s.includes("انجل")) return "E";
  if (s.includes("sci")  || s.includes("علوم")) return "🔬";
  if (s.includes("art")  || s.includes("فنون")) return "🎨";
  if (s.includes("isla") || s.includes("اسلا")) return "☪";
  if (s.includes("phys") || s.includes("فيزي")) return "⚡";
  if (s.includes("chem") || s.includes("كيمي")) return "⚗";
  return "📚";
}