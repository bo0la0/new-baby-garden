"use client";
import { useState, useEffect, useRef, lazy } from "react";

/* ═══════════════════════════════════════════════════════════
   NEW BABY GARDEN — STUDENT DASHBOARD  (Fully Responsive)
   Mobile-first design with JS-driven breakpoints
═══════════════════════════════════════════════════════════ */

const SCHOOL = {
  nameEn: "New Baby Garden",
  nameAr: "روضة النجم الجديد",
  color:  "#0f6cbd",
  dark:   "#0a4a8f",
  accent: "#f59e0b",
};

const TX = {
  en: {
    dashboard:"Dashboard", myCourses:"My Courses", grades:"Grades",
    certificates:"Certificates", logout:"Logout", welcome:"Welcome back",
    loading:"Loading...", error:"Something went wrong",
    noCoures:"No courses found", noCourseContent:"No content available",
    materials:"Materials", upcomingQuizzes:"Upcoming", assignments:"Assignments",
    sections:"Sections", dueDate:"Due", opens:"Opens", timeLimit:"Time limit",
    mins:"min", questions:"questions", gradeReport:"Grade Report", course:"Course",
    midterm:"Midterm", final:"Final", total:"Total", letterGrade:"Grade",
    termAvg:"Term Average", excellent:"Excellent", veryGood:"Very Good",
    good:"Good", pass:"Pass", fail:"Fail",
    certEarned:"Certificate Earned", certLocked:"Not Yet Earned",
    certUnlockHint:"Score 85% or above to earn",
    certDownload:"Download Certificate", certPrint:"Print",
    certTitle:"Certificate of Excellence",
    certBody:"has successfully completed the course with outstanding achievement",
    certIssued:"Issued on", certVerify:"Verify at", principal:"School Principal",
    stamp:"Official Seal", score:"Score", status:"Status",
    viewCourse:"View Course", back:"Back", retry:"Retry",
    files:"Files", pages:"Pages", videos:"Videos", quizzes:"Quizzes",
    noGrades:"No grades yet", lang:"عر",
  },
  ar: {
    dashboard:"الرئيسية", myCourses:"موادي", grades:"الدرجات",
    certificates:"الشهادات", logout:"خروج", welcome:"مرحباً بعودتك",
    loading:"جارٍ التحميل...", error:"حدث خطأ ما",
    noCoures:"لا توجد مواد", noCourseContent:"لا يوجد محتوى",
    materials:"المحتوى", upcomingQuizzes:"القادمة", assignments:"الواجبات",
    sections:"الوحدات", dueDate:"موعد التسليم", opens:"يفتح", timeLimit:"المدة",
    mins:"دقيقة", questions:"أسئلة", gradeReport:"كشف الدرجات", course:"المادة",
    midterm:"منتصف الفصل", final:"النهائي", total:"المجموع", letterGrade:"التقدير",
    termAvg:"متوسط الفصل", excellent:"ممتاز", veryGood:"جيد جداً",
    good:"جيد", pass:"مقبول", fail:"راسب",
    certEarned:"تم الحصول على الشهادة", certLocked:"لم تحصل عليها بعد",
    certUnlockHint:"احصل على 85% أو أكثر للحصول على الشهادة",
    certDownload:"تحميل الشهادة", certPrint:"طباعة",
    certTitle:"شهادة تفوق وتميز",
    certBody:"أتم المادة الدراسية بنجاح وتفوق مشرف",
    certIssued:"صدرت بتاريخ", certVerify:"للتحقق", principal:"مدير المدرسة",
    stamp:"الختم الرسمي", score:"الدرجة", status:"الحالة",
    viewCourse:"عرض المادة", back:"رجوع", retry:"إعادة المحاولة",
    files:"الملفات", pages:"الصفحات", videos:"الفيديوهات", quizzes:"الاختبارات",
    noGrades:"لا توجد درجات بعد", lang:"EN",
  },
};

// ── Responsive breakpoint hook ────────────────────────────
function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

// ── Helpers ───────────────────────────────────────────────
const COURSE_COLORS = ["#ef4444","#6366f1","#0ea5e9","#10b981","#f59e0b","#ec4899","#8b5cf6","#14b8a6","#f97316","#06b6d4"];
function courseColor(id) { return COURSE_COLORS[id % COURSE_COLORS.length]; }

function gradeInfo(pct, tx) {
  if (pct >= 90) return { label:tx.excellent, color:"#059669", bg:"#d1fae5", border:"#6ee7b7" };
  if (pct >= 80) return { label:tx.veryGood,  color:"#4f46e5", bg:"#e0e7ff", border:"#a5b4fc" };
  if (pct >= 70) return { label:tx.good,      color:"#0284c7", bg:"#e0f2fe", border:"#7dd3fc" };
  if (pct >= 60) return { label:tx.pass,      color:"#d97706", bg:"#fef3c7", border:"#fcd34d" };
  return               { label:tx.fail,      color:"#dc2626", bg:"#fee2e2", border:"#fca5a5" };
}

function Bar({ val, max=100, color, h=5 }) {
  return (
    <div style={{ background:"#e2e8f0", borderRadius:99, height:h, overflow:"hidden" }}>
      <div style={{ width:`${Math.min(100,(val/max)*100)}%`, height:"100%", background:color, borderRadius:99, transition:"width 1s ease" }}/>
    </div>
  );
}

function Ring({ val, size=72, stroke=7, color="#0f6cbd" }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)", display:"block" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c-(Math.min(100,val)/100)*c} strokeLinecap="round"
        style={{ transition:"stroke-dashoffset 1s ease" }}/>
    </svg>
  );
}

function Badge({ label, color, bg, border }) {
  return <span style={{ background:bg, color, border:`1px solid ${border}`, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, whiteSpace:"nowrap" }}>{label}</span>;
}

function Spinner({ color="#0f6cbd" }) {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:40 }}>
      <div style={{ width:36, height:36, border:`3px solid ${color}22`, borderTop:`3px solid ${color}`, borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

function fmtDate(ts, isRtl) {
  if (!ts) return "—";
  return new Date(ts*1000).toLocaleDateString(isRtl?"ar-EG":"en-GB",{day:"numeric",month:"short",year:"numeric"});
}
function fmtDateTime(ts, isRtl) {
  if (!ts) return "—";
  return new Date(ts*1000).toLocaleString(isRtl?"ar-EG":"en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"});
}
function modIcon(modname) {
  const map={resource:"📄",url:"🔗",page:"📃",folder:"📁",quiz:"📝",assign:"📋",forum:"💬",video:"🎬",label:"🏷️",scorm:"📦",book:"📖",glossary:"📚",workshop:"🛠️",survey:"📊",feedback:"✍️",chat:"💬",choice:"🗳️",lesson:"📖",wiki:"📝",h5pactivity:"🎮"};
  return map[modname]||"📎";
}

/* ═══════════════════════════════════════════════════════════
   CERTIFICATE
═══════════════════════════════════════════════════════════ */
function Certificate({ user, course, pct, lang, tx, certRef }) {
  const isRtl = lang === "ar";
  const g = gradeInfo(pct, tx);
  const today = new Date().toLocaleDateString(isRtl?"ar-EG":"en-GB",{year:"numeric",month:"long",day:"numeric"});
  const color = courseColor(course.id);
  return (
    <div ref={certRef} style={{ width:"100%",maxWidth:800,margin:"0 auto",background:"linear-gradient(135deg,#fefdf8,#f0f9ff)",borderRadius:20,position:"relative",overflow:"hidden",boxShadow:"0 20px 60px rgba(15,107,189,0.18)",fontFamily:"Georgia,serif" }}>
      <div style={{ position:"absolute",inset:8,border:"2px solid #0f6cbd",borderRadius:16,pointerEvents:"none",zIndex:1,opacity:0.25 }}/>
      <div style={{ position:"absolute",inset:13,border:"1px solid #f59e0b",borderRadius:12,pointerEvents:"none",zIndex:1,opacity:0.35 }}/>
      <div style={{ position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,#0f6cbd12 1px,transparent 1px)",backgroundSize:"28px 28px",opacity:0.5 }}/>
      <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:0,opacity:0.03,fontSize:110,fontWeight:900,color:"#0f6cbd",userSelect:"none" }}>NBG</div>
      <div style={{ position:"relative",zIndex:2,padding:"32px 24px",direction:isRtl?"rtl":"ltr",textAlign:"center" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:18 }}>
          <div style={{ flex:1,height:1,background:"linear-gradient(to right,transparent,#f59e0b)" }}/>
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:6 }}>
            <div style={{ width:60,height:60,borderRadius:"50%",background:"linear-gradient(135deg,#0f6cbd,#0a4a8f)",display:"flex",alignItems:"center",justifyContent:"center",border:"3px solid #f59e0b",overflow:"hidden" }}>
              <img src="/logo.png" alt="logo" style={{ width:56,height:56,objectFit:"cover",borderRadius:"50%" }} onError={e=>{e.currentTarget.style.display="none";e.currentTarget.nextElementSibling.style.display="block";}}/>
              <span style={{ display:"none",fontSize:28 }}>🌱</span>
            </div>
            <div style={{ fontSize:11,fontWeight:800,color:"#0f6cbd",letterSpacing:2,textTransform:"uppercase" }}>{isRtl?SCHOOL.nameAr:SCHOOL.nameEn}</div>
          </div>
          <div style={{ flex:1,height:1,background:"linear-gradient(to left,transparent,#f59e0b)" }}/>
        </div>
        <div style={{ fontSize:9,letterSpacing:4,color:"#64748b",textTransform:"uppercase",marginBottom:4 }}>{isRtl?"تمنح هذه الشهادة إلى":"This Certificate is Proudly Presented to"}</div>
        <div style={{ fontSize:26,fontWeight:900,color:"#0a4a8f" }}>{tx.certTitle}</div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10,margin:"8px 0 16px" }}>
          <div style={{ height:1,width:40,background:"linear-gradient(to right,transparent,#f59e0b)" }}/>
          <span style={{ color:"#f59e0b",fontSize:16 }}>✦</span>
          <div style={{ height:1,width:40,background:"linear-gradient(to left,transparent,#f59e0b)" }}/>
        </div>
        <div style={{ margin:"0 0 12px",padding:"12px 20px",background:"linear-gradient(135deg,rgba(15,107,189,0.06),rgba(245,158,11,0.06))",borderRadius:12,border:"1px solid rgba(15,107,189,0.14)" }}>
          <div style={{ fontSize:24,fontWeight:900,color:"#0f6cbd" }}>{user?.nameEn||user?.fullname}</div>
          <div style={{ fontSize:11,color:"#64748b",marginTop:2 }}>{isRtl?"معرف المستخدم":"User ID"}: {user?.username}</div>
        </div>
        <p style={{ fontSize:13,color:"#374151",lineHeight:1.8,margin:"0 0 8px",fontStyle:"italic" }}>{tx.certBody}</p>
        <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:color+"15",border:`1.5px solid ${color}40`,borderRadius:10,padding:"6px 16px",marginBottom:14,fontSize:13,fontWeight:700,color }}>
          <span>📚</span><span>{course.fullname}</span>
        </div>
        <div style={{ display:"flex",justifyContent:"center",marginBottom:20 }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:10,background:g.bg,border:`1.5px solid ${g.border}`,borderRadius:12,padding:"8px 20px" }}>
            <span style={{ fontSize:20 }}>🏆</span>
            <div style={{ textAlign:isRtl?"right":"left" }}>
              <div style={{ fontSize:10,color:"#64748b" }}>{isRtl?"الدرجة النهائية":"Final Score"}</div>
              <div style={{ fontSize:18,fontWeight:900,color:g.color }}>{pct}% — {g.label}</div>
            </div>
          </div>
        </div>
        <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:14,alignItems:"flex-end" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ height:1,background:"#cbd5e1",marginBottom:6 }}/>
            <div style={{ fontSize:10,color:"#64748b" }}>{tx.certIssued}</div>
            <div style={{ fontSize:11,fontWeight:700,color:"#1e293b",marginTop:2 }}>{today}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ width:52,height:52,borderRadius:"50%",border:"2px dashed #0f6cbd",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 4px",background:"rgba(15,107,189,0.05)" }}>
              <span style={{ fontSize:24 }}>🌱</span>
            </div>
            <div style={{ fontSize:9,color:"#94a3b8" }}>{tx.stamp}</div>
          </div>
          <div style={{ textAlign:"center" }}>
            <div style={{ width:48,height:48,margin:"0 auto 4px",background:"#1e293b",borderRadius:5,display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,padding:2 }}>
              {Array.from({length:49},(_,i)=>(
                <div key={i} style={{ background:[0,1,2,7,8,9,14,15,16,6,13,20,3,10,17,24,25,26,27,28,34,35,36,21,42,43,44,30,37,47,48,46,45,41].includes(i)?"#fff":"transparent",borderRadius:1 }}/>
              ))}
            </div>
            <div style={{ fontSize:8,color:"#94a3b8" }}>{tx.certVerify}</div>
          </div>
        </div>
        <div style={{ marginTop:14,paddingTop:12,borderTop:"1px solid #e2e8f0",textAlign:"center" }}>
          <div style={{ fontSize:15,color:"#0f6cbd",fontStyle:"italic",fontFamily:"cursive" }}>{tx.principal}</div>
          <div style={{ fontSize:9,color:"#94a3b8",letterSpacing:2,textTransform:"uppercase",marginTop:2 }}>{isRtl?SCHOOL.nameAr:SCHOOL.nameEn}</div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN DASHBOARD
═══════════════════════════════════════════════════════════ */
export default function StudentDashboard({ user, onLogout, onUserUpdate, lang, setLang }) {
  const width     = useWindowWidth();
  const isMobile  = width < 768;
  const isTablet  = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;

  const [page, setPage]                 = useState("dashboard");
  const [activeCourse, setActiveCourse] = useState(null);
  const [certCourse, setCertCourse]     = useState(null);
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [pdfLoading, setPdfLoading]     = useState(false);
  const certRef = useRef(null);

  async function loadPdfLibs() {
    if (window.html2canvas && window.jspdf) return;
    await Promise.all([
      new Promise((res,rej)=>{ const s=document.createElement("script"); s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"; s.onload=res; s.onerror=rej; document.head.appendChild(s); }),
      new Promise((res,rej)=>{ const s=document.createElement("script"); s.src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"; s.onload=res; s.onerror=rej; document.head.appendChild(s); }),
    ]);
  }

  async function downloadCertPdf() {
    if (!certRef.current) return;
    setPdfLoading(true);
    try {
      await loadPdfLibs();
      const el = certRef.current;
      const canvas = await window.html2canvas(el, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#fefdf8",
        logging: false,
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation:"landscape", unit:"mm", format:"a4" });
      const pW = pdf.internal.pageSize.getWidth();
      const pH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      let w = pW, h = pW / ratio;
      if (h > pH) { h = pH; w = pH * ratio; }
      const x = (pW - w) / 2, y = (pH - h) / 2;
      pdf.addImage(imgData, "JPEG", x, y, w, h);
      const name = (user?.nameEn||user?.fullname||"student").replace(/\s+/g,"_");
      const course = certCourse?.fullname?.replace(/\s+/g,"_")||"certificate";
      pdf.save(`certificate_${name}_${course}.pdf`);
    } catch(e) {
      alert("PDF generation failed: " + e.message);
    }
    setPdfLoading(false);
  }

  const [courses, setCourses]             = useState([]);
  const [courseContent, setCourseContent] = useState({});
  const [grades, setGrades]               = useState({});
  const [upcoming, setUpcoming]           = useState([]);

  const [loadingCourses,  setLoadingCourses]  = useState(true);
  const [loadingContent,  setLoadingContent]  = useState(false);
  const [loadingGrades,   setLoadingGrades]   = useState(false);
  const [loadingUpcoming, setLoadingUpcoming] = useState(false);
  const [err, setErr] = useState("");

  // ── Profile state ──────────────────────────────────────
  const [avatar,       setAvatar]       = useState(() => { try { return localStorage.getItem(`nbg_avatar_${user?.userId}`) || null; } catch{ return null; } });
  const [profileForm,  setProfileForm]  = useState({ firstName:"", lastName:"", email:"", phone:"", bio:"" });
  const [pwForm,       setPwForm]       = useState({ current:"", newPw:"", confirm:"" });
  const [profileMsg,   setProfileMsg]   = useState(null); // {type:"success"|"error", text:""}
  const [pwMsg,        setPwMsg]        = useState(null);
  const [savingProfile,setSavingProfile]= useState(false);
  const [savingPw,     setSavingPw]     = useState(false);
  const [showCurrent,  setShowCurrent]  = useState(false);
  const [showNew,      setShowNew]      = useState(false);
  const [showConfirm,  setShowConfirm]  = useState(false);
  const avatarInputRef = useRef(null);

  // Moodle API call helper - uses current lang from component
  const moodle = async (token, fn, params={}) => {
    const res = await fetch("/api/moodle", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ token, fn, params, lang }),
    });
    const data = await res.json();
    if (data.exception || data.errorcode) throw new Error(data.message || "Moodle error");
    return data;
  };

  // Load profile from Moodle when page="profile"
  useEffect(() => {
    if (page==="profile" && token && userId && !profileForm.email) loadProfile();
  }, [page]);

  async function loadProfile() {
    try {
      const data = await moodle(token, "core_user_get_users_by_field", { field:"id", "values[0]":userId });
      const u = data?.[0];
      if (u) setProfileForm({ firstName:u.firstname||"", lastName:u.lastname||"", email:u.email||"", phone:u.phone1||"", bio:u.description||"" });
    } catch {}
  }

  async function saveProfile() {
    setSavingProfile(true); setProfileMsg(null);
    // Validate phone before sending
    if (profileForm.phone && profileForm.phone.length !== 11) {
      setProfileMsg({ type:"error", text: lang==="ar" ? "رقم الهاتف يجب أن يكون 11 رقماً" : "Phone number must be exactly 11 digits" });
      setSavingProfile(false); return;
    }
    try {
      const res = await fetch("/api/moodle-admin", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          fn: "core_user_update_users",
          params: {
            "users[0][id]":          userId,
            "users[0][firstname]":   profileForm.firstName,
            "users[0][lastname]":    profileForm.lastName,
            "users[0][email]":       profileForm.email,
            "users[0][phone1]":      profileForm.phone,
            "users[0][description]": profileForm.bio,
          }
        }),
      });
      const data = await res.json();
      // Route returns {success:true} on null Moodle response (= OK)
      if (!res.ok || data?.error) throw new Error(data?.error || "Update failed");
      setProfileMsg({ type:"success", text: lang==="ar" ? "تم حفظ البيانات بنجاح ✓" : "Profile saved successfully ✓" });
      // Update display name immediately without needing to re-login
      if (onUserUpdate) {
        onUserUpdate({
          ...user,
          nameEn:   `${profileForm.firstName} ${profileForm.lastName}`.trim(),
          fullname: `${profileForm.firstName} ${profileForm.lastName}`.trim(),
        });
      }
    } catch(e) {
      setProfileMsg({ type:"error", text: e.message });
    }
    setSavingProfile(false);
  }

  async function changePassword() {
    setPwMsg(null);
    if (!pwForm.current)  { setPwMsg({ type:"error", text: lang==="ar"?"أدخل كلمة المرور الحالية":"Enter current password" }); return; }
    if (pwForm.newPw.length < 4) { setPwMsg({ type:"error", text: lang==="ar"?"كلمة المرور 4 أحرف على الأقل":"Password must be at least 4 characters" }); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwMsg({ type:"error", text: lang==="ar"?"كلمة المرور غير متطابقة":"Passwords do not match" }); return; }
    setSavingPw(true);
    try {
      // Step 1: verify current password by re-authenticating
      const loginRes = await fetch("/api/moodle-login", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ username: user?.username, password: pwForm.current }),
      });
      const loginData = await loginRes.json();
      if (loginData.error) throw new Error(lang==="ar" ? "كلمة المرور الحالية غير صحيحة" : "Current password is incorrect");

      // Step 2: update via admin proxy
      const res = await fetch("/api/moodle-admin", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          fn: "core_user_update_users",
          params: {
            "users[0][id]":       userId,
            "users[0][password]": pwForm.newPw,
          }
        }),
      });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error || "Password update failed");
      setPwMsg({ type:"success", text: lang==="ar" ? "تم تغيير كلمة المرور بنجاح ✓" : "Password changed successfully ✓" });
      setPwForm({ current:"", newPw:"", confirm:"" });
    } catch(e) {
      setPwMsg({ type:"error", text: e.message });
    }
    setSavingPw(false);
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert(lang==="ar"?"الصورة أكبر من 3MB":"Image must be under 3MB"); return; }
    const reader = new FileReader();
    reader.onload = ev => {
      const dataUrl = ev.target.result;
      setAvatar(dataUrl);
      try { localStorage.setItem(`nbg_avatar_${userId}`, dataUrl); } catch {}
    };
    reader.readAsDataURL(file);
  }

  function removeAvatar() {
    setAvatar(null);
    try { localStorage.removeItem(`nbg_avatar_${userId}`); } catch {}
  }

  const tx     = TX[lang];
  const isRtl  = lang === "ar";
  const rc     = SCHOOL.color;
  const token  = user?.token;
  const userId = user?.userId;

  useEffect(() => { if (token && userId) loadCourses(); }, [token, userId, lang]);

  useEffect(() => {
    if (page==="grades" && token && userId && courses.length>0 && Object.keys(grades).length===0) loadAllGrades();
    if (page==="dashboard" && token && upcoming.length===0 && courses.length>0) loadUpcoming();
  }, [page, courses]);

  useEffect(() => { if (isDesktop) setSidebarOpen(false); }, [isDesktop]);

  async function loadCourses() {
    setLoadingCourses(true); setErr("");
    try {
      const data = await moodle(token, "core_enrol_get_users_courses", { userid:userId }, lang);
      setCourses((data||[]).filter(c=>c.id!==1));
    } catch(e) { setErr(e.message); }
    setLoadingCourses(false);
  }

  async function loadCourseContent(courseId) {
    if (courseContent[courseId]) return;
    setLoadingContent(true);
    try {
      const data = await moodle(token, "core_course_get_contents", { courseid:courseId });
      setCourseContent(prev=>({...prev,[courseId]:data||[]}));
    } catch(e) { setErr(e.message); }
    setLoadingContent(false);
  }

  async function loadAllGrades() {
    setLoadingGrades(true);
    const result = {};
    for (const course of courses) {
      try {
        const data = await moodle(token, "gradereport_user_get_grade_items", { courseid:course.id, userid:userId });
        const items      = data?.usergrades?.[0]?.gradeitems||[];
        const gradeItems = items.filter(i=>i.itemtype!=="course");
        const courseTotal= items.find(i=>i.itemtype==="course");
        const midItem = gradeItems.find(i=>/mid|نصف|منتصف/i.test(i.itemname||""))||gradeItems[0];
        const finItem = gradeItems.find(i=>/final|نهائ/i.test(i.itemname||""))||gradeItems[1];
        function toPercent(item){ if(!item||item.graderaw==null)return null; return Math.round((item.graderaw/(item.grademax||100))*100); }
        const midPct = toPercent(midItem), finPct = toPercent(finItem);
        let totalPct = null;
        if (courseTotal?.graderaw!=null) totalPct=Math.round((courseTotal.graderaw/(courseTotal.grademax||100))*100);
        else if (midPct!=null&&finPct!=null) totalPct=Math.round((midPct+finPct)/2);
        else totalPct=midPct??finPct;
        result[course.id]={ items:gradeItems, midterm:midPct, final:finPct, total:totalPct, midName:midItem?.itemname||tx.midterm, finName:finItem?.itemname||tx.final };
      } catch {
        result[course.id]={ items:[], midterm:null, final:null, total:null, midName:tx.midterm, finName:tx.final };
      }
    }
    setGrades(result); setLoadingGrades(false);
  }

  async function loadUpcoming() {
    setLoadingUpcoming(true);
    try {
      const now  = Math.floor(Date.now()/1000);
      const data = await moodle(token,"core_calendar_get_action_events_by_timesort",{timesortfrom:now,limitnum:20});
      setUpcoming(data?.events||[]);
    } catch { setUpcoming([]); }
    setLoadingUpcoming(false);
  }

  async function openCourse(course) {
    setActiveCourse(course); setPage("course");
    await loadCourseContent(course.id);
  }

  function navigate(id) { setPage(id); setActiveCourse(null); setSidebarOpen(false); }

  const card = (extra={}) => ({
    background:"#fff", borderRadius:16, padding:"14px 16px",
    boxShadow:"0 1px 4px rgba(0,0,0,0.06)", border:"1px solid #e2e8f0", ...extra
  });

  const gradeValues = Object.values(grades).map(g=>g.total).filter(v=>v!=null);
  const overallAvg  = gradeValues.length>0 ? Math.round(gradeValues.reduce((a,b)=>a+b,0)/gradeValues.length) : null;

  const NAV = [
    { id:"dashboard",    icon:"⊞", labelEn:"Dashboard",    labelAr:"الرئيسية" },
    { id:"courses",      icon:"📚", labelEn:"Courses",      labelAr:"موادي" },
    { id:"grades",       icon:"📊", labelEn:"Grades",       labelAr:"الدرجات" },
    { id:"certificates", icon:"🏆", labelEn:"Certificates", labelAr:"الشهادات" },
    { id:"profile",      icon:"👤", labelEn:"Profile",      labelAr:"حسابي" },
  ];

  /* ── Grade helpers shared between mobile card and desktop table ── */
  function getGradeScores(c) {
    const cg    = grades[c.id];
    const items = cg?.items||[];
    const attendItem = items.find(it=>/attend|حضور/i.test(it.itemname||""));
    const actItem    = items.find(it=>/activit|نشاط|oral|شفه/i.test(it.itemname||""));
    function rawScore(item,outOf){ if(!item||item.graderaw==null)return null; return Math.round((item.graderaw/(item.grademax||outOf))*outOf); }
    return {
      midScore:  cg?.midterm!=null ? Math.round(cg.midterm*30/100) : null,
      finScore:  cg?.final!=null   ? Math.round(cg.final*50/100)   : null,
      attScore:  attendItem ? rawScore(attendItem,10) : null,
      actScore:  actItem    ? rawScore(actItem,10)    : null,
      total:     cg?.total ?? null,
    };
  }

  /* ── SIDEBAR ── */
  const SidebarContent = () => (
    <div style={{ display:"flex",flexDirection:"column",height:"100%" }}>
      <div style={{ padding:"20px 16px 14px",borderBottom:"1px solid rgba(255,255,255,0.12)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:40,height:40,borderRadius:12,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",border:"1.5px solid rgba(255,255,255,0.3)",flexShrink:0 }}>
            <img src="/logo.png" alt="logo" style={{ width:36,height:36,objectFit:"cover",borderRadius:10 }} onError={e=>{e.currentTarget.style.display="none";e.currentTarget.nextElementSibling.style.display="block";}}/>
            <span style={{ display:"none",fontSize:20 }}>🌱</span>
          </div>
          <div>
            <div style={{ color:"#fff",fontWeight:800,fontSize:13,lineHeight:1.2 }}>{isRtl?SCHOOL.nameAr:SCHOOL.nameEn}</div>
            <div style={{ color:"rgba(255,255,255,0.55)",fontSize:10 }}>Student Portal</div>
          </div>
        </div>
      </div>
      <div style={{ padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.12)" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10,cursor:"pointer" }} onClick={()=>navigate("profile")}>
          <div style={{ width:38,height:38,borderRadius:"50%",background:"rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:14,flexShrink:0,overflow:"hidden",border:"2px solid rgba(255,255,255,0.35)" }}>
            {avatar
              ? <img src={avatar} alt="avatar" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
              : <span>{(user?.nameEn||user?.fullname||"S").charAt(0).toUpperCase()}</span>
            }
          </div>
          <div style={{ minWidth:0 }}>
            <div style={{ color:"#fff",fontWeight:600,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.nameEn||user?.fullname}</div>
            <div style={{ color:"rgba(255,255,255,0.55)",fontSize:10 }}>{user?.username}</div>
          </div>
        </div>
      </div>
      <nav style={{ flex:1,padding:"10px" }}>
        {NAV.map(n=>{
          const active = page===n.id||(page==="course"&&n.id==="courses");
          return (
            <button key={n.id} onClick={()=>navigate(n.id)}
              style={{ display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",border:"none",borderRadius:10,cursor:"pointer",marginBottom:3,
                background:active?"rgba(255,255,255,0.18)":"transparent",
                color:active?"#fff":"rgba(255,255,255,0.6)",
                fontSize:13,fontWeight:active?700:400,textAlign:isRtl?"right":"left" }}>
              <span style={{ fontSize:16,flexShrink:0 }}>{n.icon}</span>
              <span>{isRtl?n.labelAr:n.labelEn}</span>
            </button>
          );
        })}
      </nav>
      <div style={{ padding:"10px 10px 20px",display:"flex",flexDirection:"column",gap:6 }}>
        <button onClick={()=>setLang(l=>l==="en"?"ar":"en")}
          style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 12px",border:"none",borderRadius:10,cursor:"pointer",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.7)",fontSize:12,textAlign:isRtl?"right":"left" }}>
          <span>🌐</span><span>{tx.lang}</span>
        </button>
        <button onClick={onLogout}
          style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 12px",border:"none",borderRadius:10,cursor:"pointer",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.55)",fontSize:12,textAlign:isRtl?"right":"left" }}>
          <span>🚪</span><span>{tx.logout}</span>
        </button>
      </div>
    </div>
  );

  /* ── Grade Mobile Card ── */
  function GradeMobileCard({ c }) {
    const color = courseColor(c.id);
    const { midScore, finScore, attScore, actScore, total } = getGradeScores(c);
    const lg = total!=null ? gradeInfo(total,tx) : null;

    const ScoreBox = ({ val, max, label, clr }) => (
      <div style={{ flex:1,textAlign:"center",padding:"8px 2px",background:clr+"12",borderRadius:10 }}>
        <div style={{ fontSize:9,color:"#64748b",marginBottom:2 }}>{label}</div>
        <div style={{ fontSize:17,fontWeight:900,color:val!=null?clr:"#d1d5db" }}>{val!=null?val:"—"}</div>
        <div style={{ fontSize:9,color:"#94a3b8" }}>/{max}</div>
      </div>
    );

    return (
      <div style={{ ...card({marginBottom:10,overflow:"hidden",padding:0}) }}>
        <div style={{ height:4,background:`linear-gradient(to right,${color},${color}88)` }}/>
        <div style={{ padding:"12px 14px" }}>
          <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:10 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,minWidth:0 }}>
              <div style={{ width:5,height:30,borderRadius:99,background:color,flexShrink:0 }}/>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:13,fontWeight:700,color:"#0f172a",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.fullname}</div>
                {c.shortname&&<div style={{ fontSize:10,color:"#94a3b8" }}>{c.shortname}</div>}
              </div>
            </div>
            {lg&&<Badge {...lg}/>}
          </div>
          <div style={{ display:"flex",gap:5,marginBottom:10 }}>
            <ScoreBox val={midScore} max={30} label={isRtl?"منتصف":"Mid"}     clr="#0ea5e9"/>
            <ScoreBox val={finScore} max={50} label={isRtl?"نهائي":"Final"}   clr="#6366f1"/>
            <ScoreBox val={attScore} max={10} label={isRtl?"حضور":"Attend"}   clr="#10b981"/>
            <ScoreBox val={actScore} max={10} label={isRtl?"نشاط":"Activity"} clr="#f59e0b"/>
          </div>
          {total!=null&&(
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                <span style={{ fontSize:11,color:"#64748b" }}>{isRtl?"المجموع":"Total"}</span>
                <span style={{ fontSize:13,fontWeight:800,color:lg?.color }}>{total}/100</span>
              </div>
              <Bar val={total} color={lg?.color||color} h={6}/>
            </div>
          )}
        </div>
      </div>
    );
  }

  /* ─────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────── */
  return (
    <div style={{ display:"flex",minHeight:"100vh",background:"#f0f4f8",fontFamily:"'Segoe UI',system-ui,sans-serif",direction:isRtl?"rtl":"ltr" }}>

      {/* Desktop Sidebar */}
      {isDesktop && (
        <aside style={{ width:220,height:"100vh",background:`linear-gradient(180deg,${rc},${SCHOOL.dark})`,display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:0,overflowY:"auto" }}>
          <SidebarContent/>
        </aside>
      )}

      {/* Mobile/Tablet Sidebar Overlay */}
      {!isDesktop && sidebarOpen && (
        <div style={{ position:"fixed",inset:0,zIndex:1000,display:"flex" }} onClick={()=>setSidebarOpen(false)}>
          <div style={{ width:260,background:`linear-gradient(180deg,${rc},${SCHOOL.dark})`,height:"100%",overflowY:"auto",flexShrink:0 }} onClick={e=>e.stopPropagation()}>
            <SidebarContent/>
          </div>
          <div style={{ flex:1,background:"rgba(0,0,0,0.5)" }}/>
        </div>
      )}

      {/* Main */}
      <div style={{ flex:1,display:"flex",flexDirection:"column",minWidth:0 }}>

        {/* Header */}
        <header style={{ background:"#fff",padding:`0 ${isMobile?12:20}px`,height:isMobile?52:58,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #e2e8f0",flexShrink:0,gap:10,position:"sticky",top:0,zIndex:100 }}>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            {!isDesktop&&(
              <button onClick={()=>setSidebarOpen(true)}
                style={{ width:36,height:36,border:"1.5px solid #e2e8f0",borderRadius:9,background:"#f8fafc",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
                ☰
              </button>
            )}
            <div>
              <div style={{ fontSize:isMobile?13:15,fontWeight:700,color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:isMobile?160:320 }}>
                {tx.welcome}, {(user?.nameEn||user?.fullname||"").split(" ")[0]} 👋
              </div>
              {!isMobile&&<div style={{ fontSize:11,color:"#94a3b8" }}>{courses.length} {isRtl?"مادة":"courses"} · 🎓 {isRtl?"طالب":"Student"}</div>}
            </div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            {err&&<div style={{ background:"#fee2e2",color:"#dc2626",fontSize:11,padding:"4px 10px",borderRadius:8,border:"1px solid #fca5a5",maxWidth:150,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>⚠️ {err}</div>}
            {isMobile&&(
              <button onClick={()=>setLang(l=>l==="en"?"ar":"en")}
                style={{ padding:"5px 10px",border:"1.5px solid #e2e8f0",borderRadius:8,background:"#f8fafc",cursor:"pointer",fontSize:12,fontWeight:700,color:"#374151" }}>
                🌐 {tx.lang}
              </button>
            )}
            {/* Header avatar */}
            <div onClick={()=>navigate("profile")} style={{ width:34,height:34,borderRadius:"50%",overflow:"hidden",border:`2px solid ${rc}22`,cursor:"pointer",flexShrink:0,background:rc+"18",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:rc }}>
              {avatar
                ? <img src={avatar} alt="avatar" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                : <span>{(user?.nameEn||user?.fullname||"S").charAt(0).toUpperCase()}</span>
              }
            </div>
          </div>
        </header>

        {/* Page */}
        <div style={{ flex:1,padding:isMobile?"12px":"20px",overflowY:"auto",paddingBottom:isMobile?"80px":"20px" }}>

          {/* ══════════════ DASHBOARD ══════════════ */}
          {page==="dashboard"&&(
            <div>
              {loadingCourses?<Spinner color={rc}/>:(
                <>
                  {/* Stats */}
                  <div style={{ display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)",gap:isMobile?10:12,marginBottom:isMobile?12:18 }}>
                    {[
                      {icon:"📚",label:isRtl?"المواد":"Courses",  val:courses.length,                                             c:rc},
                      {icon:"🎯",label:isRtl?"المعدل":"Average",  val:overallAvg!=null?`${overallAvg}%`:"—",                     c:"#059669"},
                      {icon:"🏆",label:isRtl?"الشهادات":"Certs",  val:Object.values(grades).filter(g=>g.total>=85).length,        c:"#f59e0b"},
                      {icon:"📝",label:isRtl?"القادمة":"Upcoming",val:upcoming.length,                                            c:"#7c3aed"},
                    ].map((s,i)=>(
                      <div key={i} style={card()}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                          <div>
                            <p style={{ margin:"0 0 2px",fontSize:10,color:"#64748b" }}>{s.label}</p>
                            <p style={{ margin:0,fontSize:isMobile?22:26,fontWeight:900,color:s.c }}>{s.val}</p>
                          </div>
                          <div style={{ width:32,height:32,borderRadius:9,background:s.c+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15 }}>{s.icon}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Courses + Upcoming */}
                  <div style={{ display:"grid",gridTemplateColumns:isMobile||isTablet?"1fr":"minmax(0,1fr) minmax(0,290px)",gap:14 }}>
                    <div style={card()}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
                        <h3 style={{ margin:0,fontSize:14,fontWeight:700,color:"#0f172a" }}>{tx.myCourses}</h3>
                        <button onClick={()=>setPage("courses")} style={{ background:"none",border:"none",color:rc,fontSize:12,fontWeight:600,cursor:"pointer" }}>{isRtl?"عرض الكل":"View All"}</button>
                      </div>
                      {courses.slice(0,6).map(c=>{
                        const cg=grades[c.id], color=courseColor(c.id);
                        return(
                          <div key={c.id} onClick={()=>openCourse(c)}
                            style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #f1f5f9",cursor:"pointer" }}
                            onMouseEnter={e=>e.currentTarget.style.opacity="0.75"}
                            onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                            <div style={{ width:32,height:32,borderRadius:8,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0 }}>📚</div>
                            <div style={{ flex:1,minWidth:0 }}>
                              <div style={{ fontSize:13,fontWeight:600,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.fullname}</div>
                              {cg?.total!=null&&<Bar val={cg.total} color={color} h={3}/>}
                            </div>
                            {cg?.total!=null&&<span style={{ fontSize:12,fontWeight:700,color,flexShrink:0 }}>{cg.total}%</span>}
                          </div>
                        );
                      })}
                    </div>
                    <div style={card()}>
                      <h3 style={{ margin:"0 0 12px",fontSize:14,fontWeight:700,color:"#0f172a" }}>{tx.upcomingQuizzes}</h3>
                      {loadingUpcoming?<Spinner color={rc}/>:upcoming.length===0?(
                        <div style={{ textAlign:"center",color:"#94a3b8",fontSize:12,padding:"16px 0" }}>✅ {isRtl?"لا توجد مهام":"No upcoming tasks"}</div>
                      ):upcoming.slice(0,6).map((ev,i)=>(
                        <div key={i} style={{ display:"flex",gap:10,paddingBottom:9,marginBottom:9,borderBottom:i<5?"1px solid #f1f5f9":"none" }}>
                          <span style={{ fontSize:16,flexShrink:0 }}>{ev.modulename==="quiz"?"📝":"📋"}</span>
                          <div style={{ minWidth:0 }}>
                            <p style={{ margin:"0 0 2px",fontSize:12,fontWeight:600,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{ev.name}</p>
                            <p style={{ margin:0,fontSize:10,color:"#94a3b8" }}>{ev.timesort?fmtDateTime(ev.timesort,isRtl):"—"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══════════════ MY COURSES ══════════════ */}
          {page==="courses"&&(
            <div>
              <h2 style={{ margin:"0 0 14px",fontSize:isMobile?16:18,fontWeight:800,color:"#0f172a" }}>{tx.myCourses}</h2>
              {loadingCourses?<Spinner color={rc}/>:courses.length===0?(
                <div style={{ ...card({textAlign:"center",padding:48}),color:"#94a3b8" }}>
                  <div style={{ fontSize:48,marginBottom:12 }}>📚</div>
                  <div style={{ fontSize:15,fontWeight:600 }}>{tx.noCoures}</div>
                </div>
              ):(
                <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":isTablet?"repeat(2,1fr)":"repeat(auto-fill,minmax(270px,1fr))",gap:12 }}>
                  {courses.map(c=>{
                    const color=courseColor(c.id), cg=grades[c.id];
                    return(
                      <div key={c.id} onClick={()=>openCourse(c)}
                        style={{ ...card({padding:0,overflow:"hidden",cursor:"pointer",transition:"transform 0.15s,box-shadow 0.15s"}) }}
                        onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 24px rgba(0,0,0,0.1)";}}
                        onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="0 1px 4px rgba(0,0,0,0.06)";}}>
                        <div style={{ height:5,background:`linear-gradient(to right,${color},${color}88)` }}/>
                        <div style={{ padding:"14px" }}>
                          <div style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom:10 }}>
                            <div style={{ width:38,height:38,borderRadius:10,background:color+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>📚</div>
                            <div style={{ flex:1,minWidth:0 }}>
                              <div style={{ fontSize:14,fontWeight:700,color:"#0f172a",lineHeight:1.3,marginBottom:2 }}>{c.fullname}</div>
                              {c.shortname&&<div style={{ fontSize:11,color:"#94a3b8" }}>{c.shortname}</div>}
                            </div>
                          </div>
                          {cg?.total!=null?(
                            <>
                              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                                <span style={{ fontSize:11,color:"#64748b" }}>{tx.total}</span>
                                <span style={{ fontSize:12,fontWeight:700,color }}>{cg.total}%</span>
                              </div>
                              <Bar val={cg.total} color={color} h={5}/>
                              <div style={{ marginTop:8 }}><Badge {...gradeInfo(cg.total,tx)}/></div>
                            </>
                          ):(
                            <div style={{ fontSize:11,color:"#94a3b8",marginTop:4 }}>{isRtl?"انقر لعرض المحتوى":"Click to view content"}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════════ COURSE DETAIL ══════════════ */}
          {page==="course"&&activeCourse&&(
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
                <button onClick={()=>{setPage("courses");setActiveCourse(null);}}
                  style={{ padding:"7px 12px",border:"1.5px solid #e2e8f0",borderRadius:9,background:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,color:"#374151",display:"flex",alignItems:"center",gap:5,flexShrink:0 }}>
                  ← {tx.back}
                </button>
                <div style={{ minWidth:0 }}>
                  <h2 style={{ margin:0,fontSize:isMobile?14:17,fontWeight:800,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{activeCourse.fullname}</h2>
                  {activeCourse.shortname&&<div style={{ fontSize:11,color:"#94a3b8" }}>{activeCourse.shortname}</div>}
                </div>
              </div>

              {loadingContent?<Spinner color={rc}/>:!courseContent[activeCourse.id]?(
                <div style={{ ...card({textAlign:"center",padding:40}),color:"#94a3b8" }}>
                  <div style={{ fontSize:40,marginBottom:10 }}>📭</div>
                  <div>{tx.noCourseContent}</div>
                </div>
              ):(
                <div>
                  {(()=>{
                    const sections=courseContent[activeCourse.id]||[];
                    const allMods=sections.flatMap(s=>s.modules||[]);
                    const quizzes=allMods.filter(m=>m.modname==="quiz");
                    const assigns=allMods.filter(m=>m.modname==="assign");
                    const files  =allMods.filter(m=>["resource","folder","url"].includes(m.modname));
                    const color  =courseColor(activeCourse.id);
                    return(
                      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:isMobile?8:10,marginBottom:14 }}>
                        {[
                          {icon:"📄",label:tx.materials, val:files.length,  c:"#0ea5e9"},
                          {icon:"📝",label:tx.quizzes,   val:quizzes.length,c:"#7c3aed"},
                          {icon:"📋",label:tx.assignments,val:assigns.length,c:"#f59e0b"},
                          {icon:"🗂️",label:tx.sections,  val:sections.filter(s=>s.modules?.length>0).length,c:color},
                        ].map((s,i)=>(
                          <div key={i} style={card()}>
                            <div style={{ fontSize:isMobile?16:20,marginBottom:4 }}>{s.icon}</div>
                            <div style={{ fontSize:isMobile?18:22,fontWeight:900,color:s.c }}>{s.val}</div>
                            <div style={{ fontSize:isMobile?9:11,color:"#64748b" }}>{s.label}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  {courseContent[activeCourse.id].filter(s=>s.modules?.length>0).map((section,si)=>(
                    <div key={section.id} style={{ ...card({marginBottom:10,padding:0,overflow:"hidden"}) }}>
                      <div style={{ padding:"11px 14px",background:`linear-gradient(to ${isRtl?"left":"right"},${courseColor(activeCourse.id)}12,transparent)`,borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:8 }}>
                        <div style={{ width:24,height:24,borderRadius:6,background:courseColor(activeCourse.id)+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:courseColor(activeCourse.id),fontWeight:700,flexShrink:0 }}>{si+1}</div>
                        <div style={{ fontWeight:700,fontSize:13,color:"#0f172a",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{section.name||(isRtl?`الوحدة ${si+1}`:`Section ${si+1}`)}</div>
                        <span style={{ fontSize:10,color:"#94a3b8",flexShrink:0 }}>{section.modules.length} {isRtl?"عنصر":"items"}</span>
                      </div>
                      <div>
                        {section.modules.map((mod,mi)=>{
                          const isQuiz  =mod.modname==="quiz";
                          const isAssign=mod.modname==="assign";
                          const c=isQuiz?"#7c3aed":isAssign?"#f59e0b":"#0ea5e9";
                          return(
                            <div key={mod.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderBottom:mi<section.modules.length-1?"1px solid #f8fafc":"none" }}
                              onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                              onMouseLeave={e=>e.currentTarget.style.background=""}>
                              <div style={{ width:28,height:28,borderRadius:7,background:c+"15",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0 }}>{modIcon(mod.modname)}</div>
                              <div style={{ flex:1,minWidth:0 }}>
                                <div style={{ fontSize:13,fontWeight:600,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{mod.name}</div>
                                <div style={{ fontSize:10,color:"#94a3b8",marginTop:1,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap" }}>
                                  <span style={{ textTransform:"capitalize" }}>{mod.modname}</span>
                                  {(isQuiz||isAssign)&&mod.dates?.find(d=>d.label==="Due")&&(
                                    <span>· {tx.dueDate}: {fmtDate(mod.dates.find(d=>d.label==="Due").timestamp,isRtl)}</span>
                                  )}
                                </div>
                              </div>
                              <div style={{ flexShrink:0 }}>
                                {isQuiz&&<span style={{ background:"#7c3aed15",color:"#7c3aed",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20,border:"1px solid #7c3aed30" }}>{isRtl?"اختبار":"Quiz"}</span>}
                                {isAssign&&<span style={{ background:"#f59e0b15",color:"#f59e0b",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20,border:"1px solid #f59e0b30" }}>{isRtl?"واجب":"Assignment"}</span>}
                                {!isQuiz&&!isAssign&&<span style={{ background:"#0ea5e915",color:"#0ea5e9",fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:20,border:"1px solid #0ea5e930",textTransform:"capitalize" }}>{mod.modname}</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══════════════ GRADES ══════════════ */}
          {page==="grades"&&(
            <div>
              <div style={{ marginBottom:14 }}>
                <h2 style={{ margin:"0 0 3px",fontSize:isMobile?16:20,fontWeight:900,color:"#0f172a" }}>{isRtl?"كشف الدرجات الشامل":"Full Grade Report"}</h2>
                <p style={{ margin:0,fontSize:11,color:"#64748b" }}>{isRtl?"جميع درجات الفصل الدراسي الحالي":"All grades for the current academic term"}</p>
              </div>

              {loadingGrades?<Spinner color={rc}/>:(
                <>
                  {/* Summary */}
                  <div style={{ display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)",gap:isMobile?10:12,marginBottom:14 }}>
                    <div style={{ ...card({display:"flex",alignItems:"center",gap:12}),gridColumn:isMobile?"span 2":"span 1" }}>
                      <div style={{ position:"relative",flexShrink:0 }}>
                        <Ring val={overallAvg??0} size={58} stroke={6} color={overallAvg!=null?gradeInfo(overallAvg,tx).color:"#e2e8f0"}/>
                        <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#0f172a" }}>{overallAvg!=null?`${overallAvg}%`:"—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize:11,color:"#64748b",marginBottom:4 }}>{tx.termAvg}</div>
                        {overallAvg!=null?<Badge {...gradeInfo(overallAvg,tx)}/>:<span style={{ fontSize:11,color:"#94a3b8" }}>—</span>}
                      </div>
                    </div>
                    {[
                      {icon:"📚",label:isRtl?"المواد":"Courses",  val:courses.length,                                                    c:"#0f6cbd"},
                      {icon:"✅",label:isRtl?"ناجح":"Passing",    val:Object.values(grades).filter(g=>g.total!=null&&g.total>=60).length, c:"#059669"},
                      {icon:"🏆",label:isRtl?"تفوق":"Excellent",  val:Object.values(grades).filter(g=>g.total!=null&&g.total>=85).length, c:"#f59e0b"},
                    ].map((s,i)=>(
                      <div key={i} style={card()}>
                        <div style={{ fontSize:18,marginBottom:3 }}>{s.icon}</div>
                        <div style={{ fontSize:22,fontWeight:900,color:s.c }}>{s.val}</div>
                        <div style={{ fontSize:10,color:"#64748b" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Mobile: Cards | Tablet+: Table */}
                  {isMobile?(
                    <div>{courses.map((c,i)=><GradeMobileCard key={c.id} c={c}/>)}</div>
                  ):(
                    <div style={{ background:"#fff",borderRadius:16,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",border:"1px solid #e2e8f0",overflow:"hidden" }}>
                      <div style={{ padding:"13px 18px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8 }}>
                        <div>
                          <h3 style={{ margin:"0 0 2px",fontSize:14,fontWeight:800,color:"#0f172a" }}>{isRtl?"الدرجات التفصيلية":"Detailed Grades"}</h3>
                          <p style={{ margin:0,fontSize:11,color:"#94a3b8" }}>{isRtl?"الدرجة الكلية من 100":"Total grade out of 100"}</p>
                        </div>
                        <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
                          {[{c:"#0ea5e9",l:isRtl?"منتصف":"Midterm"},{c:"#6366f1",l:isRtl?"نهائي":"Final"},{c:"#10b981",l:isRtl?"حضور":"Attend"},{c:"#f59e0b",l:isRtl?"نشاط":"Activity"}].map((x,i)=>(
                            <div key={i} style={{ display:"flex",alignItems:"center",gap:4,fontSize:11,color:"#64748b" }}>
                              <div style={{ width:8,height:8,borderRadius:"50%",background:x.c }}/><span>{x.l}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ overflowX:"auto" }}>
                        <table style={{ width:"100%",borderCollapse:"collapse",minWidth:600 }}>
                          <thead>
                            <tr style={{ background:"#f8fafc" }}>
                              <th style={{ padding:"11px 16px",textAlign:isRtl?"right":"left",fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.05em",borderBottom:"2px solid #e2e8f0",minWidth:150 }}>{isRtl?"المادة":"Subject"}</th>
                              {[
                                {e:"📘",l:isRtl?"منتصف":"Midterm",  s:"/30", c:"#0ea5e9"},
                                {e:"📗",l:isRtl?"نهائي":"Final",    s:"/50", c:"#6366f1"},
                                {e:"✅",l:isRtl?"حضور":"Attend",    s:"/10", c:"#10b981"},
                                {e:"⚡",l:isRtl?"نشاط":"Activity",  s:"/10", c:"#f59e0b"},
                                {e:"🎯",l:isRtl?"المجموع":"Total",  s:"/100",c:"#0f172a"},
                                {e:"",  l:isRtl?"التقدير":"Grade",  s:"",    c:"#64748b"},
                              ].map((h,i)=>(
                                <th key={i} style={{ padding:"10px 10px",textAlign:"center",fontSize:10,fontWeight:700,color:h.c,textTransform:"uppercase",letterSpacing:"0.04em",borderBottom:"2px solid #e2e8f0",whiteSpace:"nowrap" }}>
                                  <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:2 }}>
                                    {h.e&&<span>{h.e}</span>}<span>{h.l}</span>
                                    {h.s&&<span style={{ fontSize:9,color:"#94a3b8",fontWeight:400 }}>{h.s}</span>}
                                  </div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {courses.map((c,i)=>{
                              const color=courseColor(c.id);
                              const {midScore,finScore,attScore,actScore,total}=getGradeScores(c);
                              const finalLg=total!=null?gradeInfo(total,tx):null;

                              function SC({val,max,clr}){
                                if(val==null)return<td style={{padding:"11px 10px",textAlign:"center"}}><span style={{color:"#d1d5db"}}>—</span></td>;
                                const p=Math.round((val/max)*100);
                                return<td style={{padding:"11px 10px",textAlign:"center"}}><div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><span style={{fontSize:15,fontWeight:800,color:clr}}>{val}</span><div style={{width:34,height:3,background:"#f1f5f9",borderRadius:99,overflow:"hidden"}}><div style={{width:`${p}%`,height:"100%",background:clr,borderRadius:99}}/></div><span style={{fontSize:9,color:"#94a3b8"}}>{p}%</span></div></td>;
                              }

                              return(
                                <tr key={c.id} style={{ borderTop:"1px solid #f1f5f9",background:i%2===0?"#fff":"#fafbff" }}
                                  onMouseEnter={e=>e.currentTarget.style.background="#f0f7ff"}
                                  onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"#fff":"#fafbff"}>
                                  <td style={{ padding:"11px 16px" }}>
                                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                                      <div style={{ width:5,height:30,borderRadius:99,background:color,flexShrink:0 }}/>
                                      <div>
                                        <div style={{ fontSize:12,fontWeight:700,color:"#0f172a",lineHeight:1.3 }}>{c.fullname}</div>
                                        {c.shortname&&<div style={{ fontSize:9,color:"#94a3b8" }}>{c.shortname}</div>}
                                      </div>
                                    </div>
                                  </td>
                                  <SC val={midScore} max={30} clr="#0ea5e9"/>
                                  <SC val={finScore} max={50} clr="#6366f1"/>
                                  <SC val={attScore} max={10} clr="#10b981"/>
                                  <SC val={actScore} max={10} clr="#f59e0b"/>
                                  <td style={{ padding:"11px 10px",textAlign:"center" }}>
                                    {total!=null?(
                                      <div style={{ position:"relative",width:38,height:38,margin:"0 auto" }}>
                                        <Ring val={total} size={38} stroke={4} color={finalLg?.color||color}/>
                                        <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:finalLg?.color||color }}>{total}</div>
                                      </div>
                                    ):<span style={{color:"#d1d5db"}}>—</span>}
                                  </td>
                                  <td style={{ padding:"11px 10px",textAlign:"center" }}>
                                    {finalLg?<Badge {...finalLg}/>:<span style={{color:"#d1d5db"}}>—</span>}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          {courses.length>1&&overallAvg!=null&&(
                            <tfoot>
                              <tr style={{ background:"#f0f7ff",borderTop:"2px solid #e2e8f0" }}>
                                <td style={{ padding:"11px 16px",fontWeight:800,fontSize:12,color:"#0f172a" }}>{isRtl?"المعدل الكلي":"Overall Avg"}</td>
                                <td colSpan={4} style={{ padding:"11px 10px",textAlign:"center",fontSize:11,color:"#64748b" }}>{courses.length} {isRtl?"مادة":"subjects"}</td>
                                <td style={{ padding:"11px 10px",textAlign:"center" }}>
                                  <div style={{ position:"relative",width:38,height:38,margin:"0 auto" }}>
                                    <Ring val={overallAvg} size={38} stroke={4} color={gradeInfo(overallAvg,tx).color}/>
                                    <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:gradeInfo(overallAvg,tx).color }}>{overallAvg}</div>
                                  </div>
                                </td>
                                <td style={{ padding:"11px 10px",textAlign:"center" }}><Badge {...gradeInfo(overallAvg,tx)}/></td>
                              </tr>
                            </tfoot>
                          )}
                        </table>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop:10,padding:"8px 14px",background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:10,fontSize:11,color:"#0369a1",display:"flex",alignItems:"center",gap:6 }}>
                    <span>ℹ️</span>
                    <span>{isRtl?"منتصف(30)+نهائي(50)+حضور(10)+نشاط(10)=100":"Midterm(30)+Final(50)+Attend(10)+Activity(10)=100"}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══════════════ CERTIFICATES ══════════════ */}
          {page==="certificates"&&(
            <div>
              <h2 style={{ margin:"0 0 4px",fontSize:isMobile?16:18,fontWeight:800,color:"#0f172a" }}>{tx.certificates}</h2>
              <p style={{ margin:"0 0 14px",fontSize:11,color:"#64748b" }}>{isRtl?"تُمنح الشهادة للمواد التي حصلت فيها على 85% أو أكثر":"Certificates awarded for courses with 85% or above"}</p>

              {certCourse&&(
                <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.75)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:isMobile?8:20,backdropFilter:"blur(4px)" }}>
                  <div style={{ maxWidth:860,width:"100%",maxHeight:"92vh",overflowY:"auto",borderRadius:16 }}>
                    {/* Action buttons */}
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,gap:8,flexWrap:"wrap" }}>
                      <div style={{ display:"flex",gap:8 }}>
                        {/* PDF Download */}
                        <button onClick={downloadCertPdf} disabled={pdfLoading}
                          style={{ padding:"8px 16px",background:pdfLoading?"#94a3b8":`linear-gradient(135deg,${rc},${SCHOOL.dark})`,color:"#fff",border:"none",borderRadius:9,fontWeight:700,fontSize:12,cursor:pdfLoading?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:6,transition:"opacity 0.2s" }}>
                          {pdfLoading?(
                            <><span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block" }}/>{isRtl?"جارٍ التحميل...":"Generating..."}</>
                          ):(
                            <><span>⬇️</span>{isRtl?"تحميل PDF":"Download PDF"}</>
                          )}
                        </button>
                        {/* Print */}
                        <button onClick={()=>window.print()}
                          style={{ padding:"8px 14px",background:"#fff",color:rc,border:`1.5px solid ${rc}`,borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer" }}>
                          🖨️ {tx.certPrint}
                        </button>
                      </div>
                      <button onClick={()=>setCertCourse(null)}
                        style={{ padding:"8px 14px",background:"#fff",color:"#374151",border:"1.5px solid #e2e8f0",borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer" }}>
                        ✕ {isRtl?"إغلاق":"Close"}
                      </button>
                    </div>
                    <Certificate user={user} course={certCourse} pct={grades[certCourse.id]?.total||0} lang={lang} tx={tx} certRef={certRef}/>
                  </div>
                </div>
              )}

              {loadingGrades?<Spinner color={rc}/>:(
                <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":isTablet?"repeat(2,1fr)":"repeat(auto-fill,minmax(260px,1fr))",gap:12 }}>
                  {courses.map(c=>{
                    const cg=grades[c.id], pct=cg?.total;
                    const earned=pct!=null&&pct>=85;
                    const color=courseColor(c.id);
                    const lg=pct!=null?gradeInfo(pct,tx):null;
                    return(
                      <div key={c.id} style={{ ...card({padding:0,overflow:"hidden"}) }}>
                        <div style={{ height:5,background:earned?`linear-gradient(to right,${color},${color}88)`:"#e2e8f0" }}/>
                        <div style={{ padding:"14px" }}>
                          <div style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom:12 }}>
                            <div style={{ fontSize:28,flexShrink:0 }}>{earned?"🏆":"🔒"}</div>
                            <div style={{ flex:1,minWidth:0 }}>
                              <div style={{ fontSize:14,fontWeight:700,color:"#0f172a",lineHeight:1.3,marginBottom:4 }}>{c.fullname}</div>
                              {lg?<Badge {...lg}/>:<span style={{ fontSize:11,color:"#94a3b8" }}>—</span>}
                            </div>
                          </div>
                          {pct!=null&&(
                            <>
                              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                                <span style={{ fontSize:11,color:"#64748b" }}>{tx.score}</span>
                                <span style={{ fontSize:12,fontWeight:700,color:earned?color:"#94a3b8" }}>{pct}%</span>
                              </div>
                              <Bar val={pct} color={earned?color:"#e2e8f0"} h={5}/>
                            </>
                          )}
                          <div style={{ marginTop:12 }}>
                            {earned?(
                              <button onClick={()=>setCertCourse(c)}
                                style={{ width:"100%",padding:"9px",background:`linear-gradient(135deg,${color},${color}cc)`,color:"#fff",border:"none",borderRadius:9,fontWeight:700,fontSize:13,cursor:"pointer" }}>
                                🏆 {tx.certDownload}
                              </button>
                            ):(
                              <div style={{ textAlign:"center",fontSize:11,color:"#94a3b8",padding:"4px 0" }}>
                                🔒 {tx.certUnlockHint}{pct!=null&&` (${85-pct}% ${isRtl?"متبقية":"more needed"})`}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ══════════════ PROFILE ══════════════ */}
          {page==="profile"&&(
            <div>
              <div style={{ marginBottom:18 }}>
                <h2 style={{ margin:"0 0 3px",fontSize:isMobile?16:20,fontWeight:900,color:"#0f172a" }}>{isRtl?"حسابي الشخصي":"My Profile"}</h2>
                <p style={{ margin:0,fontSize:11,color:"#64748b" }}>{isRtl?"تعديل بياناتك الشخصية وكلمة المرور":"Edit your personal information and password"}</p>
              </div>

              {/* ── Avatar + name banner ── */}
              <div style={{ ...card({marginBottom:16,padding:0,overflow:"hidden"}) }}>
                {/* Cover gradient */}
                <div style={{ height:80,background:`linear-gradient(135deg,${rc},${SCHOOL.dark})`,position:"relative" }}>
                  <div style={{ position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.1) 1px,transparent 1px)",backgroundSize:"20px 20px" }}/>
                </div>
                {/* Avatar */}
                <div style={{ padding:"0 20px 20px",position:"relative" }}>
                  <div style={{ position:"relative",display:"inline-block",marginTop:-44 }}>
                    <div style={{ width:88,height:88,borderRadius:"50%",border:"4px solid #fff",overflow:"hidden",background:rc+"22",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(0,0,0,0.12)" }}>
                      {avatar
                        ? <img src={avatar} alt="avatar" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>
                        : <span style={{ fontSize:36,fontWeight:900,color:rc }}>{(user?.nameEn||user?.fullname||"S").charAt(0).toUpperCase()}</span>
                      }
                    </div>
                    {/* Camera overlay button */}
                    <button onClick={()=>avatarInputRef.current?.click()}
                      style={{ position:"absolute",bottom:2,right:2,width:26,height:26,borderRadius:"50%",background:rc,border:"2px solid #fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>
                      📷
                    </button>
                    <input ref={avatarInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatarChange}/>
                  </div>

                  <div style={{ marginTop:10 }}>
                    <div style={{ fontSize:18,fontWeight:800,color:"#0f172a" }}>{user?.nameEn||user?.fullname}</div>
                    <div style={{ fontSize:12,color:"#64748b",marginTop:2 }}>@{user?.username} · 🎓 {isRtl?"طالب":"Student"}</div>
                  </div>

                  {/* Avatar action buttons */}
                  <div style={{ display:"flex",gap:8,marginTop:12,flexWrap:"wrap" }}>
                    <button onClick={()=>avatarInputRef.current?.click()}
                      style={{ padding:"7px 14px",background:rc,color:"#fff",border:"none",borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
                      📷 {isRtl?"تغيير الصورة":"Change Photo"}
                    </button>
                    {avatar&&(
                      <button onClick={removeAvatar}
                        style={{ padding:"7px 14px",background:"#fff",color:"#dc2626",border:"1.5px solid #fca5a5",borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer" }}>
                        🗑️ {isRtl?"حذف الصورة":"Remove Photo"}
                      </button>
                    )}
                  </div>
                  <p style={{ margin:"10px 0 0",fontSize:10,color:"#94a3b8" }}>{isRtl?"JPG أو PNG، أقل من 3MB":"JPG or PNG, less than 3MB"}</p>
                </div>
              </div>

              <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":isTablet?"1fr":"repeat(2,1fr)",gap:14 }}>

                {/* ── Personal Info ── */}
                <div style={card()}>
                  <h3 style={{ margin:"0 0 16px",fontSize:14,fontWeight:800,color:"#0f172a",display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ width:28,height:28,background:rc+"15",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15 }}>👤</span>
                    {isRtl?"البيانات الشخصية":"Personal Information"}
                  </h3>

                  {/* Status message */}
                  {profileMsg&&(
                    <div style={{ marginBottom:14,padding:"10px 14px",background:profileMsg.type==="success"?"#d1fae5":"#fee2e2",color:profileMsg.type==="success"?"#059669":"#dc2626",borderRadius:9,fontSize:12,fontWeight:600,border:`1px solid ${profileMsg.type==="success"?"#6ee7b7":"#fca5a5"}` }}>
                      {profileMsg.text}
                    </div>
                  )}

                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
                    {[
                      { key:"firstName", label:isRtl?"الاسم الأول":"First Name",  placeholder:isRtl?"أدخل الاسم الأول":"Enter first name" },
                      { key:"lastName",  label:isRtl?"اسم العائلة":"Last Name",   placeholder:isRtl?"أدخل اسم العائلة":"Enter last name" },
                    ].map(f=>(
                      <div key={f.key}>
                        <label style={{ display:"block",fontSize:11,fontWeight:700,color:"#64748b",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.04em" }}>{f.label}</label>
                        <input value={profileForm[f.key]} onChange={e=>setProfileForm(p=>({...p,[f.key]:e.target.value}))}
                          placeholder={f.placeholder}
                          style={{ width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:9,fontSize:13,outline:"none",background:"#f8fafc",direction:isRtl?"rtl":"ltr",boxSizing:"border-box" }}
                          onFocus={e=>e.target.style.borderColor=rc}
                          onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
                      </div>
                    ))}
                  </div>

                  {/* Email */}
                  <div style={{ marginBottom:12 }}>
                    <label style={{ display:"block",fontSize:11,fontWeight:700,color:"#64748b",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.04em" }}>{isRtl?"البريد الإلكتروني":"Email"}</label>
                    <div style={{ position:"relative" }}>
                      <span style={{ position:"absolute",top:"50%",transform:"translateY(-50%)",fontSize:14,[isRtl?"right":"left"]:10 }}>✉️</span>
                      <input value={profileForm.email} onChange={e=>setProfileForm(p=>({...p,email:e.target.value}))}
                        type="email" placeholder="example@email.com"
                        style={{ width:"100%",padding:`9px 12px 9px ${isRtl?"12px":"34px"}`,border:"1.5px solid #e2e8f0",borderRadius:9,fontSize:13,outline:"none",background:"#f8fafc",direction:"ltr",boxSizing:"border-box" }}
                        onFocus={e=>e.target.style.borderColor=rc}
                        onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
                    </div>
                  </div>

                  {/* Phone — numbers only, max 11 digits */}
                  <div style={{ marginBottom:12 }}>
                    <label style={{ display:"block",fontSize:11,fontWeight:700,color:"#64748b",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.04em" }}>
                      {isRtl?"رقم الهاتف":"Phone Number"}
                      <span style={{ marginRight:6,marginLeft:6,fontSize:10,color:profileForm.phone.length===11?"#059669":profileForm.phone.length>0?"#f59e0b":"#cbd5e1",fontWeight:600 }}>
                        {profileForm.phone.length}/11
                      </span>
                    </label>
                    <div style={{ position:"relative" }}>
                      <span style={{ position:"absolute",top:"50%",transform:"translateY(-50%)",fontSize:14,[isRtl?"right":"left"]:10 }}>📱</span>
                      <input
                        value={profileForm.phone}
                        onChange={e=>{
                          // Strip anything that is not a digit
                          const digitsOnly = e.target.value.replace(/\D/g,"");
                          // Limit to 11 digits
                          if (digitsOnly.length <= 11) {
                            setProfileForm(p=>({...p, phone: digitsOnly}));
                          }
                        }}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={11}
                        placeholder="01XXXXXXXXX"
                        style={{ width:"100%",padding:`9px 12px 9px ${isRtl?"12px":"34px"}`,border:`1.5px solid ${profileForm.phone.length>0&&profileForm.phone.length!==11?"#f59e0b":"#e2e8f0"}`,borderRadius:9,fontSize:13,outline:"none",background:"#f8fafc",direction:"ltr",boxSizing:"border-box",letterSpacing:"0.05em" }}
                        onFocus={e=>e.target.style.borderColor=rc}
                        onBlur={e=>e.target.style.borderColor=profileForm.phone.length>0&&profileForm.phone.length!==11?"#f59e0b":"#e2e8f0"}/>
                    </div>
                    {profileForm.phone.length>0&&profileForm.phone.length!==11&&(
                      <div style={{ fontSize:10,color:"#f59e0b",marginTop:4,fontWeight:600 }}>
                        {isRtl?"رقم الهاتف يجب أن يكون 11 رقماً":"Phone number must be exactly 11 digits"}
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block",fontSize:11,fontWeight:700,color:"#64748b",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.04em" }}>{isRtl?"نبذة شخصية":"Bio"}</label>
                    <textarea value={profileForm.bio} onChange={e=>setProfileForm(p=>({...p,bio:e.target.value}))}
                      placeholder={isRtl?"اكتب نبذة عنك...":"Write something about yourself..."}
                      rows={3}
                      style={{ width:"100%",padding:"9px 12px",border:"1.5px solid #e2e8f0",borderRadius:9,fontSize:13,outline:"none",background:"#f8fafc",resize:"vertical",direction:isRtl?"rtl":"ltr",fontFamily:"inherit",boxSizing:"border-box" }}
                      onFocus={e=>e.target.style.borderColor=rc}
                      onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
                  </div>

                  {/* Read-only username */}
                  <div style={{ marginBottom:16,padding:"10px 14px",background:"#f8fafc",borderRadius:9,border:"1px solid #e2e8f0" }}>
                    <div style={{ fontSize:10,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.04em",marginBottom:3 }}>{isRtl?"اسم المستخدم (لا يمكن تغييره)":"Username (cannot be changed)"}</div>
                    <div style={{ fontSize:13,fontWeight:700,color:"#374151" }}>@{user?.username}</div>
                  </div>

                  <button onClick={saveProfile} disabled={savingProfile}
                    style={{ width:"100%",padding:"11px",background:savingProfile?"#94a3b8":`linear-gradient(135deg,${rc},${SCHOOL.dark})`,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:savingProfile?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                    {savingProfile
                      ? <><span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block" }}/>{isRtl?"جارٍ الحفظ...":"Saving..."}</>
                      : <>{isRtl?"💾 حفظ التغييرات":"💾 Save Changes"}</>
                    }
                  </button>
                </div>

                {/* ── Change Password ── */}
                <div style={card()}>
                  <h3 style={{ margin:"0 0 16px",fontSize:14,fontWeight:800,color:"#0f172a",display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ width:28,height:28,background:"#7c3aed15",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15 }}>🔐</span>
                    {isRtl?"تغيير كلمة المرور":"Change Password"}
                  </h3>

                  {pwMsg&&(
                    <div style={{ marginBottom:14,padding:"10px 14px",background:pwMsg.type==="success"?"#d1fae5":"#fee2e2",color:pwMsg.type==="success"?"#059669":"#dc2626",borderRadius:9,fontSize:12,fontWeight:600,border:`1px solid ${pwMsg.type==="success"?"#6ee7b7":"#fca5a5"}` }}>
                      {pwMsg.text}
                    </div>
                  )}

                  {[
                    { key:"current", label:isRtl?"كلمة المرور الحالية":"Current Password",     show:showCurrent, toggle:()=>setShowCurrent(v=>!v) },
                    { key:"newPw",   label:isRtl?"كلمة المرور الجديدة":"New Password",         show:showNew,     toggle:()=>setShowNew(v=>!v) },
                    { key:"confirm", label:isRtl?"تأكيد كلمة المرور":"Confirm New Password",   show:showConfirm, toggle:()=>setShowConfirm(v=>!v) },
                  ].map(f=>(
                    <div key={f.key} style={{ marginBottom:14 }}>
                      <label style={{ display:"block",fontSize:11,fontWeight:700,color:"#64748b",marginBottom:5,textTransform:"uppercase",letterSpacing:"0.04em" }}>{f.label}</label>
                      <div style={{ position:"relative" }}>
                        <span style={{ position:"absolute",top:"50%",transform:"translateY(-50%)",fontSize:14,[isRtl?"right":"left"]:10 }}>🔑</span>
                        <input
                          type={f.show?"text":"password"}
                          value={pwForm[f.key]}
                          onChange={e=>setPwForm(p=>({...p,[f.key]:e.target.value}))}
                          placeholder="••••••••"
                          style={{ width:"100%",padding:`9px ${isRtl?"12px":"40px"} 9px ${isRtl?"40px":"34px"}`,border:"1.5px solid #e2e8f0",borderRadius:9,fontSize:13,outline:"none",background:"#f8fafc",direction:"ltr",boxSizing:"border-box" }}
                          onFocus={e=>e.target.style.borderColor="#7c3aed"}
                          onBlur={e=>e.target.style.borderColor="#e2e8f0"}/>
                        {/* Show/hide toggle */}
                        <button onClick={f.toggle} type="button"
                          style={{ position:"absolute",top:"50%",transform:"translateY(-50%)",[isRtl?"left":"right"]:8,background:"none",border:"none",cursor:"pointer",fontSize:15,padding:2,color:"#94a3b8" }}>
                          {f.show?"🙈":"👁️"}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Strength indicator */}
                  {pwForm.newPw&&(()=>{
                    const p = pwForm.newPw;
                    const strength = [p.length>=8, /[A-Z]/.test(p), /[0-9]/.test(p), /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
                    const labels   = ["","Weak","Fair","Good","Strong"];
                    const labelsAr = ["","ضعيفة","مقبولة","جيدة","قوية"];
                    const colors   = ["","#dc2626","#f59e0b","#0ea5e9","#059669"];
                    return(
                      <div style={{ marginBottom:14 }}>
                        <div style={{ display:"flex",gap:4,marginBottom:4 }}>
                          {[1,2,3,4].map(i=><div key={i} style={{ flex:1,height:4,borderRadius:99,background:i<=strength?colors[strength]:"#e2e8f0",transition:"background 0.3s" }}/>)}
                        </div>
                        <div style={{ fontSize:11,color:colors[strength],fontWeight:600 }}>{isRtl?labelsAr[strength]:labels[strength]}</div>
                      </div>
                    );
                  })()}

                  {/* Requirements */}
                  <div style={{ marginBottom:16,padding:"10px 14px",background:"#f8fafc",borderRadius:9,border:"1px solid #e2e8f0" }}>
                    <div style={{ fontSize:10,color:"#64748b",fontWeight:700,marginBottom:6,textTransform:"uppercase" }}>{isRtl?"متطلبات كلمة المرور":"Password Requirements"}</div>
                    {[
                      { check:pwForm.newPw.length>=8,   label:isRtl?"8 أحرف على الأقل":"At least 8 characters" },
                      { check:/[A-Z]/.test(pwForm.newPw), label:isRtl?"حرف كبير":"One uppercase letter" },
                      { check:/[0-9]/.test(pwForm.newPw), label:isRtl?"رقم واحد":"One number" },
                    ].map((r,i)=>(
                      <div key={i} style={{ display:"flex",alignItems:"center",gap:6,fontSize:11,color:r.check?"#059669":"#94a3b8",marginBottom:3 }}>
                        <span>{r.check?"✅":"⭕"}</span><span>{r.label}</span>
                      </div>
                    ))}
                  </div>

                  <button onClick={changePassword} disabled={savingPw}
                    style={{ width:"100%",padding:"11px",background:savingPw?"#94a3b8":"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:savingPw?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
                    {savingPw
                      ? <><span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block" }}/>{isRtl?"جارٍ التغيير...":"Changing..."}</>
                      : <>{isRtl?"🔐 تغيير كلمة المرور":"🔐 Change Password"}</>
                    }
                  </button>

                  {/* Logout all devices note */}
                  <p style={{ margin:"12px 0 0",fontSize:11,color:"#94a3b8",textAlign:"center" }}>
                    {isRtl?"بعد تغيير كلمة المرور ستحتاج لتسجيل الدخول مجدداً":"After changing your password you may need to log in again"}
                  </p>
                </div>
              </div>

              {/* Danger zone */}
              <div style={{ ...card({marginTop:14,borderColor:"#fca5a5",background:"#fff5f5"}) }}>
                <h3 style={{ margin:"0 0 8px",fontSize:13,fontWeight:800,color:"#dc2626",display:"flex",alignItems:"center",gap:8 }}>
                  <span>⚠️</span>{isRtl?"منطقة الخطر":"Danger Zone"}
                </h3>
                <p style={{ margin:"0 0 12px",fontSize:12,color:"#64748b" }}>{isRtl?"تسجيل الخروج من جميع الأجهزة":"Sign out from all devices"}</p>
                <button onClick={onLogout}
                  style={{ padding:"8px 18px",background:"#fff",color:"#dc2626",border:"1.5px solid #fca5a5",borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer" }}>
                  🚪 {isRtl?"تسجيل الخروج":"Sign Out"}
                </button>
              </div>
            </div>
          )}

        </div>{/* end page content */}
      </div>{/* end main */}

      {/* ══ MOBILE BOTTOM NAVIGATION ══ */}
      {isMobile&&(
        <nav style={{ position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:"1px solid #e2e8f0",display:"flex",zIndex:200,boxShadow:"0 -2px 12px rgba(0,0,0,0.08)",paddingBottom:"env(safe-area-inset-bottom,0px)" }}>
          {NAV.map(n=>{
            const active=page===n.id||(page==="course"&&n.id==="courses");
            return(
              <button key={n.id} onClick={()=>navigate(n.id)}
                style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,padding:"8px 4px 6px",border:"none",background:"none",cursor:"pointer",color:active?rc:"#94a3b8" }}>
                <span style={{ fontSize:20 }}>{n.icon}</span>
                <span style={{ fontSize:9,fontWeight:active?700:500 }}>{isRtl?n.labelAr:n.labelEn}</span>
                {active&&<div style={{ width:18,height:3,borderRadius:99,background:rc }}/>}
              </button>
            );
          })}
        </nav>
      )}

      <style>{`
        *{box-sizing:border-box;}
        body{margin:0;}
        @media print{aside,header,nav{display:none!important;}body{background:#fff;}}
      `}</style>
    </div>
  );
}
