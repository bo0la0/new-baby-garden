"use client";
import { useState, useEffect, useRef } from "react";
import SchoolFooter, { SCHOOL as SCHOOL_INFO } from "./SchoolFooter";

/* ═══════════════════════════════════════════════════════════
   NEW BABY GARDEN — STUDENT DASHBOARD
   Theme: Deep navy + sky blue glass — matches login page
═══════════════════════════════════════════════════════════ */

const TX = {
  en: {
    dashboard:"Dashboard", myCourses:"My Courses", grades:"Grades",
    certificates:"Certificates", logout:"Logout", welcome:"Welcome back",
    loading:"Loading...", error:"Something went wrong",
    noCoures:"No courses found", noCourseContent:"No content available",
    materials:"Materials", upcomingQuizzes:"Upcoming", assignments:"Assignments",
    sections:"Sections", dueDate:"Due", timeLimit:"Time limit",
    mins:"min", gradeReport:"Grade Report", course:"Course",
    midterm:"Midterm", final:"Final", total:"Total", letterGrade:"Grade",
    termAvg:"Term Average", excellent:"Excellent", veryGood:"Very Good",
    good:"Good", pass:"Pass", fail:"Fail",
    certEarned:"Certificate Earned", certLocked:"Not Yet Earned",
    certUnlockHint:"Score 85% or above to earn",
    certDownload:"Download Certificate", certPrint:"Print",
    certTitle:"Certificate of Excellence",
    certBody:"has successfully completed the course with outstanding achievement",
    certIssued:"Issued on", certVerify:"Verify at", principal:"School Principal",
    stamp:"Official Seal", score:"Score",
    back:"Back", quizzes:"Quizzes", noGrades:"No grades yet", lang:"عر",
  },
  ar: {
    dashboard:"الرئيسية", myCourses:"موادي", grades:"الدرجات",
    certificates:"الشهادات", logout:"خروج", welcome:"مرحباً بعودتك",
    loading:"جارٍ التحميل...", error:"حدث خطأ ما",
    noCoures:"لا توجد مواد", noCourseContent:"لا يوجد محتوى",
    materials:"المحتوى", upcomingQuizzes:"القادمة", assignments:"الواجبات",
    sections:"الوحدات", dueDate:"موعد التسليم", timeLimit:"المدة",
    mins:"دقيقة", gradeReport:"كشف الدرجات", course:"المادة",
    midterm:"منتصف الفصل", final:"النهائي", total:"المجموع", letterGrade:"التقدير",
    termAvg:"متوسط الفصل", excellent:"ممتاز", veryGood:"جيد جداً",
    good:"جيد", pass:"مقبول", fail:"راسب",
    certEarned:"تم الحصول على الشهادة", certLocked:"لم تحصل عليها بعد",
    certUnlockHint:"احصل على 85% أو أكثر للحصول على الشهادة",
    certDownload:"تحميل الشهادة", certPrint:"طباعة",
    certTitle:"شهادة تفوق وتميز",
    certBody:"أتم المادة الدراسية بنجاح وتفوق مشرف",
    certIssued:"صدرت بتاريخ", certVerify:"للتحقق", principal:"مدير المدرسة",
    stamp:"الختم الرسمي", score:"الدرجة",
    back:"رجوع", quizzes:"الاختبارات", noGrades:"لا توجد درجات بعد", lang:"EN",
  },
};

function useWindowWidth() {
  const [w, setW] = useState(typeof window !== "undefined" ? window.innerWidth : 1024);
  useEffect(() => {
    const fn = () => setW(window.innerWidth);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return w;
}

const COURSE_COLORS = ["#60a5fa","#34d399","#f472b6","#fb923c","#a78bfa","#38bdf8","#4ade80","#f59e0b","#e879f9","#22d3ee"];
function courseColor(id) { return COURSE_COLORS[id % COURSE_COLORS.length]; }

function gradeInfo(pct, tx) {
  if (pct >= 90) return { label:tx.excellent, color:"#059669", bg:"#d1fae5", border:"#6ee7b7" };
  if (pct >= 80) return { label:tx.veryGood,  color:"#1d6fd8", bg:"#dbeafe", border:"#93c5fd" };
  if (pct >= 70) return { label:tx.good,      color:"#0284c7", bg:"#e0f2fe", border:"#7dd3fc" };
  if (pct >= 60) return { label:tx.pass,      color:"#d97706", bg:"#fef3c7", border:"#fcd34d" };
  return               { label:tx.fail,      color:"#dc2626", bg:"#fee2e2", border:"#fca5a5" };
}

function Bar({ val, max=100, color, h=4 }) {
  return (
    <div style={{ background:"#e2eaf5", borderRadius:99, height:h, overflow:"hidden" }}>
      <div style={{ width:`${Math.min(100,(val/max)*100)}%`, height:"100%", background:color, borderRadius:99, transition:"width 1.2s cubic-bezier(0.16,1,0.3,1)" }}/>
    </div>
  );
}

function Ring({ val, size=72, stroke=6, color="#60a5fa" }) {
  const r = (size-stroke)/2, c = 2*Math.PI*r;
  return (
    <svg width={size} height={size} style={{ transform:"rotate(-90deg)", display:"block" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#dbeafe" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c-(Math.min(100,val)/100)*c} strokeLinecap="round"
        style={{ transition:"stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)" }}/>
    </svg>
  );
}

function Badge({ label, color, bg, border }) {
  return <span style={{ background:bg, color, border:`1px solid ${border}`, fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:20, whiteSpace:"nowrap" }}>{label}</span>;
}

function Spinner() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:60 }}>
      <div style={{ width:36, height:36, border:"3px solid #dbeafe", borderTop:"3px solid #1d6fd8", borderRadius:"50%", animation:"spin 0.8s linear infinite" }}/>
    </div>
  );
}

function GlassCard({ children, extra={} }) {
  return (
    <div style={{
      background:"#fff",
      border:"1px solid #e2eaf5",
      borderRadius:16,
      boxShadow:"0 2px 12px rgba(29,111,216,0.07)",
      ...extra,
    }}>{children}</div>
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
  const isRtl = lang==="ar";
  const g = gradeInfo(pct, tx);
  const today = new Date().toLocaleDateString(isRtl?"ar-EG":"en-GB",{year:"numeric",month:"long",day:"numeric"});
  const color = courseColor(course.id);
  return (
    <div ref={certRef} style={{ width:"100%",maxWidth:800,margin:"0 auto",background:"linear-gradient(135deg,#fefdf8,#f0f9ff)",borderRadius:20,position:"relative",overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,0.4)",fontFamily:"Georgia,serif" }}>
      <div style={{ position:"absolute",inset:8,border:"2px solid #60a5fa",borderRadius:16,pointerEvents:"none",zIndex:1,opacity:0.3 }}/>
      <div style={{ position:"absolute",inset:13,border:"1px solid #f59e0b",borderRadius:12,pointerEvents:"none",zIndex:1,opacity:0.4 }}/>
      <div style={{ position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,#60a5fa12 1px,transparent 1px)",backgroundSize:"28px 28px",opacity:0.5 }}/>
      <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:0,opacity:0.03,fontSize:110,fontWeight:900,color:"#0a1628",userSelect:"none" }}>NBG</div>
      <div style={{ position:"relative",zIndex:2,padding:"32px 24px",direction:isRtl?"rtl":"ltr",textAlign:"center" }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:18 }}>
          <div style={{ flex:1,height:1,background:"linear-gradient(to right,transparent,#f59e0b)" }}/>
          <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:6 }}>
            <div style={{ width:60,height:60,borderRadius:"50%",background:"linear-gradient(135deg,#0a1628,#1e3a5f)",display:"flex",alignItems:"center",justifyContent:"center",border:"3px solid #f59e0b",overflow:"hidden" }}>
              <img src="/logo.png" alt="logo" style={{ width:56,height:56,objectFit:"cover",borderRadius:"50%" }} onError={e=>{e.currentTarget.style.display="none";e.currentTarget.nextElementSibling.style.display="block";}}/>
              <span style={{ display:"none",fontSize:28 }}>🌱</span>
            </div>
            <div style={{ fontSize:11,fontWeight:800,color:"#0a1628",letterSpacing:2,textTransform:"uppercase" }}>{isRtl?SCHOOL_INFO.nameAr:SCHOOL_INFO.nameEn}</div>
          </div>
          <div style={{ flex:1,height:1,background:"linear-gradient(to left,transparent,#f59e0b)" }}/>
        </div>
        <div style={{ fontSize:9,letterSpacing:4,color:"#64748b",textTransform:"uppercase",marginBottom:4 }}>{isRtl?"تمنح هذه الشهادة إلى":"This Certificate is Proudly Presented to"}</div>
        <div style={{ fontSize:26,fontWeight:900,color:"#0a1628" }}>{tx.certTitle}</div>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:10,margin:"8px 0 16px" }}>
          <div style={{ height:1,width:40,background:"linear-gradient(to right,transparent,#f59e0b)" }}/>
          <span style={{ color:"#f59e0b",fontSize:16 }}>✦</span>
          <div style={{ height:1,width:40,background:"linear-gradient(to left,transparent,#f59e0b)" }}/>
        </div>
        <div style={{ margin:"0 0 12px",padding:"12px 20px",background:"linear-gradient(135deg,rgba(96,165,250,0.08),rgba(245,158,11,0.08))",borderRadius:12,border:"1px solid rgba(96,165,250,0.2)" }}>
          <div style={{ fontSize:24,fontWeight:900,color:"#0a1628" }}>{user?.nameEn||user?.fullname}</div>
          <div style={{ fontSize:11,color:"#64748b",marginTop:2 }}>{isRtl?"معرف المستخدم":"User ID"}: {user?.username}</div>
        </div>
        <p style={{ fontSize:13,color:"#374151",lineHeight:1.8,margin:"0 0 8px",fontStyle:"italic" }}>{tx.certBody}</p>
        <div style={{ display:"inline-flex",alignItems:"center",gap:8,background:color+"20",border:`1.5px solid ${color}50`,borderRadius:10,padding:"6px 16px",marginBottom:14,fontSize:13,fontWeight:700,color:"#0a1628" }}>
          <span>📚</span><span>{course.fullname}</span>
        </div>
        <div style={{ display:"flex",justifyContent:"center",marginBottom:20 }}>
          <div style={{ display:"inline-flex",alignItems:"center",gap:10,background:"#f0f9ff",border:"1.5px solid #bae6fd",borderRadius:12,padding:"8px 20px" }}>
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
            <div style={{ width:52,height:52,borderRadius:"50%",border:"2px dashed #60a5fa",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 4px",background:"rgba(96,165,250,0.05)" }}>
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
          <div style={{ fontSize:15,color:"#0a1628",fontStyle:"italic",fontFamily:"cursive" }}>{tx.principal}</div>
          <div style={{ fontSize:9,color:"#94a3b8",letterSpacing:2,textTransform:"uppercase",marginTop:2 }}>{isRtl?SCHOOL_INFO.nameAr:SCHOOL_INFO.nameEn}</div>
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

  const token  = user?.token;
  const userId = user?.userId;

  const [page,         setPage]         = useState("dashboard");
  const [activeCourse, setActiveCourse] = useState(null);
  const [certCourse,   setCertCourse]   = useState(null);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [pdfLoading,   setPdfLoading]   = useState(false);
  const [mounted,      setMounted]      = useState(false);
  const certRef = useRef(null);

  useEffect(() => { setTimeout(()=>setMounted(true), 80); }, []);

  const tx    = TX[lang];
  const isRtl = lang === "ar";
  const rc    = SCHOOL_INFO.color;

  // ── Moodle helper ──
  const moodle = async (tkn, fn, params={}) => {
    const res = await fetch("/api/moodle", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ token:tkn, fn, params, lang }),
    });
    const data = await res.json();
    if (data.exception || data.errorcode) throw new Error(data.message || "Moodle error");
    return data;
  };

  const [courses,        setCourses]        = useState([]);
  const [courseContent,  setCourseContent]  = useState({});
  const [grades,         setGrades]         = useState({});
  const [upcoming,       setUpcoming]       = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingContent, setLoadingContent] = useState(false);
  const [loadingGrades,  setLoadingGrades]  = useState(false);
  const [loadingUpcoming,setLoadingUpcoming]= useState(false);
  const [err, setErr] = useState("");

  // ── Profile state ──
  const [avatar,        setAvatar]        = useState(()=>{ try{ return localStorage.getItem(`nbg_avatar_${user?.userId}`)||null; }catch{ return null; } });
  const [profileForm,   setProfileForm]   = useState({ firstName:"", lastName:"", email:"", bio:"" });
  const [pwForm,        setPwForm]        = useState({ current:"", newPw:"", confirm:"" });
  const [profileMsg,    setProfileMsg]    = useState(null);
  const [pwMsg,         setPwMsg]         = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPw,      setSavingPw]      = useState(false);
  const [showCurrent,   setShowCurrent]   = useState(false);
  const [showNew,       setShowNew]       = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const avatarInputRef = useRef(null);

  useEffect(() => { if (token && userId) loadCourses(); }, [token, userId, lang]);
  useEffect(() => {
    if (page==="grades"    && token && userId && courses.length>0 && Object.keys(grades).length===0) loadAllGrades();
    if (page==="dashboard" && token && upcoming.length===0 && courses.length>0) loadUpcoming();
  }, [page, courses]);
  useEffect(() => { if (page==="profile" && token && userId) loadProfile(); }, [page]);
  useEffect(() => { if (isDesktop) setSidebarOpen(false); }, [isDesktop]);

  async function loadCourses() {
    setLoadingCourses(true); setErr("");
    try {
      const data = await moodle(token, "core_enrol_get_users_courses", { userid:userId });
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
        const midPct=toPercent(midItem), finPct=toPercent(finItem);
        let totalPct=null;
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

  async function loadProfile() {
    try {
      const data = await moodle(token, "core_user_get_users_by_field", { field:"id", "values[0]":userId });
      const u = data?.[0];
      if (u) setProfileForm({ firstName:u.firstname||"", lastName:u.lastname||"", email:u.email||"", bio:(u.description||"").replace(/<[^>]*>/g,"") });
    } catch {}
  }

  async function saveProfile() {
    setSavingProfile(true); setProfileMsg(null);
    try {
      const res = await fetch("/api/moodle-admin", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ fn:"core_user_update_users", params:{
          "users[0][id]":userId, "users[0][firstname]":profileForm.firstName,
          "users[0][lastname]":profileForm.lastName, "users[0][email]":profileForm.email,
          "users[0][description]":profileForm.bio,
        }}),
      });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error||"Update failed");
      setProfileMsg({ type:"success", text: lang==="ar"?"تم حفظ البيانات بنجاح ✓":"Profile saved successfully ✓" });
      if (onUserUpdate) onUserUpdate({ ...user, nameEn:`${profileForm.firstName} ${profileForm.lastName}`.trim(), fullname:`${profileForm.firstName} ${profileForm.lastName}`.trim() });
    } catch(e) { setProfileMsg({ type:"error", text:e.message }); }
    setSavingProfile(false);
  }

  async function changePassword() {
    setPwMsg(null);
    if (!pwForm.current)         { setPwMsg({type:"error",text:lang==="ar"?"أدخل كلمة المرور الحالية":"Enter current password"}); return; }
    if (pwForm.newPw.length < 4) { setPwMsg({type:"error",text:lang==="ar"?"كلمة المرور 4 أحرف على الأقل":"Password must be at least 4 characters"}); return; }
    if (pwForm.newPw !== pwForm.confirm) { setPwMsg({type:"error",text:lang==="ar"?"كلمة المرور غير متطابقة":"Passwords do not match"}); return; }
    setSavingPw(true);
    try {
      const loginRes  = await fetch("/api/moodle-login", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ username:user?.username, password:pwForm.current }) });
      const loginData = await loginRes.json();
      if (loginData.error) throw new Error(lang==="ar"?"كلمة المرور الحالية غير صحيحة":"Current password is incorrect");
      const res  = await fetch("/api/moodle-admin", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ fn:"core_user_update_users", params:{"users[0][id]":userId,"users[0][password]":pwForm.newPw} }) });
      const data = await res.json();
      if (!res.ok || data?.error) throw new Error(data?.error||"Password update failed");
      setPwMsg({type:"success",text:lang==="ar"?"تم تغيير كلمة المرور بنجاح ✓":"Password changed successfully ✓"});
      setPwForm({current:"",newPw:"",confirm:""});
    } catch(e) { setPwMsg({type:"error",text:e.message}); }
    setSavingPw(false);
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 3*1024*1024) { alert(lang==="ar"?"الصورة أكبر من 3MB":"Image must be under 3MB"); return; }
    const reader = new FileReader();
    reader.onload = ev => { const d=ev.target.result; setAvatar(d); try{ localStorage.setItem(`nbg_avatar_${userId}`,d); }catch{} };
    reader.readAsDataURL(file);
  }
  function removeAvatar() { setAvatar(null); try{ localStorage.removeItem(`nbg_avatar_${userId}`); }catch{} }

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
      const canvas = await window.html2canvas(certRef.current, { scale:3, useCORS:true, backgroundColor:"#fefdf8", logging:false });
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF({ orientation:"landscape", unit:"mm", format:"a4" });
      const pW=pdf.internal.pageSize.getWidth(), pH=pdf.internal.pageSize.getHeight();
      const ratio=canvas.width/canvas.height;
      let w=pW, h=pW/ratio; if(h>pH){h=pH;w=pH*ratio;}
      pdf.addImage(imgData,"JPEG",(pW-w)/2,(pH-h)/2,w,h);
      const name=(user?.nameEn||user?.fullname||"student").replace(/\s+/g,"_");
      const course=(certCourse?.fullname||"certificate").replace(/\s+/g,"_");
      pdf.save(`certificate_${name}_${course}.pdf`);
    } catch(e) { alert("PDF generation failed: "+e.message); }
    setPdfLoading(false);
  }

  async function openCourse(course) { setActiveCourse(course); setPage("course"); await loadCourseContent(course.id); }
  function navigate(id) { setPage(id); setActiveCourse(null); setSidebarOpen(false); }

  const gradeValues = Object.values(grades).map(g=>g.total).filter(v=>v!=null);
  const overallAvg  = gradeValues.length>0 ? Math.round(gradeValues.reduce((a,b)=>a+b,0)/gradeValues.length) : null;

  function getGradeScores(c) {
    const cg=grades[c.id], items=cg?.items||[];
    const attendItem = items.find(it=>/attend|حضور/i.test(it.itemname||""));
    const actItem    = items.find(it=>/activit|نشاط|oral|شفه/i.test(it.itemname||""));
    function rawScore(item,outOf){ if(!item||item.graderaw==null)return null; return Math.round((item.graderaw/(item.grademax||outOf))*outOf); }
    return {
      midScore: cg?.midterm!=null ? Math.round(cg.midterm*30/100) : null,
      finScore: cg?.final!=null   ? Math.round(cg.final*50/100)   : null,
      attScore: attendItem ? rawScore(attendItem,10) : null,
      actScore: actItem    ? rawScore(actItem,10)    : null,
      total:    cg?.total ?? null,
    };
  }

  const NAV = [
    { id:"dashboard",    icon:"⊞", labelEn:"Dashboard",    labelAr:"الرئيسية" },
    { id:"courses",      icon:"📚", labelEn:"Courses",      labelAr:"موادي" },
    { id:"grades",       icon:"📊", labelEn:"Grades",       labelAr:"الدرجات" },
    { id:"certificates", icon:"🏆", labelEn:"Certificates", labelAr:"الشهادات" },
    { id:"profile",      icon:"👤", labelEn:"Profile",      labelAr:"حسابي" },
  ];

  /* ── SIDEBAR ── */
  const SidebarContent = () => (
    <div style={{ display:"flex",flexDirection:"column",height:"100%",background:"linear-gradient(180deg,#0f4fa3 0%,#1d6fd8 60%,#1a65c8 100%)",position:"relative",overflow:"hidden" }}>
      {/* Background pattern */}
      <div style={{ position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.07) 1px,transparent 1px)",backgroundSize:"24px 24px",pointerEvents:"none" }}/>
      <div style={{ position:"absolute",top:-60,right:-60,width:200,height:200,borderRadius:"50%",background:"rgba(255,255,255,0.04)",pointerEvents:"none" }}/>
      <div style={{ position:"absolute",bottom:-40,left:-40,width:150,height:150,borderRadius:"50%",background:"rgba(255,255,255,0.03)",pointerEvents:"none" }}/>

      {/* Logo */}
      <div style={{ padding:"22px 18px 16px",position:"relative",zIndex:1 }}>
        <div style={{ display:"flex",alignItems:"center",gap:12 }}>
          <div style={{ width:44,height:44,borderRadius:13,overflow:"hidden",border:"2px solid rgba(255,255,255,0.3)",flexShrink:0,boxShadow:"0 4px 16px rgba(0,0,0,0.2)" }}>
            <img src="/logo.png" alt="logo" style={{ width:"100%",height:"100%",objectFit:"cover" }}
              onError={e=>{e.currentTarget.style.display="none";e.currentTarget.nextElementSibling.style.display="flex";}}/>
            <div style={{ display:"none",width:"100%",height:"100%",alignItems:"center",justifyContent:"center",fontSize:20,background:"rgba(255,255,255,0.15)" }}>🌱</div>
          </div>
          <div>
            <div style={{ color:"#fff",fontWeight:800,fontSize:13,lineHeight:1.2,letterSpacing:"-0.01em" }}>{isRtl?SCHOOL_INFO.nameAr:SCHOOL_INFO.nameEn}</div>
            <div style={{ color:"rgba(255,255,255,0.6)",fontSize:9,marginTop:2,fontWeight:500,letterSpacing:"0.04em",textTransform:"uppercase" }}>{isRtl?"بوابة الطالب":"Student Portal"}</div>
          </div>
        </div>
      </div>

      {/* User card */}
      <div style={{ margin:"0 12px 16px",position:"relative",zIndex:1 }} onClick={()=>navigate("profile")}>
        <div style={{ display:"flex",alignItems:"center",gap:10,padding:"12px 14px",background:"rgba(255,255,255,0.12)",borderRadius:14,cursor:"pointer",border:"1px solid rgba(255,255,255,0.15)",transition:"all 0.2s",backdropFilter:"blur(8px)" }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.18)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.12)"}>
          <div style={{ width:38,height:38,borderRadius:"50%",background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:15,flexShrink:0,overflow:"hidden",border:"2px solid rgba(255,255,255,0.35)",boxShadow:"0 2px 8px rgba(0,0,0,0.15)" }}>
            {avatar ? <img src={avatar} alt="avatar" style={{ width:"100%",height:"100%",objectFit:"cover" }}/> : <span>{(user?.nameEn||user?.fullname||"S").charAt(0).toUpperCase()}</span>}
          </div>
          <div style={{ minWidth:0,flex:1 }}>
            <div style={{ color:"#fff",fontWeight:700,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{user?.nameEn||user?.fullname}</div>
            <div style={{ color:"rgba(255,255,255,0.55)",fontSize:10,marginTop:1 }}>@{user?.username}</div>
          </div>
          <span style={{ color:"rgba(255,255,255,0.4)",fontSize:12 }}>{isRtl?"←":"→"}</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex:1,padding:"0 10px",position:"relative",zIndex:1 }}>
        {NAV.map(n=>{
          const active = page===n.id||(page==="course"&&n.id==="courses");
          return (
            <button key={n.id} onClick={()=>navigate(n.id)} style={{
              display:"flex",alignItems:"center",gap:11,width:"100%",
              padding:"11px 14px",border:"none",borderRadius:12,cursor:"pointer",marginBottom:3,
              background:active?"rgba(255,255,255,0.18)":"transparent",
              color:active?"#fff":"rgba(255,255,255,0.6)",
              fontSize:13,fontWeight:active?700:400,
              textAlign:isRtl?"right":"left",
              transition:"all 0.18s",
              boxShadow:active?"0 2px 12px rgba(0,0,0,0.1)":"none",
              position:"relative",
            }}
            onMouseEnter={e=>{ if(!active) e.currentTarget.style.background="rgba(255,255,255,0.09)"; }}
            onMouseLeave={e=>{ if(!active) e.currentTarget.style.background="transparent"; }}>
              {active && <div style={{ position:"absolute",[isRtl?"right":"left"]:0,top:"50%",transform:"translateY(-50%)",width:3,height:20,borderRadius:99,background:"#fff",boxShadow:"0 0 8px rgba(255,255,255,0.6)" }}/>}
              <div style={{ width:32,height:32,borderRadius:9,background:active?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.08)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0,transition:"all 0.18s" }}>
                {n.icon}
              </div>
              <span>{isRtl?n.labelAr:n.labelEn}</span>
              {active && <div style={{ marginLeft:"auto",marginRight:isRtl?"auto":0,width:6,height:6,borderRadius:"50%",background:"rgba(255,255,255,0.7)" }}/>}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding:"12px 10px 20px",display:"flex",flexDirection:"column",gap:4,position:"relative",zIndex:1,borderTop:"1px solid rgba(255,255,255,0.1)" }}>
        <button onClick={()=>setLang(l=>l==="en"?"ar":"en")} style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 14px",border:"none",borderRadius:10,cursor:"pointer",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.7)",fontSize:12,textAlign:isRtl?"right":"left",transition:"all 0.15s" }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.14)"}
          onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}>
          <span>🌐</span><span>{tx.lang}</span>
        </button>
        <button onClick={onLogout} style={{ display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 14px",border:"none",borderRadius:10,cursor:"pointer",background:"rgba(255,255,255,0.05)",color:"rgba(255,255,255,0.45)",fontSize:12,textAlign:isRtl?"right":"left",transition:"all 0.15s" }}
          onMouseEnter={e=>{ e.currentTarget.style.background="rgba(239,68,68,0.2)"; e.currentTarget.style.color="#fca5a5"; }}
          onMouseLeave={e=>{ e.currentTarget.style.background="rgba(255,255,255,0.05)"; e.currentTarget.style.color="rgba(255,255,255,0.45)"; }}>
          <span>🚪</span><span>{tx.logout}</span>
        </button>
      </div>
    </div>
  );

  /* ── Grade Mobile Card ── */
  function GradeMobileCard({ c }) {
    const color = courseColor(c.id);
    const { midScore,finScore,attScore,actScore,total } = getGradeScores(c);
    const lg = total!=null ? gradeInfo(total,tx) : null;
    const ScoreBox = ({val,max,label,clr}) => (
      <div style={{ flex:1,textAlign:"center",padding:"8px 2px",background:clr+"15",borderRadius:10 }}>
        <div style={{ fontSize:9,color:"#64748b",marginBottom:2 }}>{label}</div>
        <div style={{ fontSize:17,fontWeight:900,color:val!=null?clr:"#cbd5e1" }}>{val!=null?val:"—"}</div>
        <div style={{ fontSize:9,color:"#94a3b8" }}>/{max}</div>
      </div>
    );
    return (
      <GlassCard extra={{ marginBottom:10,overflow:"hidden",padding:0 }}>
        <div style={{ height:3,background:`linear-gradient(to right,${color},${color}55)` }}/>
        <div style={{ padding:"12px 14px" }}>
          <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8,marginBottom:10 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,minWidth:0 }}>
              <div style={{ width:4,height:28,borderRadius:99,background:color,flexShrink:0 }}/>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:13,fontWeight:700,color:"#0f172a",lineHeight:1.3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{c.fullname}</div>
              </div>
            </div>
            {lg&&<Badge {...lg}/>}
          </div>
          <div style={{ display:"flex",gap:5,marginBottom:10 }}>
            <ScoreBox val={midScore} max={30} label={isRtl?"منتصف":"Mid"}     clr="#60a5fa"/>
            <ScoreBox val={finScore} max={50} label={isRtl?"نهائي":"Final"}   clr="#a78bfa"/>
            <ScoreBox val={attScore} max={10} label={isRtl?"حضور":"Attend"}   clr="#34d399"/>
            <ScoreBox val={actScore} max={10} label={isRtl?"نشاط":"Activity"} clr="#fb923c"/>
          </div>
          {total!=null&&(
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                <span style={{ fontSize:11,color:"#64748b" }}>{isRtl?"المجموع":"Total"}</span>
                <span style={{ fontSize:13,fontWeight:800,color:lg?.color }}>{total}/100</span>
              </div>
              <Bar val={total} color={lg?.color||color} h={5}/>
            </div>
          )}
        </div>
      </GlassCard>
    );
  }

  /* ─── RENDER ─── */
  return (
    <div style={{ display:"flex",flexDirection:"column",minHeight:"100vh",background:SCHOOL_INFO.bg,fontFamily:"'Segoe UI',system-ui,sans-serif",direction:isRtl?"rtl":"ltr",position:"relative" }}>



      {/* ── HEADER ── */}
      <header style={{ background:"#fff",borderBottom:"1px solid #dbeafe",position:"sticky",top:0,zIndex:200,boxShadow:"0 2px 16px rgba(29,111,216,0.08)",animation:"slideDown 0.5s cubic-bezier(0.16,1,0.3,1)" }}>
        {/* Animated top color strip */}
        <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:"linear-gradient(to right,#1d6fd8,#38bdf8,#1d6fd8)",backgroundSize:"200% 100%",animation:"shimmer 3s linear infinite",zIndex:1 }}/>
        <div style={{ maxWidth:"100%",padding:"0 20px",height:60,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12 }}>
          {/* Logo */}
          <div style={{ display:"flex",alignItems:"center",gap:10,flexShrink:0 }}>
            <div style={{ width:40,height:40,borderRadius:11,overflow:"hidden",border:`2px solid ${SCHOOL_INFO.color}22`,boxShadow:`0 2px 10px ${SCHOOL_INFO.color}15`,flexShrink:0 }}>
              <img src="/logo.png" alt="logo" style={{ width:"100%",height:"100%",objectFit:"cover" }}
                onError={e=>{e.currentTarget.style.display="none";e.currentTarget.nextElementSibling.style.display="flex";}}/>
              <div style={{ display:"none",width:"100%",height:"100%",alignItems:"center",justifyContent:"center",fontSize:18,background:SCHOOL_INFO.light }}>🌱</div>
            </div>
            <div>
              <div style={{ fontSize:14,fontWeight:800,color:"#0f172a",letterSpacing:"-0.02em",lineHeight:1.2 }}>{isRtl?SCHOOL_INFO.nameAr:SCHOOL_INFO.nameEn}</div>
              <div style={{ fontSize:9,color:SCHOOL_INFO.color,fontWeight:600,letterSpacing:"0.03em" }}>{isRtl?SCHOOL_INFO.tagAr:SCHOOL_INFO.tagEn}</div>
            </div>
          </div>
          {/* Center nav — desktop only */}
          <nav className="db-desktop-nav" style={{ display:"flex",alignItems:"center",gap:4,flex:1,justifyContent:"center" }}>
            {NAV.map(n=>{
              const active=page===n.id||(page==="course"&&n.id==="courses");
              return(
                <button key={n.id} onClick={()=>navigate(n.id)} style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 14px",border:"none",borderRadius:9,cursor:"pointer",fontSize:13,fontWeight:active?700:500,background:active?"#eff6ff":"transparent",color:active?"#1d6fd8":"#374151",transition:"all 0.18s",position:"relative" }}>
                  <span style={{ fontSize:14 }}>{n.icon}</span>
                  <span>{isRtl?n.labelAr:n.labelEn}</span>
                  {active&&<div style={{ position:"absolute",bottom:-1,left:"50%",transform:"translateX(-50%)",width:24,height:2,borderRadius:99,background:SCHOOL_INFO.color,animation:"fadeIn 0.3s ease" }}/>}
                </button>
              );
            })}
          </nav>
          {/* Right */}
          <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
            {err&&<div style={{ background:"#fee2e2",color:"#dc2626",fontSize:11,padding:"4px 10px",borderRadius:8,border:"1px solid #fca5a5",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>⚠️ {err}</div>}
            <button onClick={()=>setLang(l=>l==="en"?"ar":"en")} style={{ padding:"6px 14px",border:`1.5px solid ${SCHOOL_INFO.color}30`,borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:700,background:SCHOOL_INFO.light,color:SCHOOL_INFO.color,transition:"all 0.2s" }}>
              {lang==="en"?"عربي":"EN"}
            </button>
            <div onClick={()=>navigate("profile")} style={{ width:34,height:34,borderRadius:"50%",overflow:"hidden",border:`2px solid ${SCHOOL_INFO.color}30`,cursor:"pointer",flexShrink:0,background:SCHOOL_INFO.light,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:SCHOOL_INFO.color,boxShadow:`0 2px 8px ${SCHOOL_INFO.color}20`,transition:"all 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow=`0 4px 16px ${SCHOOL_INFO.color}35`}
              onMouseLeave={e=>e.currentTarget.style.boxShadow=`0 2px 8px ${SCHOOL_INFO.color}20`}>
              {avatar?<img src={avatar} alt="avatar" style={{ width:"100%",height:"100%",objectFit:"cover" }}/>:<span>{(user?.nameEn||user?.fullname||"S").charAt(0).toUpperCase()}</span>}
            </div>
            {!isDesktop&&(
              <button onClick={()=>setSidebarOpen(o=>!o)} style={{ width:36,height:36,border:`1.5px solid #e2eaf5`,borderRadius:9,background:"#f8fafc",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",color:"#374151" }}>☰</button>
            )}
          </div>
        </div>
        {/* Mobile nav pills */}
        {isMobile&&(
          <div style={{ display:"flex",gap:4,padding:"0 12px 10px",overflowX:"auto" }}>
            {NAV.map(n=>{
              const active=page===n.id||(page==="course"&&n.id==="courses");
              return(
                <button key={n.id} onClick={()=>navigate(n.id)} style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",border:"none",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:active?700:500,background:active?SCHOOL_INFO.color:SCHOOL_INFO.light,color:active?"#fff":SCHOOL_INFO.color,whiteSpace:"nowrap",flexShrink:0,transition:"all 0.18s" }}>
                  <span>{n.icon}</span><span>{isRtl?n.labelAr:n.labelEn}</span>
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* ── BODY ROW (sidebar + content) ── */}
      <div style={{ display:"flex",flex:1,minHeight:0 }}>

      {/* ── Desktop Sidebar ── */}
      {isDesktop && (
        <aside style={{ width:240,height:"calc(100vh - 60px)",background:"linear-gradient(180deg,#0f4fa3,#1d6fd8)",display:"flex",flexDirection:"column",flexShrink:0,position:"sticky",top:60,overflowY:"auto",zIndex:50,boxShadow:"4px 0 24px rgba(15,79,163,0.15)" }}>
          <SidebarContent/>
        </aside>
      )}

      {/* ── Mobile Sidebar Overlay ── */}
      {!isDesktop && sidebarOpen && (
        <div style={{ position:"fixed",inset:0,zIndex:1000,display:"flex" }} onClick={()=>setSidebarOpen(false)}>
          <div style={{ width:260,background:"linear-gradient(180deg,#0f4fa3,#1d6fd8)",height:"100%",overflowY:"auto",flexShrink:0,animation:"slideInLeft 0.28s cubic-bezier(0.16,1,0.3,1)" }} onClick={e=>e.stopPropagation()}>
            <SidebarContent/>
          </div>
          <div style={{ flex:1,background:"rgba(0,0,0,0.6)",backdropFilter:"blur(4px)" }}/>
        </div>
      )}

      {/* ── Main ── */}
      <div style={{ flex:1,display:"flex",flexDirection:"column",minWidth:0,position:"relative",zIndex:1 }}>



        {/* ── Page Content ── */}
        <div key={page} style={{ flex:1,padding:isMobile?"14px":"24px",overflowY:"auto",animation:"fadeUp 0.4s cubic-bezier(0.16,1,0.3,1)" }}>

          {/* ══ DASHBOARD ══ */}
          {page==="dashboard"&&(
            <div>
              {loadingCourses?<Spinner/>:(
                <>
                  <div style={{ display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)",gap:isMobile?10:12,marginBottom:isMobile?12:18 }}>
                    {[
                      {icon:"📚",label:isRtl?"المواد":"Courses",   val:courses.length,                                            c:"#60a5fa"},
                      {icon:"🎯",label:isRtl?"المعدل":"Average",   val:overallAvg!=null?`${overallAvg}%`:"—",                    c:"#34d399"},
                      {icon:"🏆",label:isRtl?"الشهادات":"Certs",   val:Object.values(grades).filter(g=>g.total>=85).length,       c:"#fb923c"},
                      {icon:"📝",label:isRtl?"القادمة":"Upcoming", val:upcoming.length,                                           c:"#a78bfa"},
                    ].map((s,i)=>(
                      <GlassCard key={i} extra={{ padding:"16px",animation:`fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) ${i*0.07}s both` }}>
                        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
                          <div>
                            <p style={{ margin:"0 0 4px",fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.06em" }}>{s.label}</p>
                            <p style={{ margin:0,fontSize:isMobile?22:28,fontWeight:900,color:s.c,letterSpacing:"-0.02em" }}>{s.val}</p>
                          </div>
                          <div style={{ width:34,height:34,borderRadius:10,background:s.c+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,border:`1px solid ${s.c}30` }}>{s.icon}</div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:isMobile||isTablet?"1fr":"minmax(0,1fr) minmax(0,280px)",gap:14 }}>
                    <GlassCard extra={{ padding:"18px" }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14 }}>
                        <h3 style={{ margin:0,fontSize:14,fontWeight:700,color:"#0f172a" }}>{tx.myCourses}</h3>
                        <button onClick={()=>setPage("courses")} style={{ background:"none",border:"none",color:"#60a5fa",fontSize:12,fontWeight:600,cursor:"pointer" }}>{isRtl?"عرض الكل":"View All →"}</button>
                      </div>
                      {courses.slice(0,6).map(c=>{
                        const cg=grades[c.id], color=courseColor(c.id);
                        return(
                          <div key={c.id} onClick={()=>openCourse(c)} style={{ display:"flex",alignItems:"center",gap:10,padding:"9px 0",borderBottom:"1px solid #f1f5f9",cursor:"pointer",transition:"opacity 0.15s" }}
                            onMouseEnter={e=>e.currentTarget.style.opacity="0.7"}
                            onMouseLeave={e=>e.currentTarget.style.opacity="1"}>
                            <div style={{ width:32,height:32,borderRadius:9,background:color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,flexShrink:0,border:`1px solid ${color}30` }}>📚</div>
                            <div style={{ flex:1,minWidth:0 }}>
                              <div style={{ fontSize:13,fontWeight:600,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:3 }}>{c.fullname}</div>
                              {cg?.total!=null&&<Bar val={cg.total} color={color} h={3}/>}
                            </div>
                            {cg?.total!=null&&<span style={{ fontSize:12,fontWeight:700,color,flexShrink:0 }}>{cg.total}%</span>}
                          </div>
                        );
                      })}
                    </GlassCard>
                    <GlassCard extra={{ padding:"18px" }}>
                      <h3 style={{ margin:"0 0 14px",fontSize:14,fontWeight:700,color:"#0f172a" }}>{tx.upcomingQuizzes}</h3>
                      {loadingUpcoming?<Spinner/>:upcoming.length===0?(
                        <div style={{ textAlign:"center",color:"#94a3b8",fontSize:12,padding:"20px 0" }}>✅ {isRtl?"لا توجد مهام":"No upcoming tasks"}</div>
                      ):upcoming.slice(0,6).map((ev,i)=>(
                        <div key={i} style={{ display:"flex",gap:10,paddingBottom:10,marginBottom:10,borderBottom:i<5?"1px solid #f1f5f9":"none" }}>
                          <span style={{ fontSize:16,flexShrink:0 }}>{ev.modulename==="quiz"?"📝":"📋"}</span>
                          <div style={{ minWidth:0 }}>
                            <p style={{ margin:"0 0 2px",fontSize:12,fontWeight:600,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{ev.name}</p>
                            <p style={{ margin:0,fontSize:10,color:"#94a3b8" }}>{ev.timesort?fmtDateTime(ev.timesort,isRtl):"—"}</p>
                          </div>
                        </div>
                      ))}
                    </GlassCard>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══ MY COURSES ══ */}
          {page==="courses"&&(
            <div>
              <h2 style={{ margin:"0 0 16px",fontSize:isMobile?16:20,fontWeight:900,color:"#0f172a",letterSpacing:"-0.02em" }}>{tx.myCourses}</h2>
              {loadingCourses?<Spinner/>:courses.length===0?(
                <GlassCard extra={{ textAlign:"center",padding:60,color:"#94a3b8" }}>
                  <div style={{ fontSize:48,marginBottom:12 }}>📚</div>
                  <div style={{ fontSize:15,fontWeight:600 }}>{tx.noCoures}</div>
                </GlassCard>
              ):(
                <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":isTablet?"repeat(2,1fr)":"repeat(auto-fill,minmax(280px,1fr))",gap:14 }}>
                  {courses.map((c,i)=>{
                    const color=courseColor(c.id), cg=grades[c.id];
                    return(
                      <div key={c.id} onClick={()=>openCourse(c)}
                        style={{ background:"#fff",border:"1px solid #e2eaf5",borderRadius:16,padding:0,overflow:"hidden",cursor:"pointer",boxShadow:"0 2px 8px rgba(29,111,216,0.06)",transition:"all 0.22s cubic-bezier(0.16,1,0.3,1)",animation:`fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) ${i*0.05}s both` }}
                        onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.boxShadow=`0 16px 40px rgba(0,0,0,0.35)`;e.currentTarget.style.borderColor=color+"50";}}
                        onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";e.currentTarget.style.borderColor="rgba(255,255,255,0.09)";}}>
                        <div style={{ height:4,background:`linear-gradient(to right,${color},${color}66)` }}/>
                        <div style={{ padding:"16px" }}>
                          <div style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom:12 }}>
                            <div style={{ width:40,height:40,borderRadius:11,background:color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,border:`1px solid ${color}30` }}>📚</div>
                            <div style={{ flex:1,minWidth:0 }}>
                              <div style={{ fontSize:14,fontWeight:700,color:"#0f172a",lineHeight:1.3,marginBottom:2 }}>{c.fullname}</div>
                              {c.shortname&&<div style={{ fontSize:11,color:"#94a3b8" }}>{c.shortname}</div>}
                            </div>
                          </div>
                          {cg?.total!=null?(
                            <>
                              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                                <span style={{ fontSize:11,color:"#64748b" }}>{tx.total}</span>
                                <span style={{ fontSize:12,fontWeight:700,color }}>{cg.total}%</span>
                              </div>
                              <Bar val={cg.total} color={color} h={5}/>
                              <div style={{ marginTop:10 }}><Badge {...gradeInfo(cg.total,tx)}/></div>
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

          {/* ══ COURSE DETAIL ══ */}
          {page==="course"&&activeCourse&&(
            <div>
              <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:16 }}>
                <button onClick={()=>{setPage("courses");setActiveCourse(null);}} style={{ padding:"7px 14px",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,background:"rgba(255,255,255,0.06)",cursor:"pointer",fontSize:13,fontWeight:600,color:"#1e293b",display:"flex",alignItems:"center",gap:5 }}>
                  ← {tx.back}
                </button>
                <div style={{ minWidth:0 }}>
                  <h2 style={{ margin:0,fontSize:isMobile?14:17,fontWeight:800,color:"#fff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{activeCourse.fullname}</h2>
                  {activeCourse.shortname&&<div style={{ fontSize:11,color:"#94a3b8" }}>{activeCourse.shortname}</div>}
                </div>
              </div>
              {loadingContent?<Spinner/>:!courseContent[activeCourse.id]?(
                <GlassCard extra={{ textAlign:"center",padding:40,color:"#94a3b8" }}>
                  <div style={{ fontSize:40,marginBottom:10 }}>📭</div>
                  <div>{tx.noCourseContent}</div>
                </GlassCard>
              ):(
                <div>
                  {(()=>{
                    const sections=courseContent[activeCourse.id]||[];
                    const allMods=sections.flatMap(s=>s.modules||[]);
                    const color=courseColor(activeCourse.id);
                    return(
                      <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:isMobile?8:12,marginBottom:16 }}>
                        {[
                          {icon:"📄",label:tx.materials, val:allMods.filter(m=>["resource","folder","url"].includes(m.modname)).length, c:"#38bdf8"},
                          {icon:"📝",label:tx.quizzes,   val:allMods.filter(m=>m.modname==="quiz").length,  c:"#a78bfa"},
                          {icon:"📋",label:tx.assignments,val:allMods.filter(m=>m.modname==="assign").length,c:"#fb923c"},
                          {icon:"🗂️",label:tx.sections,  val:sections.filter(s=>s.modules?.length>0).length,c:color},
                        ].map((s,i)=>(
                          <GlassCard key={i} extra={{ padding:"14px",textAlign:"center" }}>
                            <div style={{ fontSize:isMobile?16:20,marginBottom:4 }}>{s.icon}</div>
                            <div style={{ fontSize:isMobile?18:22,fontWeight:900,color:s.c }}>{s.val}</div>
                            <div style={{ fontSize:isMobile?9:11,color:"#64748b" }}>{s.label}</div>
                          </GlassCard>
                        ))}
                      </div>
                    );
                  })()}
                  {courseContent[activeCourse.id].filter(s=>s.modules?.length>0).map((section,si)=>(
                    <GlassCard key={section.id} extra={{ marginBottom:12,padding:0,overflow:"hidden" }}>
                      <div style={{ padding:"11px 16px",background:"#f8fafc",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:10 }}>
                        <div style={{ width:24,height:24,borderRadius:6,background:"#dbeafe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#1d6fd8",fontWeight:700,flexShrink:0,border:"1px solid #bfdbfe" }}>{si+1}</div>
                        <div style={{ fontWeight:700,fontSize:13,color:"#fff",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{section.name||(isRtl?`الوحدة ${si+1}`:`Section ${si+1}`)}</div>
                        <span style={{ fontSize:10,color:"#94a3b8",flexShrink:0 }}>{section.modules.length} {isRtl?"عنصر":"items"}</span>
                      </div>
                      {section.modules.map((mod,mi)=>{
                        const isQuiz=mod.modname==="quiz", isAssign=mod.modname==="assign";
                        const c=isQuiz?"#a78bfa":isAssign?"#fb923c":"#38bdf8";
                        return(
                          <div key={mod.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderBottom:mi<section.modules.length-1?"1px solid #f1f5f9":"none",transition:"background 0.15s" }}
                            onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                            onMouseLeave={e=>e.currentTarget.style.background=""}>
                            <div style={{ width:28,height:28,borderRadius:8,background:c+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0,border:`1px solid ${c}25` }}>{modIcon(mod.modname)}</div>
                            <div style={{ flex:1,minWidth:0 }}>
                              <div style={{ fontSize:13,fontWeight:600,color:"#1e293b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{mod.name}</div>
                              <div style={{ fontSize:10,color:"#94a3b8",marginTop:1 }}>
                                <span style={{ textTransform:"capitalize" }}>{mod.modname}</span>
                                {(isQuiz||isAssign)&&mod.dates?.find(d=>d.label==="Due")&&(
                                  <span> · {tx.dueDate}: {fmtDate(mod.dates.find(d=>d.label==="Due").timestamp,isRtl)}</span>
                                )}
                              </div>
                            </div>
                            <span style={{ background:c+"18",color:c,fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:20,border:`1px solid ${c}30`,flexShrink:0,textTransform:"capitalize" }}>{mod.modname}</span>
                          </div>
                        );
                      })}
                    </GlassCard>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ══ GRADES ══ */}
          {page==="grades"&&(
            <div>
              <div style={{ marginBottom:16 }}>
                <h2 style={{ margin:"0 0 3px",fontSize:isMobile?16:20,fontWeight:900,color:"#0f172a",letterSpacing:"-0.02em" }}>{isRtl?"كشف الدرجات الشامل":"Full Grade Report"}</h2>
                <p style={{ margin:0,fontSize:11,color:"#94a3b8" }}>{isRtl?"جميع درجات الفصل الدراسي الحالي":"All grades for the current academic term"}</p>
              </div>
              {loadingGrades?<Spinner/>:(
                <>
                  <div style={{ display:"grid",gridTemplateColumns:isMobile?"repeat(2,1fr)":"repeat(4,1fr)",gap:isMobile?10:12,marginBottom:16 }}>
                    <GlassCard extra={{ display:"flex",alignItems:"center",gap:12,padding:"16px",gridColumn:isMobile?"span 2":"span 1" }}>
                      <div style={{ position:"relative",flexShrink:0 }}>
                        <Ring val={overallAvg??0} size={56} stroke={5} color={overallAvg!=null?gradeInfo(overallAvg,tx).color:"rgba(255,255,255,0.1)"}/>
                        <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:"#fff" }}>{overallAvg!=null?`${overallAvg}%`:"—"}</div>
                      </div>
                      <div>
                        <div style={{ fontSize:11,color:"#64748b",marginBottom:4 }}>{tx.termAvg}</div>
                        {overallAvg!=null?<Badge {...gradeInfo(overallAvg,tx)}/>:<span style={{ fontSize:11,color:"#94a3b8" }}>—</span>}
                      </div>
                    </GlassCard>
                    {[
                      {icon:"📚",label:isRtl?"المواد":"Courses",  val:courses.length, c:"#60a5fa"},
                      {icon:"✅",label:isRtl?"ناجح":"Passing",    val:Object.values(grades).filter(g=>g.total!=null&&g.total>=60).length, c:"#34d399"},
                      {icon:"🏆",label:isRtl?"تفوق":"Excellent",  val:Object.values(grades).filter(g=>g.total!=null&&g.total>=85).length, c:"#fb923c"},
                    ].map((s,i)=>(
                      <GlassCard key={i} extra={{ padding:"16px",textAlign:"center" }}>
                        <div style={{ fontSize:18,marginBottom:4 }}>{s.icon}</div>
                        <div style={{ fontSize:22,fontWeight:900,color:s.c }}>{s.val}</div>
                        <div style={{ fontSize:10,color:"#64748b" }}>{s.label}</div>
                      </GlassCard>
                    ))}
                  </div>
                  {isMobile?(
                    <div>{courses.map(c=><GradeMobileCard key={c.id} c={c}/>)}</div>
                  ):(
                    <GlassCard extra={{ overflow:"hidden",padding:0 }}>
                      <div style={{ padding:"14px 18px",borderBottom:"1px solid rgba(255,255,255,0.06)",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8 }}>
                        <div>
                          <h3 style={{ margin:"0 0 2px",fontSize:14,fontWeight:800,color:"#fff" }}>{isRtl?"الدرجات التفصيلية":"Detailed Grades"}</h3>
                          <p style={{ margin:0,fontSize:11,color:"#94a3b8" }}>{isRtl?"الدرجة الكلية من 100":"Total grade out of 100"}</p>
                        </div>
                        <div style={{ display:"flex",gap:12,flexWrap:"wrap" }}>
                          {[{c:"#60a5fa",l:isRtl?"منتصف":"Midterm"},{c:"#a78bfa",l:isRtl?"نهائي":"Final"},{c:"#34d399",l:isRtl?"حضور":"Attend"},{c:"#fb923c",l:isRtl?"نشاط":"Activity"}].map((x,i)=>(
                            <div key={i} style={{ display:"flex",alignItems:"center",gap:4,fontSize:11,color:"#64748b" }}>
                              <div style={{ width:7,height:7,borderRadius:"50%",background:x.c }}/><span>{x.l}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{ overflowX:"auto" }}>
                        <table style={{ width:"100%",borderCollapse:"collapse",minWidth:600 }}>
                          <thead>
                            <tr style={{ background:"#f8fafc" }}>
                              <th style={{ padding:"11px 18px",textAlign:isRtl?"right":"left",fontSize:10,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:"1px solid rgba(255,255,255,0.07)",minWidth:150 }}>{isRtl?"المادة":"Subject"}</th>
                              {[
                                {l:isRtl?"منتصف":"Mid",   s:"/30", c:"#60a5fa"},
                                {l:isRtl?"نهائي":"Final", s:"/50", c:"#a78bfa"},
                                {l:isRtl?"حضور":"Attend", s:"/10", c:"#34d399"},
                                {l:isRtl?"نشاط":"Act",    s:"/10", c:"#fb923c"},
                                {l:isRtl?"المجموع":"Total",s:"/100",c:"#fff"},
                                {l:isRtl?"التقدير":"Grade",s:"",   c:"rgba(255,255,255,0.4)"},
                              ].map((h,i)=>(
                                <th key={i} style={{ padding:"10px 10px",textAlign:"center",fontSize:10,fontWeight:700,color:h.c,textTransform:"uppercase",letterSpacing:"0.04em",borderBottom:"2px solid #e2e8f0",whiteSpace:"nowrap" }}>
                                  <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:1 }}>
                                    <span>{h.l}</span>
                                    {h.s&&<span style={{ fontSize:9,color:"rgba(255,255,255,0.25)",fontWeight:400 }}>{h.s}</span>}
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
                                if(val==null)return<td style={{padding:"11px 10px",textAlign:"center"}}><span style={{color:"#cbd5e1"}}>—</span></td>;
                                const p=Math.round((val/max)*100);
                                return<td style={{padding:"11px 10px",textAlign:"center"}}><div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><span style={{fontSize:15,fontWeight:800,color:clr}}>{val}</span><div style={{width:32,height:3,background:"#f1f5f9",borderRadius:99,overflow:"hidden"}}><div style={{width:`${p}%`,height:"100%",background:clr,borderRadius:99}}/></div><span style={{fontSize:9,color:"#94a3b8"}}>{p}%</span></div></td>;
                              }
                              return(
                                <tr key={c.id} style={{ borderTop:"1px solid #f1f5f9",background:"transparent",transition:"background 0.15s" }}
                                  onMouseEnter={e=>e.currentTarget.style.background="#f0f7ff"}
                                  onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                                  <td style={{ padding:"11px 18px" }}>
                                    <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                                      <div style={{ width:4,height:28,borderRadius:99,background:color,flexShrink:0 }}/>
                                      <div>
                                        <div style={{ fontSize:12,fontWeight:700,color:"#0f172a",lineHeight:1.3 }}>{c.fullname}</div>
                                        {c.shortname&&<div style={{ fontSize:9,color:"#94a3b8" }}>{c.shortname}</div>}
                                      </div>
                                    </div>
                                  </td>
                                  <SC val={midScore} max={30} clr="#60a5fa"/>
                                  <SC val={finScore} max={50} clr="#a78bfa"/>
                                  <SC val={attScore} max={10} clr="#34d399"/>
                                  <SC val={actScore} max={10} clr="#fb923c"/>
                                  <td style={{ padding:"11px 10px",textAlign:"center" }}>
                                    {total!=null?(
                                      <div style={{ position:"relative",width:38,height:38,margin:"0 auto" }}>
                                        <Ring val={total} size={38} stroke={4} color={finalLg?.color||color}/>
                                        <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:900,color:finalLg?.color||color }}>{total}</div>
                                      </div>
                                    ):<span style={{color:"#cbd5e1"}}>—</span>}
                                  </td>
                                  <td style={{ padding:"11px 10px",textAlign:"center" }}>
                                    {finalLg?<Badge {...finalLg}/>:<span style={{color:"#cbd5e1"}}>—</span>}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          {courses.length>1&&overallAvg!=null&&(
                            <tfoot>
                              <tr style={{ background:"#eff6ff",borderTop:"1px solid #bfdbfe" }}>
                                <td style={{ padding:"11px 18px",fontWeight:800,fontSize:12,color:"#fff" }}>{isRtl?"المعدل الكلي":"Overall Avg"}</td>
                                <td colSpan={4} style={{ padding:"11px 10px",textAlign:"center",fontSize:11,color:"#94a3b8" }}>{courses.length} {isRtl?"مادة":"subjects"}</td>
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
                    </GlassCard>
                  )}
                  <div style={{ marginTop:10,padding:"9px 14px",background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:12,fontSize:11,color:"#0369a1",display:"flex",alignItems:"center",gap:6 }}>
                    <span>ℹ️</span>
                    <span>{isRtl?"منتصف(30)+نهائي(50)+حضور(10)+نشاط(10)=100":"Midterm(30)+Final(50)+Attend(10)+Activity(10)=100"}</span>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ══ CERTIFICATES ══ */}
          {page==="certificates"&&(
            <div>
              <h2 style={{ margin:"0 0 4px",fontSize:isMobile?16:20,fontWeight:900,color:"#0f172a",letterSpacing:"-0.02em" }}>{tx.certificates}</h2>
              <p style={{ margin:"0 0 16px",fontSize:11,color:"#94a3b8" }}>{isRtl?"تُمنح الشهادة للمواد التي حصلت فيها على 85% أو أكثر":"Certificates awarded for courses with 85% or above"}</p>
              {certCourse&&(
                <div style={{ position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:isMobile?8:20,backdropFilter:"blur(8px)",animation:"fadeIn 0.3s ease" }}>
                  <div style={{ maxWidth:860,width:"100%",maxHeight:"92vh",overflowY:"auto",borderRadius:16 }}>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,gap:8,flexWrap:"wrap" }}>
                      <div style={{ display:"flex",gap:8 }}>
                        <button onClick={downloadCertPdf} disabled={pdfLoading}
                          style={{ padding:"9px 18px",background:pdfLoading?"rgba(255,255,255,0.1)":`linear-gradient(135deg,#60a5fa,#3b82f6)`,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:12,cursor:pdfLoading?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:6 }}>
                          {pdfLoading?<><span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block" }}/>{isRtl?"جارٍ التحميل...":"Generating..."}</> : <><span>⬇️</span>{isRtl?"تحميل PDF":"Download PDF"}</>}
                        </button>
                        <button onClick={()=>window.print()} style={{ padding:"9px 14px",background:"rgba(255,255,255,0.08)",color:"#fff",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,fontWeight:700,fontSize:12,cursor:"pointer" }}>
                          🖨️ {tx.certPrint}
                        </button>
                      </div>
                      <button onClick={()=>setCertCourse(null)} style={{ padding:"9px 14px",background:"rgba(255,255,255,0.08)",color:"#fff",border:"1px solid rgba(255,255,255,0.12)",borderRadius:10,fontWeight:700,fontSize:12,cursor:"pointer" }}>
                        ✕ {isRtl?"إغلاق":"Close"}
                      </button>
                    </div>
                    <Certificate user={user} course={certCourse} pct={grades[certCourse.id]?.total||0} lang={lang} tx={tx} certRef={certRef}/>
                  </div>
                </div>
              )}
              {loadingGrades?<Spinner/>:(
                <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":isTablet?"repeat(2,1fr)":"repeat(auto-fill,minmax(260px,1fr))",gap:14 }}>
                  {courses.map((c,i)=>{
                    const cg=grades[c.id], pct=cg?.total;
                    const earned=pct!=null&&pct>=85;
                    const color=courseColor(c.id);
                    const lg=pct!=null?gradeInfo(pct,tx):null;
                    return(
                      <div key={c.id} style={{ background:"#fff",border:`1px solid ${earned?color+"60":"#e2eaf5"}`,borderRadius:18,padding:0,overflow:"hidden",transition:"all 0.22s",animation:`fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) ${i*0.05}s both` }}
                        onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-3px)";e.currentTarget.style.boxShadow=earned?`0 12px 32px ${color}25`:"0 12px 32px rgba(0,0,0,0.3)";}}
                        onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
                        <div style={{ height:4,background:earned?`linear-gradient(to right,${color},${color}66)`:"rgba(255,255,255,0.06)" }}/>
                        <div style={{ padding:"16px" }}>
                          <div style={{ display:"flex",alignItems:"flex-start",gap:10,marginBottom:12 }}>
                            <div style={{ fontSize:28,flexShrink:0 }}>{earned?"🏆":"🔒"}</div>
                            <div style={{ flex:1,minWidth:0 }}>
                              <div style={{ fontSize:14,fontWeight:700,color:"#0f172a",lineHeight:1.3,marginBottom:6 }}>{c.fullname}</div>
                              {lg?<Badge {...lg}/>:<span style={{ fontSize:11,color:"#94a3b8" }}>—</span>}
                            </div>
                          </div>
                          {pct!=null&&(
                            <>
                              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                                <span style={{ fontSize:11,color:"#64748b" }}>{tx.score}</span>
                                <span style={{ fontSize:12,fontWeight:700,color:earned?color:"#64748b" }}>{pct}%</span>
                              </div>
                              <Bar val={pct} color={earned?color:"rgba(255,255,255,0.1)"} h={5}/>
                            </>
                          )}
                          <div style={{ marginTop:14 }}>
                            {earned?(
                              <button onClick={()=>setCertCourse(c)} style={{ width:"100%",padding:"10px",background:`linear-gradient(135deg,${color},${color}aa)`,color:"#fff",border:"none",borderRadius:10,fontWeight:700,fontSize:13,cursor:"pointer",boxShadow:`0 4px 16px ${color}30`,transition:"all 0.2s" }}
                                onMouseEnter={e=>e.currentTarget.style.transform="scale(1.02)"}
                                onMouseLeave={e=>e.currentTarget.style.transform=""}>
                                🏆 {tx.certDownload}
                              </button>
                            ):(
                              <div style={{ textAlign:"center",fontSize:11,color:"#94a3b8",padding:"6px 0" }}>
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

          {/* ══ PROFILE ══ */}
          {page==="profile"&&(
            <div>
              <div style={{ marginBottom:20 }}>
                <h2 style={{ margin:"0 0 3px",fontSize:isMobile?16:20,fontWeight:900,color:"#0f172a",letterSpacing:"-0.02em" }}>{isRtl?"حسابي الشخصي":"My Profile"}</h2>
                <p style={{ margin:0,fontSize:11,color:"#94a3b8" }}>{isRtl?"تعديل بياناتك الشخصية وكلمة المرور":"Edit your personal information and password"}</p>
              </div>
              {/* Avatar banner */}
              <GlassCard extra={{ marginBottom:18,padding:0,overflow:"hidden" }}>
                <div style={{ height:80,background:"linear-gradient(135deg,#1d6fd8,#0f4fa3)",position:"relative",borderBottom:"1px solid #e2eaf5" }}>
                  <div style={{ position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.05) 1px,transparent 1px)",backgroundSize:"20px 20px" }}/>
                </div>
                <div style={{ padding:"0 22px 22px",position:"relative" }}>
                  <div style={{ position:"relative",display:"inline-block",marginTop:-44 }}>
                    <div style={{ width:88,height:88,borderRadius:"50%",border:"4px solid #fff",overflow:"hidden",background:"#dbeafe",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(29,111,216,0.2)" }}>
                      {avatar ? <img src={avatar} alt="avatar" style={{ width:"100%",height:"100%",objectFit:"cover" }}/> : <span style={{ fontSize:36,fontWeight:900,color:"#1d6fd8" }}>{(user?.nameEn||user?.fullname||"S").charAt(0).toUpperCase()}</span>}
                    </div>
                    <button onClick={()=>avatarInputRef.current?.click()} style={{ position:"absolute",bottom:2,right:2,width:26,height:26,borderRadius:"50%",background:"#60a5fa",border:"2px solid rgba(8,18,40,1)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13 }}>📷</button>
                    <input ref={avatarInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleAvatarChange}/>
                  </div>
                  <div style={{ marginTop:10 }}>
                    <div style={{ fontSize:18,fontWeight:800,color:"#0f172a" }}>{user?.nameEn||user?.fullname}</div>
                    <div style={{ fontSize:12,color:"#94a3b8",marginTop:2 }}>@{user?.username} · 🎓 {isRtl?"طالب":"Student"}</div>
                  </div>
                  <div style={{ display:"flex",gap:8,marginTop:12,flexWrap:"wrap" }}>
                    <button onClick={()=>avatarInputRef.current?.click()} style={{ padding:"7px 14px",background:"#dbeafe",color:"#1d6fd8",border:"1px solid #93c5fd",borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer",display:"flex",alignItems:"center",gap:6 }}>
                      📷 {isRtl?"تغيير الصورة":"Change Photo"}
                    </button>
                    {avatar&&(
                      <button onClick={removeAvatar} style={{ padding:"7px 14px",background:"rgba(248,113,113,0.12)",color:"#f87171",border:"1px solid rgba(248,113,113,0.25)",borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer" }}>
                        🗑️ {isRtl?"حذف الصورة":"Remove Photo"}
                      </button>
                    )}
                  </div>
                </div>
              </GlassCard>

              <div style={{ display:"grid",gridTemplateColumns:isMobile?"1fr":"repeat(2,1fr)",gap:16 }}>
                {/* Personal Info */}
                <GlassCard extra={{ padding:"20px" }}>
                  <h3 style={{ margin:"0 0 18px",fontSize:14,fontWeight:800,color:"#fff",display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ width:28,height:28,background:"rgba(96,165,250,0.15)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,border:"1px solid rgba(96,165,250,0.2)" }}>👤</span>
                    {isRtl?"البيانات الشخصية":"Personal Information"}
                  </h3>
                  {profileMsg&&(
                    <div style={{ marginBottom:14,padding:"10px 14px",background:profileMsg.type==="success"?"#d1fae5":"#fee2e2",color:profileMsg.type==="success"?"#059669":"#dc2626",borderRadius:10,fontSize:12,fontWeight:600,border:`1px solid ${profileMsg.type==="success"?"#6ee7b7":"#fca5a5"}` }}>
                      {profileMsg.text}
                    </div>
                  )}
                  <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12 }}>
                    {[{key:"firstName",label:isRtl?"الاسم الأول":"First Name"},{key:"lastName",label:isRtl?"اسم العائلة":"Last Name"}].map(f=>(
                      <div key={f.key}>
                        <label style={{ display:"block",fontSize:10,fontWeight:700,color:"#64748b",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em" }}>{f.label}</label>
                        <input value={profileForm[f.key]} onChange={e=>setProfileForm(p=>({...p,[f.key]:e.target.value}))}
                          style={{ width:"100%",padding:"10px 12px",border:"1.5px solid #e2e8f0",borderRadius:10,fontSize:13,outline:"none",background:"#f8fafc",color:"#0f172a",direction:isRtl?"rtl":"ltr",boxSizing:"border-box",transition:"all 0.2s" }}
                          onFocus={e=>{e.target.style.borderColor="#1d6fd8";e.target.style.boxShadow="0 0 0 3px #dbeafe";}}
                          onBlur={e=>{e.target.style.borderColor="#e2e8f0";e.target.style.boxShadow="none";}}/>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom:12 }}>
                    <label style={{ display:"block",fontSize:10,fontWeight:700,color:"#64748b",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em" }}>{isRtl?"البريد الإلكتروني":"Email"}</label>
                    <input value={profileForm.email} onChange={e=>setProfileForm(p=>({...p,email:e.target.value}))} type="email"
                      style={{ width:"100%",padding:"10px 12px",border:"1.5px solid #e2e8f0",borderRadius:10,fontSize:13,outline:"none",background:"#f8fafc",color:"#0f172a",direction:"ltr",boxSizing:"border-box",transition:"all 0.2s" }}
                      onFocus={e=>{e.target.style.borderColor="rgba(96,165,250,0.6)";e.target.style.boxShadow="0 0 0 3px rgba(96,165,250,0.12)";}}
                      onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,0.1)";e.target.style.boxShadow="none";}}/>
                  </div>
                  <div style={{ marginBottom:16 }}>
                    <label style={{ display:"block",fontSize:10,fontWeight:700,color:"#64748b",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em" }}>{isRtl?"نبذة شخصية":"Bio"}</label>
                    <textarea value={profileForm.bio} onChange={e=>setProfileForm(p=>({...p,bio:e.target.value}))} rows={3}
                      style={{ width:"100%",padding:"10px 12px",border:"1.5px solid #e2e8f0",borderRadius:10,fontSize:13,outline:"none",background:"#f8fafc",color:"#0f172a",resize:"vertical",direction:isRtl?"rtl":"ltr",fontFamily:"inherit",boxSizing:"border-box",transition:"all 0.2s" }}
                      onFocus={e=>{e.target.style.borderColor="rgba(96,165,250,0.6)";e.target.style.boxShadow="0 0 0 3px rgba(96,165,250,0.12)";}}
                      onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,0.1)";e.target.style.boxShadow="none";}}/>
                  </div>
                  <div style={{ marginBottom:16,padding:"10px 14px",background:"#f8fafc",borderRadius:10,border:"1px solid #e2e8f0" }}>
                    <div style={{ fontSize:10,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:3 }}>{isRtl?"اسم المستخدم (لا يمكن تغييره)":"Username (cannot be changed)"}</div>
                    <div style={{ fontSize:13,fontWeight:700,color:"#374151" }}>@{user?.username}</div>
                  </div>
                  <button onClick={saveProfile} disabled={savingProfile} style={{ width:"100%",padding:"12px",background:savingProfile?"#94a3b8":`linear-gradient(135deg,${SCHOOL_INFO.color},${SCHOOL_INFO.dark})`,color:"#fff",border:"none",borderRadius:11,fontWeight:700,fontSize:13,cursor:savingProfile?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all 0.2s",boxShadow:savingProfile?"none":`0 4px 16px ${SCHOOL_INFO.color}30` }}>
                    {savingProfile?<><span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block" }}/>{isRtl?"جارٍ الحفظ...":"Saving..."}</>:<>{isRtl?"💾 حفظ التغييرات":"💾 Save Changes"}</>}
                  </button>
                </GlassCard>

                {/* Change Password */}
                <GlassCard extra={{ padding:"20px" }}>
                  <h3 style={{ margin:"0 0 18px",fontSize:14,fontWeight:800,color:"#fff",display:"flex",alignItems:"center",gap:8 }}>
                    <span style={{ width:28,height:28,background:"rgba(167,139,250,0.15)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,border:"1px solid rgba(167,139,250,0.2)" }}>🔐</span>
                    {isRtl?"تغيير كلمة المرور":"Change Password"}
                  </h3>
                  {pwMsg&&(
                    <div style={{ marginBottom:14,padding:"10px 14px",background:pwMsg.type==="success"?"#d1fae5":"#fee2e2",color:pwMsg.type==="success"?"#059669":"#dc2626",borderRadius:10,fontSize:12,fontWeight:600,border:`1px solid ${pwMsg.type==="success"?"#6ee7b7":"#fca5a5"}` }}>
                      {pwMsg.text}
                    </div>
                  )}
                  {[
                    {key:"current",label:isRtl?"كلمة المرور الحالية":"Current Password",show:showCurrent,toggle:()=>setShowCurrent(v=>!v)},
                    {key:"newPw",  label:isRtl?"كلمة المرور الجديدة":"New Password",     show:showNew,    toggle:()=>setShowNew(v=>!v)},
                    {key:"confirm",label:isRtl?"تأكيد كلمة المرور":"Confirm Password",  show:showConfirm,toggle:()=>setShowConfirm(v=>!v)},
                  ].map(f=>(
                    <div key={f.key} style={{ marginBottom:14 }}>
                      <label style={{ display:"block",fontSize:10,fontWeight:700,color:"#64748b",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em" }}>{f.label}</label>
                      <div style={{ position:"relative" }}>
                        <input type={f.show?"text":"password"} value={pwForm[f.key]} onChange={e=>setPwForm(p=>({...p,[f.key]:e.target.value}))} placeholder="••••••••"
                          style={{ width:"100%",padding:"10px 40px 10px 12px",border:"1.5px solid #e2e8f0",borderRadius:10,fontSize:13,outline:"none",background:"#f8fafc",color:"#0f172a",direction:"ltr",boxSizing:"border-box",transition:"all 0.2s" }}
                          onFocus={e=>{e.target.style.borderColor="#7c3aed";e.target.style.boxShadow="0 0 0 3px #ede9fe";}}
                          onBlur={e=>{e.target.style.borderColor="#e2e8f0";e.target.style.boxShadow="none";}}/>
                        <button onClick={f.toggle} type="button" style={{ position:"absolute",top:"50%",transform:"translateY(-50%)",right:10,background:"none",border:"none",cursor:"pointer",fontSize:15,color:"#94a3b8",padding:2,transition:"color 0.2s" }}
                          onMouseEnter={e=>e.currentTarget.style.color="#a78bfa"}
                          onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.3)"}>
                          {f.show?"🙈":"👁️"}
                        </button>
                      </div>
                    </div>
                  ))}
                  {pwForm.newPw&&(()=>{
                    const p=pwForm.newPw;
                    const strength=[p.length>=8,/[A-Z]/.test(p),/[0-9]/.test(p),/[^A-Za-z0-9]/.test(p)].filter(Boolean).length;
                    const colors=["","#f87171","#fb923c","#60a5fa","#34d399"];
                    const labels=["","Weak","Fair","Good","Strong"];
                    const labelsAr=["","ضعيفة","مقبولة","جيدة","قوية"];
                    return(
                      <div style={{ marginBottom:14 }}>
                        <div style={{ display:"flex",gap:4,marginBottom:4 }}>
                          {[1,2,3,4].map(i=><div key={i} style={{ flex:1,height:3,borderRadius:99,background:i<=strength?colors[strength]:"rgba(255,255,255,0.08)",transition:"background 0.3s" }}/>)}
                        </div>
                        <div style={{ fontSize:11,color:colors[strength],fontWeight:600 }}>{isRtl?labelsAr[strength]:labels[strength]}</div>
                      </div>
                    );
                  })()}
                  <div style={{ marginBottom:16,padding:"10px 14px",background:"#f8fafc",borderRadius:10,border:"1px solid #e2e8f0" }}>
                    {[
                      {check:pwForm.newPw.length>=8,   label:isRtl?"8 أحرف على الأقل":"At least 8 characters"},
                      {check:/[A-Z]/.test(pwForm.newPw),label:isRtl?"حرف كبير":"One uppercase letter"},
                      {check:/[0-9]/.test(pwForm.newPw), label:isRtl?"رقم واحد":"One number"},
                    ].map((r,i)=>(
                      <div key={i} style={{ display:"flex",alignItems:"center",gap:6,fontSize:11,color:r.check?"#34d399":"rgba(255,255,255,0.3)",marginBottom:3 }}>
                        <span>{r.check?"✅":"⭕"}</span><span>{r.label}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={changePassword} disabled={savingPw} style={{ width:"100%",padding:"12px",background:savingPw?"#94a3b8":"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"#fff",border:"none",borderRadius:11,fontWeight:700,fontSize:13,cursor:savingPw?"not-allowed":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all 0.2s",boxShadow:savingPw?"none":"0 4px 16px rgba(124,58,237,0.25)" }}>
                    {savingPw?<><span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block" }}/>{isRtl?"جارٍ التغيير...":"Changing..."}</> : <>{isRtl?"🔐 تغيير كلمة المرور":"🔐 Change Password"}</>}
                  </button>
                </GlassCard>
              </div>

              {/* Danger zone */}
              <div style={{ marginTop:16,padding:"16px 18px",background:"#fff5f5",border:"1px solid #fca5a5",borderRadius:14 }}>
                <h3 style={{ margin:"0 0 6px",fontSize:13,fontWeight:800,color:"#f87171",display:"flex",alignItems:"center",gap:8 }}>⚠️ {isRtl?"منطقة الخطر":"Danger Zone"}</h3>
                <p style={{ margin:"0 0 12px",fontSize:12,color:"#94a3b8" }}>{isRtl?"تسجيل الخروج من جميع الأجهزة":"Sign out from all devices"}</p>
                <button onClick={onLogout} style={{ padding:"8px 18px",background:"rgba(248,113,113,0.12)",color:"#f87171",border:"1px solid rgba(248,113,113,0.25)",borderRadius:9,fontWeight:700,fontSize:12,cursor:"pointer" }}>
                  🚪 {isRtl?"تسجيل الخروج":"Sign Out"}
                </button>
              </div>
            </div>
          )}

        </div>{/* end page */}
      </div>{/* end main */}

      </div>{/* end body row */}
      {!isMobile&&<SchoolFooter lang={lang} isRtl={isRtl} compact={true}/>}

      {/* ══ MOBILE BOTTOM NAV ══ */}
      {isMobile&&(
        <nav style={{ position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:"1px solid #e2eaf5",display:"flex",zIndex:200,boxShadow:"0 -2px 12px rgba(29,111,216,0.1)",paddingBottom:"env(safe-area-inset-bottom,0px)" }}>
          {NAV.map(n=>{
            const active=page===n.id||(page==="course"&&n.id==="courses");
            return(
              <button key={n.id} onClick={()=>navigate(n.id)} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:2,padding:"8px 4px 6px",border:"none",background:"none",cursor:"pointer",color:active?"#1d6fd8":"#94a3b8",transition:"color 0.15s" }}>
                <span style={{ fontSize:20 }}>{n.icon}</span>
                <span style={{ fontSize:9,fontWeight:active?700:500 }}>{isRtl?n.labelAr:n.labelEn}</span>
                {active&&<div style={{ width:18,height:2,borderRadius:99,background:"#1d6fd8" }}/>}
              </button>
            );
          })}
        </nav>
      )}

      <style>{`
        * { box-sizing:border-box; }
        body { margin:0; background:#f0f4f8; }
        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:transparent; }
        ::-webkit-scrollbar-thumb { background:#bfdbfe; border-radius:99px; }
        ::-webkit-scrollbar-thumb:hover { background:#1d6fd8; }
        @keyframes spin         { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp       { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn       { from{opacity:0} to{opacity:1} }
        @keyframes slideDown    { from{opacity:0;transform:translateY(-12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes slideInLeft  { from{transform:translateX(-100%)} to{transform:translateX(0)} }
        @keyframes shimmer      { 0%{background-position:0% 0} 100%{background-position:200% 0} }
        .db-desktop-nav { display:flex !important; }
        @media (max-width:768px) { .db-desktop-nav { display:none !important; } }
        @media print { aside,header,nav,footer,button{display:none!important;} body{background:#fff;} }
      `}</style>
    </div>
  );
}
