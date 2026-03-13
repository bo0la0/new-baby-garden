"use client";
import { useState } from "react";

// Import as any to avoid JS/TS type conflicts
const LoginPage        = require("@/components/LoginPage").default;
const SchoolLMS        = require("@/components/SchoolLMS").default;
const StudentDashboard = require("@/components/StudentDashboard").default;

interface MoodleUser {
  token:     string;
  userId:    number;
  username:  string;
  nameEn:    string;
  nameAr:    string;
  fullname:  string;
  moodleUrl: string;
  role:      string;
}

export default function Home() {
  const [user, setUser] = useState<MoodleUser | null>(null);
  const [lang, setLang] = useState<string>("en");

  if (!user) {
    return (
      <LoginPage
        onLogin={(userData: MoodleUser) => setUser(userData)}
        lang={lang}
        setLang={setLang}
      />
    );
  }

  // Students → new focused dashboard
  if (user.role === "student") {
    return (
      <StudentDashboard
        user={user}
        onLogout={() => setUser(null)}
        onUserUpdate={(updated: MoodleUser) => setUser(updated)}
        lang={lang}
        setLang={setLang}
      />
    );
  }

  // Teachers, parents, admin → existing SchoolLMS
  return (
    <SchoolLMS
      user={user}
      onLogout={() => setUser(null)}
      lang={lang}
      setLang={setLang}
    />
  );
}