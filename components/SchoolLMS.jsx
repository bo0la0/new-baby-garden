"use client";
import { useState, useRef } from "react";

const SCHOOL = {
  nameEn: "New Baby Garden",
  nameAr: "روضة النجم الجديد",
  tagEn: "Nurturing Tomorrow's Leaders",
  tagAr: "نرعى قادة الغد",
  color: "#0f6cbd",
  colorDark: "#0a4a8f",
  accent: "#f59e0b",
};

const TX = {
  en: {
    dashboard:"Dashboard", grades:"Grades", attendance:"Attendance",
    teacher:"Teacher Panel", parent:"Parent Portal", certificates:"Certificates",
    welcome:"Welcome back", logout:"Logout",
    gpa:"Overall Average", attendanceRate:"Attendance Rate",
    activeCourses:"Active Subjects", completed:"Completed",
    subject:"Subject", midterm:"Midterm", final:"Final",
    homework:"Homework", total:"Total", gradeLetter:"Grade",
    excellent:"Excellent", veryGood:"Very Good", good:"Good", pass:"Pass", fail:"Fail",
    present:"Present", absent:"Absent", late:"Late", excused:"Excused",
    enterGrade:"Enter Grade", saveGrades:"Save Grades",
    markAttendance:"Mark Attendance", save:"Save",
    childProgress:"Child Progress", viewReport:"View Report",
    downloadCert:"Download Certificate", certTitle:"Certificate of Excellence",
    certBody:"has successfully completed the academic year with outstanding achievement",
    certIssued:"Issued on", certVerify:"Verify at",
    connectMoodle:"Connect Moodle", connected:"Moodle Connected ✓",
    demo:"Demo Mode", viewAll:"View All", announcement:"Announcements",
    gradeReport:"Grade Report", principal:"School Principal", stamp:"Official Seal",
    certEarned:"Certificate Earned!", certPending:"In Progress",
    moodleUrl:"Moodle URL", token:"API Token", connect:"Connect",
    menu:"Menu", close:"Close",
  },
  ar: {
    dashboard:"الرئيسية", grades:"الدرجات", attendance:"الحضور",
    teacher:"لوحة المعلم", parent:"بوابة ولي الأمر", certificates:"الشهادات",
    welcome:"مرحباً بعودتك", logout:"تسجيل الخروج",
    gpa:"المعدل العام", attendanceRate:"نسبة الحضور",
    activeCourses:"المواد الفعالة", completed:"مكتملة",
    subject:"المادة", midterm:"منتصف الفصل", final:"النهائي",
    homework:"الواجبات", total:"المجموع", gradeLetter:"التقدير",
    excellent:"ممتاز", veryGood:"جيد جداً", good:"جيد", pass:"مقبول", fail:"راسب",
    present:"حاضر", absent:"غائب", late:"متأخر", excused:"معذور",
    enterGrade:"إدخال الدرجة", saveGrades:"حفظ الدرجات",
    markAttendance:"تسجيل الحضور", save:"حفظ",
    childProgress:"تقدم الطفل", viewReport:"عرض التقرير",
    downloadCert:"تحميل الشهادة", certTitle:"شهادة تفوق وتميز",
    certBody:"أتم العام الدراسي بنجاح وتفوق مشرف",
    certIssued:"صدرت بتاريخ", certVerify:"للتحقق",
    connectMoodle:"ربط Moodle", connected:"متصل بـ Moodle ✓",
    demo:"وضع العرض", viewAll:"عرض الكل", announcement:"الإعلانات",
    gradeReport:"كشف الدرجات", principal:"مدير المدرسة", stamp:"الختم الرسمي",
    certEarned:"تم الحصول على الشهادة!", certPending:"قيد الإنجاز",
    moodleUrl:"رابط Moodle", token:"رمز API", connect:"اتصال",
    menu:"القائمة", close:"إغلاق",
  },
};

const GRADES_DATA = [
  { id:1, enName:"Arabic Language",  arName:"اللغة العربية",  icon:"ع", color:"#ef4444", mid:44, fin:45, hw:10, total:99 },
  { id:2, enName:"Mathematics",      arName:"الرياضيات",       icon:"∑", color:"#6366f1", mid:40, fin:42, hw:9,  total:91 },
  { id:3, enName:"English Language", arName:"اللغة الإنجليزية",icon:"E", color:"#0ea5e9", mid:38, fin:41, hw:9,  total:88 },
  { id:4, enName:"Science",          arName:"العلوم",          icon:"🔬",color:"#10b981", mid:36, fin:38, hw:8,  total:82 },
  { id:5, enName:"Islamic Studies",  arName:"التربية الإسلامية",icon:"☪",color:"#f59e0b", mid:43, fin:44, hw:10, total:97 },
  { id:6, enName:"Art & Drawing",    arName:"الفنون والرسم",   icon:"🎨",color:"#ec4899", mid:45, fin:45, hw:10, total:100},
];

const STUDENTS = [
  { id:"NBG-001", nameEn:"Layla Hassan",  nameAr:"ليلى حسن",   avatar:"لح", grade:"KG2", gpa:94, attendance:97 },
  { id:"NBG-002", nameEn:"Omar Khalid",   nameAr:"عمر خالد",   avatar:"عخ", grade:"KG1", gpa:78, attendance:88 },
  { id:"NBG-003", nameEn:"Nour Ahmed",    nameAr:"نور أحمد",   avatar:"نأ", grade:"KG2", gpa:86, attendance:92 },
];

const ATTENDANCE_DAYS = [
  {date:"Sun 2",status:"present"},{date:"Mon 3",status:"present"},{date:"Tue 4",status:"late"},
  {date:"Wed 5",status:"present"},{date:"Thu 6",status:"present"},{date:"Sun 9",status:"absent"},
  {date:"Mon 10",status:"present"},{date:"Tue 11",status:"present"},{date:"Wed 12",status:"excused"},
  {date:"Thu 13",status:"present"},{date:"Sun 16",status:"present"},{date:"Mon 17",status:"present"},
  {date:"Tue 18",status:"present"},{date:"Wed 19",status:"present"},{date:"Thu 20",status:"late"},
  {date:"Sun 23",status:"present"},{date:"Mon 24",status:"present"},{date:"Tue 25",status:"present"},
  {date:"Wed 26",status:"present"},{date:"Thu 27",status:"present"},
];

const ANNOUNCEMENTS = [
  {en:"Final exams schedule posted for next week",ar:"نشر جدول الامتحانات النهائية للأسبوع القادم",time:"2h",icon:"📋"},
  {en:"School trip to Science Museum on Thursday",ar:"رحلة مدرسية لمتحف العلوم يوم الخميس",time:"1d",icon:"🚌"},
  {en:"Parent meeting: Sunday 10 AM",ar:"اجتماع أولياء الأمور: الأحد الساعة 10 صباحاً",time:"2d",icon:"👨‍👩‍👧"},
];

function gradeInfo(score, tx) {
  if (score>=90) return {label:tx.excellent,color:"#059669",bg:"#d1fae5",border:"#6ee7b7"};
  if (score>=80) return {label:tx.veryGood, color:"#4f46e5",bg:"#e0e7ff",border:"#a5b4fc"};
  if (score>=70) return {label:tx.good,     color:"#0284c7",bg:"#e0f2fe",border:"#7dd3fc"};
  if (score>=60) return {label:tx.pass,     color:"#d97706",bg:"#fef3c7",border:"#fcd34d"};
  return              {label:tx.fail,     color:"#dc2626",bg:"#fee2e2",border:"#fca5a5"};
}

function Bar({val,max=100,color,h=5}) {
  return (
    <div style={{background:"#e2e8f0",borderRadius:99,height:h,overflow:"hidden"}}>
      <div style={{width:`${Math.min(100,(val/max)*100)}%`,height:"100%",background:color,borderRadius:99,transition:"width 1s ease"}}/>
    </div>
  );
}

function Ring({val,size=72,stroke=7,color="#0f6cbd"}) {
  const r=(size-stroke)/2, c=2*Math.PI*r;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={c} strokeDashoffset={c-(val/100)*c} strokeLinecap="round"
        style={{transition:"stroke-dashoffset 1s ease"}}/>
    </svg>
  );
}

function Badge({label,color,bg,border}) {
  return <span style={{background:bg,color,border:`1px solid ${border}`,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,whiteSpace:"nowrap"}}>{label}</span>;
}

// ── CERTIFICATE ──────────────────────────────────────────────
function Certificate({student, lang, tx}) {
  const isRtl = lang==="ar";
  const avg = Math.round(GRADES_DATA.reduce((a,b)=>a+b.total,0)/GRADES_DATA.length);
  const g = gradeInfo(avg, tx);
  const today = new Date().toLocaleDateString(isRtl?"ar-EG":"en-GB",{year:"numeric",month:"long",day:"numeric"});
  return (
    <div style={{
      width:"100%", maxWidth:780, margin:"0 auto",
      background:"linear-gradient(135deg,#fefdf8,#f0f9ff)",
      borderRadius:20, position:"relative", overflow:"hidden",
      boxShadow:"0 20px 60px rgba(15,107,189,0.18)",
      fontFamily:"Georgia,serif",
    }}>
      <div style={{position:"absolute",inset:8,border:"2px solid #0f6cbd",borderRadius:16,pointerEvents:"none",zIndex:1,opacity:0.25}}/>
      <div style={{position:"absolute",inset:13,border:"1px solid #f59e0b",borderRadius:12,pointerEvents:"none",zIndex:1,opacity:0.35}}/>
      <div style={{position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,#0f6cbd18 1px,transparent 1px)",backgroundSize:"28px 28px",opacity:0.4}}/>
      <div style={{position:"relative",zIndex:2,padding:"40px 48px",direction:isRtl?"rtl":"ltr",textAlign:"center"}}>
        {/* Header */}
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:14,marginBottom:20}}>
          <div style={{flex:1,height:1,background:"linear-gradient(to right,transparent,#f59e0b)"}}/>
          <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
            <div style={{width:64,height:64,borderRadius:"50%",background:"linear-gradient(135deg,#0f6cbd,#0a4a8f)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(15,107,189,0.3)",border:"2.5px solid #f59e0b",overflow:"hidden"}}>
              <img src="/logo.png" alt="logo" style={{width:56,height:56,objectFit:"cover",borderRadius:"50%"}} onError={e=>{e.currentTarget.style.display="none"}}/>
            </div>
            <div style={{fontSize:12,fontWeight:800,color:"#0f6cbd",letterSpacing:2,textTransform:"uppercase"}}>{isRtl?SCHOOL.nameAr:SCHOOL.nameEn}</div>
          </div>
          <div style={{flex:1,height:1,background:"linear-gradient(to left,transparent,#f59e0b)"}}/>
        </div>
        {/* Title */}
        <div style={{fontSize:11,letterSpacing:5,color:"#64748b",textTransform:"uppercase",marginBottom:6}}>{isRtl?"تمنح هذه الشهادة إلى":"This Certificate is Proudly Presented to"}</div>
        <div style={{fontSize:34,fontWeight:900,color:"#0a4a8f",letterSpacing:-0.5,fontFamily:"Georgia,serif"}}>{tx.certTitle}</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:10,margin:"10px 0 20px"}}>
          <div style={{height:1,width:50,background:"linear-gradient(to right,transparent,#f59e0b)"}}/>
          <span style={{color:"#f59e0b",fontSize:16}}>✦</span>
          <div style={{height:1,width:50,background:"linear-gradient(to left,transparent,#f59e0b)"}}/>
        </div>
        {/* Student */}
        <div style={{margin:"0 0 16px",padding:"14px 32px",background:"linear-gradient(135deg,rgba(15,107,189,0.06),rgba(245,158,11,0.06))",borderRadius:12,border:"1px solid rgba(15,107,189,0.12)"}}>
          <div style={{fontSize:30,fontWeight:900,color:"#0f6cbd"}}>{isRtl?student?.nameAr||"ليلى حسن":student?.nameEn||"Layla Hassan"}</div>
          <div style={{fontSize:12,color:"#64748b",marginTop:3}}>{isRtl?"الرقم":"ID"}: {student?.id||"NBG-001"}</div>
        </div>
        <p style={{fontSize:14,color:"#374151",lineHeight:1.8,margin:"0 0 16px",fontStyle:"italic"}}>{tx.certBody}</p>
        {/* Grade */}
        <div style={{display:"inline-flex",alignItems:"center",gap:10,background:g.bg,border:`1.5px solid ${g.border}`,borderRadius:12,padding:"10px 24px",marginBottom:24}}>
          <span style={{fontSize:20}}>🏆</span>
          <div>
            <div style={{fontSize:10,color:"#64748b"}}>{isRtl?"المعدل النهائي":"Final Average"}</div>
            <div style={{fontSize:20,fontWeight:900,color:g.color}}>{avg}% — {g.label}</div>
          </div>
        </div>
        {/* Footer row */}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,alignItems:"flex-end"}}>
          <div style={{textAlign:"center"}}>
            <div style={{height:1,background:"#cbd5e1",marginBottom:6}}/>
            <div style={{fontSize:10,color:"#64748b"}}>{tx.certIssued}</div>
            <div style={{fontSize:12,fontWeight:700,color:"#1e293b",marginTop:2}}>{today}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{width:56,height:56,borderRadius:"50%",border:"2px dashed #0f6cbd",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 5px",background:"rgba(15,107,189,0.05)"}}>
              <span style={{fontSize:24}}>🌱</span>
            </div>
            <div style={{fontSize:9,color:"#94a3b8"}}>{tx.stamp}</div>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{width:52,height:52,margin:"0 auto 5px",background:"#1e293b",borderRadius:6,display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,padding:3}}>
              {Array.from({length:49},(_,i)=>(
                <div key={i} style={{background:[0,1,2,7,8,9,14,15,16,6,13,20,3,10,17,24,25,26,27,28,34,35,36,21,42,43,44,30,37,47,48,46,45,41].includes(i)?"#fff":"transparent",borderRadius:1}}/>
              ))}
            </div>
            <div style={{fontSize:9,color:"#94a3b8"}}>{tx.certVerify}</div>
          </div>
        </div>
        <div style={{marginTop:16,paddingTop:14,borderTop:"1px solid #e2e8f0",textAlign:"center"}}>
          <div style={{fontSize:15,color:"#0f6cbd",fontStyle:"italic",fontFamily:"cursive"}}>{tx.principal}</div>
          <div style={{fontSize:9,color:"#94a3b8",letterSpacing:2,textTransform:"uppercase",marginTop:2}}>{isRtl?SCHOOL.nameAr:SCHOOL.nameEn}</div>
        </div>
      </div>
    </div>
  );
}

// ── MOODLE MODAL ─────────────────────────────────────────────
function MoodleModal({lang,tx,onConnect,onClose}) {
  const [url,setUrl]=useState("http://localhost");
  const [token,setToken]=useState("");
  const [busy,setBusy]=useState(false);
  const [err,setErr]=useState("");
  const isRtl=lang==="ar";
  async function connect(){
    setBusy(true);setErr("");
    try{
      const res=await fetch("/api/moodle",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({moodleUrl:url,token,fn:"core_webservice_get_site_info",params:{}})});
      const d=await res.json();
      if(d.error||d.errorcode) throw new Error(d.message||d.error);
      onConnect({url,token,name:d.sitename,user:d.fullname});
    }catch(e){setErr(e.message||"Connection failed");}
    setBusy(false);
  }
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",backdropFilter:"blur(4px)",padding:16}}>
      <div style={{background:"#fff",borderRadius:20,padding:32,width:420,maxWidth:"100%",direction:isRtl?"rtl":"ltr",boxShadow:"0 20px 60px rgba(0,0,0,0.2)"}}>
        <h2 style={{margin:"0 0 4px",fontSize:18,fontWeight:800}}>{tx.connectMoodle}</h2>
        <p style={{margin:"0 0 20px",fontSize:12,color:"#64748b"}}>{isRtl?"أدخل بيانات Moodle 4.5":"Enter your Moodle 4.5 credentials"}</p>
        {[{l:tx.moodleUrl,v:url,s:setUrl,p:"http://localhost"},{l:tx.token,v:token,s:setToken,p:"your-token",t:"password"}].map((f,i)=>(
          <div key={i} style={{marginBottom:14}}>
            <label style={{display:"block",fontSize:12,fontWeight:700,color:"#374151",marginBottom:5}}>{f.l}</label>
            <input value={f.v} onChange={e=>f.s(e.target.value)} type={f.t||"text"} placeholder={f.p}
              style={{width:"100%",padding:"10px 14px",border:"1.5px solid #e2e8f0",borderRadius:10,fontSize:14,boxSizing:"border-box",outline:"none"}}/>
          </div>
        ))}
        {err&&<p style={{color:"#ef4444",fontSize:13,marginBottom:12}}>{err}</p>}
        <div style={{display:"flex",gap:10}}>
          <button onClick={connect} disabled={busy} style={{flex:1,padding:12,background:"linear-gradient(135deg,#0f6cbd,#0a4a8f)",color:"#fff",border:"none",borderRadius:10,fontSize:14,fontWeight:700,cursor:"pointer"}}>{busy?"...":tx.connect}</button>
          <button onClick={onClose} style={{flex:1,padding:12,background:"#f1f5f9",color:"#374151",border:"none",borderRadius:10,fontSize:14,fontWeight:600,cursor:"pointer"}}>{isRtl?"إلغاء":"Cancel"}</button>
        </div>
      </div>
    </div>
  );
}

// ══ MAIN DASHBOARD ════════════════════════════════════════════
export default function SchoolLMS({user, onLogout, lang, setLang}) {
  const [page,setPage]=useState("dashboard");
  const [moodle,setMoodle]=useState(null);
  const [showModal,setShowModal]=useState(false);
  const [selectedStudent,setSelectedStudent]=useState(STUDENTS[0]);
  const [teacherGrades,setTeacherGrades]=useState(GRADES_DATA.reduce((a,s)=>({...a,[s.id]:s.total}),{}));
  const [attendanceState,setAttendanceState]=useState(ATTENDANCE_DAYS.reduce((a,d)=>({...a,[d.date]:d.status}),{}));
  const [saved,setSaved]=useState(false);
  const [sidebarOpen,setSidebarOpen]=useState(false); // mobile sidebar
  const certRef=useRef();
  const tx=TX[lang];
  const isRtl=lang==="ar";
  const role=user?.role||"student";
  const avg=Math.round(GRADES_DATA.reduce((a,b)=>a+b.total,0)/GRADES_DATA.length);
  const g=gradeInfo(avg,tx);
  const ROLE_COLORS={student:"#0f6cbd",teacher:"#059669",parent:"#7c3aed",admin:"#dc2626"};
  const rc=ROLE_COLORS[role]||"#0f6cbd";

  const NAV=[
    {id:"dashboard",icon:"⊞",roles:["student","teacher","parent","admin"]},
    {id:"grades",   icon:"📊",roles:["student","teacher","parent","admin"]},
    {id:"attendance",icon:"✅",roles:["student","teacher","parent","admin"]},
    {id:"teacher",  icon:"👩‍🏫",roles:["teacher","admin"]},
    {id:"parent",   icon:"👨‍👩‍👧",roles:["parent"]},
    {id:"certificates",icon:"🏆",roles:["student","parent"]},
  ].filter(n=>n.roles.includes(role));

  function saveHandler(){setSaved(true);setTimeout(()=>setSaved(false),2500);}
  function navigateTo(p){setPage(p);setSidebarOpen(false);}

  const card=(extra={})=>({background:"#fff",borderRadius:16,padding:"18px 20px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)",border:"1px solid #e2e8f0",...extra});

  // ── Sidebar content (shared between desktop + mobile) ──
  const SidebarContent = () => (
    <>
      {/* School brand */}
      <div style={{padding:"20px 16px 14px",borderBottom:"1px solid rgba(255,255,255,0.12)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:40,height:40,borderRadius:12,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",border:"1.5px solid rgba(255,255,255,0.3)",flexShrink:0}}>
            <img src="/logo.png" alt="logo" style={{width:36,height:36,objectFit:"cover",borderRadius:10}} onError={e=>{e.currentTarget.style.display="none";e.currentTarget.nextElementSibling.style.display="block";}}/>
            <span style={{display:"none",fontSize:20}}>🌱</span>
          </div>
          <div>
            <div style={{color:"#fff",fontWeight:800,fontSize:13,lineHeight:1.2}}>{isRtl?SCHOOL.nameAr:SCHOOL.nameEn}</div>
            <div style={{color:"rgba(255,255,255,0.55)",fontSize:10}}>{isRtl?SCHOOL.tagAr:SCHOOL.tagEn}</div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div style={{padding:"12px 16px",borderBottom:"1px solid rgba(255,255,255,0.12)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:"50%",background:"rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:800,fontSize:13,flexShrink:0}}>
            {(isRtl?user?.nameAr:user?.nameEn||"U").charAt(0)}
          </div>
          <div>
            <div style={{color:"#fff",fontWeight:600,fontSize:13}}>{isRtl?user?.nameAr:user?.nameEn}</div>
            <div style={{color:"rgba(255,255,255,0.55)",fontSize:11}}>{user?.userId}</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{flex:1,padding:"10px 10px"}}>
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>navigateTo(n.id)}
            style={{display:"flex",alignItems:"center",gap:10,width:"100%",padding:"10px 12px",border:"none",borderRadius:10,cursor:"pointer",marginBottom:3,textAlign:isRtl?"right":"left",background:page===n.id?"rgba(255,255,255,0.18)":"transparent",color:page===n.id?"#fff":"rgba(255,255,255,0.6)",fontSize:13,fontWeight:page===n.id?700:400,transition:"all 0.15s"}}>
            <span style={{fontSize:16,flexShrink:0}}>{n.icon}</span>
            <span>{tx[n.id]}</span>
          </button>
        ))}
      </nav>

      {/* Bottom */}
      <div style={{padding:"10px 10px 20px",display:"flex",flexDirection:"column",gap:6}}>
        <button onClick={()=>setShowModal(true)}
          style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 12px",border:"none",borderRadius:10,cursor:"pointer",background:moodle?"rgba(255,255,255,0.2)":"rgba(255,255,255,0.08)",color:moodle?"#6ee7b7":"rgba(255,255,255,0.55)",fontSize:12,textAlign:isRtl?"right":"left"}}>
          <span>🔗</span><span>{moodle?tx.connected:tx.connectMoodle}</span>
        </button>
        <button onClick={onLogout}
          style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 12px",border:"none",borderRadius:10,cursor:"pointer",background:"rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.55)",fontSize:12,textAlign:isRtl?"right":"left"}}>
          <span>🚪</span><span>{tx.logout}</span>
        </button>
      </div>
    </>
  );

  return (
    <div style={{display:"flex",minHeight:"100vh",background:"#f0f4f8",fontFamily:"'Segoe UI',system-ui,sans-serif",direction:isRtl?"rtl":"ltr"}}>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside style={{width:220,minHeight:"100vh",background:`linear-gradient(180deg,${rc} 0%,${rc}dd 100%)`,display:"flex",flexDirection:"column",flexShrink:0}} className="desktop-sidebar">
        <SidebarContent/>
      </aside>

      {/* ── MOBILE SIDEBAR OVERLAY ── */}
      {sidebarOpen && (
        <div style={{position:"fixed",inset:0,zIndex:1000,display:"flex"}}>
          <div style={{width:240,background:`linear-gradient(180deg,${rc} 0%,${rc}dd 100%)`,display:"flex",flexDirection:"column",height:"100%",overflowY:"auto"}}>
            <SidebarContent/>
          </div>
          <div style={{flex:1,background:"rgba(0,0,0,0.5)"}} onClick={()=>setSidebarOpen(false)}/>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minHeight:"100vh",minWidth:0}}>

        {/* Top bar */}
        <header style={{background:"#fff",padding:"0 20px",height:58,display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #e2e8f0",flexShrink:0,gap:12}}>
          {/* Hamburger (mobile) */}
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <button onClick={()=>setSidebarOpen(true)} className="mobile-menu-btn"
              style={{width:36,height:36,border:"1.5px solid #e2e8f0",borderRadius:9,background:"#f8fafc",cursor:"pointer",fontSize:16,display:"none",alignItems:"center",justifyContent:"center"}}>
              ☰
            </button>
            <div>
              <div style={{fontSize:15,fontWeight:700,color:"#0f172a",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",maxWidth:"50vw"}}>
                {tx.welcome}, {isRtl?user?.nameAr?.split(" ")[0]:user?.nameEn?.split(" ")[0]} 👋
              </div>
              <div style={{fontSize:11,color:"#94a3b8"}}>{moodle?tx.connected:tx.demo}</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
            {saved&&<span style={{background:"#d1fae5",color:"#059669",fontSize:11,fontWeight:600,padding:"4px 10px",borderRadius:20}}>✓ {isRtl?"تم":"Saved"}</span>}
            <button onClick={()=>setLang(l=>l==="en"?"ar":"en")}
              style={{padding:"6px 14px",border:"1.5px solid #e2e8f0",borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:700,background:"#f8fafc",color:"#374151"}}>
              {lang==="en"?"عر":"EN"}
            </button>
          </div>
        </header>

        {/* Page */}
        <div style={{flex:1,padding:"20px",overflowY:"auto"}}>

          {/* ── DASHBOARD ── */}
          {page==="dashboard"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:12,marginBottom:18}}>
                {[
                  {label:tx.gpa,val:`${avg}%`,sub:g.label,icon:"🎯",c:rc},
                  {label:tx.attendanceRate,val:"94%",sub:isRtl?"من الحصص":"of sessions",icon:"✅",c:"#059669"},
                  {label:tx.activeCourses,val:6,sub:isRtl?"هذا الفصل":"this term",icon:"📚",c:"#7c3aed"},
                  {label:tx.completed,val:3,sub:isRtl?"مكتملة":"done",icon:"🏆",c:"#f59e0b"},
                ].map((s,i)=>(
                  <div key={i} style={card()}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <p style={{margin:"0 0 2px",fontSize:11,color:"#64748b",fontWeight:500}}>{s.label}</p>
                        <p style={{margin:"0 0 2px",fontSize:26,fontWeight:900,color:s.c}}>{s.val}</p>
                        <p style={{margin:0,fontSize:11,color:"#94a3b8"}}>{s.sub}</p>
                      </div>
                      <div style={{width:38,height:38,borderRadius:10,background:s.c+"18",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>{s.icon}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,280px)",gap:14}} className="dashboard-grid">
                <div style={card()}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <h3 style={{margin:0,fontSize:14,fontWeight:700,color:"#0f172a"}}>{tx.activeCourses}</h3>
                    <button onClick={()=>setPage("grades")} style={{background:"none",border:"none",color:rc,fontSize:12,fontWeight:600,cursor:"pointer"}}>{tx.viewAll}</button>
                  </div>
                  {GRADES_DATA.map(s=>(
                    <div key={s.id} style={{marginBottom:12}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <div style={{width:26,height:26,borderRadius:7,background:s.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:s.color,fontWeight:700}}>{s.icon}</div>
                          <span style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{isRtl?s.arName:s.enName}</span>
                        </div>
                        <span style={{fontSize:12,fontWeight:700,color:s.color}}>{s.total}%</span>
                      </div>
                      <Bar val={s.total} color={s.color}/>
                    </div>
                  ))}
                </div>
                <div style={card()}>
                  <h3 style={{margin:"0 0 14px",fontSize:14,fontWeight:700,color:"#0f172a"}}>{tx.announcement}</h3>
                  {ANNOUNCEMENTS.map((a,i)=>(
                    <div key={i} style={{display:"flex",gap:10,paddingBottom:10,marginBottom:10,borderBottom:i<2?"1px solid #f1f5f9":"none"}}>
                      <span style={{fontSize:18,flexShrink:0}}>{a.icon}</span>
                      <div>
                        <p style={{margin:"0 0 2px",fontSize:12,fontWeight:600,color:"#1e293b"}}>{isRtl?a.ar:a.en}</p>
                        <p style={{margin:0,fontSize:10,color:"#94a3b8"}}>{a.time} {isRtl?"مضى":"ago"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── GRADES ── */}
          {page==="grades"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:18}}>
                <div style={{...card(),display:"flex",alignItems:"center",gap:12}}>
                  <div style={{position:"relative"}}>
                    <Ring val={avg} color={rc}/>
                    <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:"#0f172a"}}>{avg}%</div>
                  </div>
                  <div>
                    <p style={{margin:"0 0 4px",fontSize:12,color:"#64748b"}}>{tx.gpa}</p>
                    <Badge {...g}/>
                  </div>
                </div>
                {[
                  {l:tx.midterm,v:Math.round(GRADES_DATA.reduce((a,b)=>a+b.mid,0)/GRADES_DATA.length),max:45,c:"#0ea5e9"},
                  {l:tx.final,  v:Math.round(GRADES_DATA.reduce((a,b)=>a+b.fin,0)/GRADES_DATA.length),max:45,c:"#10b981"},
                  {l:tx.homework,v:Math.round(GRADES_DATA.reduce((a,b)=>a+b.hw,0)/GRADES_DATA.length), max:10,c:"#f59e0b"},
                ].map((s,i)=>(
                  <div key={i} style={card()}>
                    <p style={{margin:"0 0 5px",fontSize:12,color:"#64748b"}}>{s.l}</p>
                    <p style={{margin:"0 0 6px",fontSize:24,fontWeight:900,color:s.c}}>{s.v}<span style={{fontSize:11,color:"#94a3b8"}}>/{s.max}</span></p>
                    <Bar val={s.v} max={s.max} color={s.c}/>
                  </div>
                ))}
              </div>
              <div style={{...card({padding:0}),overflow:"hidden"}}>
                <div style={{padding:"14px 20px",borderBottom:"1px solid #f1f5f9"}}>
                  <h3 style={{margin:0,fontSize:14,fontWeight:700,color:"#0f172a"}}>{tx.gradeReport}</h3>
                </div>
                <div style={{overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",minWidth:520}}>
                    <thead>
                      <tr style={{background:"#f8fafc"}}>
                        {[tx.subject,`${tx.midterm}/45`,`${tx.final}/45`,`${tx.homework}/10`,`${tx.total}/100`,tx.gradeLetter].map((h,i)=>(
                          <th key={i} style={{padding:"10px 16px",textAlign:isRtl?"right":"left",fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.04em",whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {GRADES_DATA.map((s,i)=>{
                        const lg=gradeInfo(s.total,tx);
                        return (
                          <tr key={s.id} style={{borderTop:"1px solid #f1f5f9",background:i%2?"#fafbff":"#fff"}}>
                            <td style={{padding:"12px 16px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:7}}>
                                <div style={{width:24,height:24,borderRadius:6,background:s.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:s.color,fontWeight:700}}>{s.icon}</div>
                                <span style={{fontSize:13,fontWeight:600,color:"#1e293b"}}>{isRtl?s.arName:s.enName}</span>
                              </div>
                            </td>
                            {[s.mid,s.fin,s.hw].map((v,j)=>(
                              <td key={j} style={{padding:"12px 16px",fontSize:13,fontWeight:600,color:"#374151"}}>{v}</td>
                            ))}
                            <td style={{padding:"12px 16px"}}>
                              <div style={{display:"flex",alignItems:"center",gap:8}}>
                                <span style={{fontSize:14,fontWeight:800,color:lg.color,minWidth:28}}>{s.total}</span>
                                <div style={{flex:1,minWidth:50}}><Bar val={s.total} color={lg.color}/></div>
                              </div>
                            </td>
                            <td style={{padding:"12px 16px"}}><Badge {...lg}/></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── ATTENDANCE ── */}
          {page==="attendance"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))",gap:12,marginBottom:18}}>
                {["present","absent","late","excused"].map(st=>{
                  const count=Object.values(attendanceState).filter(s=>s===st).length;
                  const cm={present:["#059669","#d1fae5","✅"],absent:["#dc2626","#fee2e2","❌"],late:["#d97706","#fef3c7","⏰"],excused:["#4f46e5","#e0e7ff","📋"]};
                  const [c,bg,ic]=cm[st];
                  return (
                    <div key={st} style={{...card({background:bg,border:`1px solid ${c}30`})}} >
                      <div style={{fontSize:22,marginBottom:6}}>{ic}</div>
                      <div style={{fontSize:26,fontWeight:900,color:c}}>{count}</div>
                      <div style={{fontSize:11,color:c,fontWeight:600,opacity:0.8}}>{tx[st]}</div>
                    </div>
                  );
                })}
              </div>
              <div style={card()}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
                  <h3 style={{margin:0,fontSize:14,fontWeight:700,color:"#0f172a"}}>{isRtl?"سجل الحضور — مارس 2026":"Attendance Record — March 2026"}</h3>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <Ring val={94} size={40} stroke={5} color="#059669"/>
                    <span style={{fontSize:13,fontWeight:700,color:"#059669"}}>94%</span>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(80px,1fr))",gap:7}}>
                  {Object.entries(attendanceState).map(([date,status])=>{
                    const cm={present:["#059669","#d1fae5"],absent:["#dc2626","#fee2e2"],late:["#d97706","#fef3c7"],excused:["#4f46e5","#e0e7ff"]};
                    const [c,bg]=cm[status]||["#94a3b8","#f1f5f9"];
                    return (
                      <div key={date} style={{background:bg,border:`1px solid ${c}30`,borderRadius:9,padding:"7px 8px",textAlign:"center"}}>
                        <div style={{fontSize:10,color:"#64748b",marginBottom:3}}>{date}</div>
                        <span style={{background:bg,color:c,border:`1px solid ${c}40`,fontSize:9,fontWeight:700,padding:"2px 6px",borderRadius:20}}>{tx[status]}</span>
                        {role==="teacher"&&(
                          <select value={status} onChange={e=>setAttendanceState(p=>({...p,[date]:e.target.value}))}
                            style={{marginTop:3,fontSize:9,border:"none",background:"transparent",color:c,cursor:"pointer",width:"100%",textAlign:"center"}}>
                            {["present","absent","late","excused"].map(s=><option key={s} value={s}>{tx[s]}</option>)}
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
                {role==="teacher"&&(
                  <button onClick={saveHandler} style={{marginTop:14,padding:"10px 22px",background:`linear-gradient(135deg,${rc},${rc}cc)`,color:"#fff",border:"none",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer"}}>
                    {tx.save}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* ── TEACHER PANEL ── */}
          {page==="teacher"&&(role==="teacher"||role==="admin")&&(
            <div style={{display:"grid",gridTemplateColumns:"minmax(0,260px) minmax(0,1fr)",gap:14}} className="teacher-grid">
              <div style={card()}>
                <h3 style={{margin:"0 0 12px",fontSize:13,fontWeight:700,color:"#0f172a"}}>{isRtl?"قائمة الطلاب":"Students"}</h3>
                {STUDENTS.map(s=>(
                  <div key={s.id} onClick={()=>setSelectedStudent(s)}
                    style={{display:"flex",alignItems:"center",gap:8,padding:"9px 10px",borderRadius:10,cursor:"pointer",marginBottom:4,background:selectedStudent.id===s.id?rc+"15":"transparent",border:selectedStudent.id===s.id?`1px solid ${rc}30`:"1px solid transparent"}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg,${rc},${rc}cc)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:11,flexShrink:0}}>{s.avatar}</div>
                    <div>
                      <div style={{fontSize:12,fontWeight:600,color:"#1e293b"}}>{isRtl?s.nameAr:s.nameEn}</div>
                      <div style={{fontSize:10,color:"#94a3b8"}}>{s.id}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={card()}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,flexWrap:"wrap",gap:8}}>
                  <h3 style={{margin:0,fontSize:14,fontWeight:700,color:"#0f172a"}}>{tx.enterGrade} — {isRtl?selectedStudent.nameAr:selectedStudent.nameEn}</h3>
                  <button onClick={saveHandler} style={{padding:"8px 18px",background:`linear-gradient(135deg,${rc},${rc}cc)`,color:"#fff",border:"none",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer"}}>{tx.saveGrades}</button>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
                  {GRADES_DATA.map(s=>{
                    const val=teacherGrades[s.id]||s.total;
                    const lg=gradeInfo(val,tx);
                    return (
                      <div key={s.id} style={{border:"1px solid #e2e8f0",borderRadius:10,padding:12}}>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
                          <div style={{width:26,height:26,borderRadius:7,background:s.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:s.color}}>{s.icon}</div>
                          <span style={{fontSize:12,fontWeight:600,color:"#1e293b"}}>{isRtl?s.arName:s.enName}</span>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <input type="number" min={0} max={100} value={val}
                            onChange={e=>setTeacherGrades(p=>({...p,[s.id]:+e.target.value}))}
                            style={{width:60,padding:"6px 8px",border:"1.5px solid #e2e8f0",borderRadius:8,fontSize:14,fontWeight:700,color:s.color,outline:"none",textAlign:"center"}}/>
                          <span style={{fontSize:11,color:"#94a3b8"}}>/100</span>
                          <Badge {...lg}/>
                        </div>
                        <div style={{marginTop:7}}><Bar val={val} color={lg.color} h={4}/></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ── PARENT PORTAL ── */}
          {page==="parent"&&role==="parent"&&(
            <div>
              <div style={{display:"flex",gap:10,marginBottom:16,flexWrap:"wrap"}}>
                {STUDENTS.slice(0,2).map(s=>(
                  <div key={s.id} onClick={()=>setSelectedStudent(s)}
                    style={{...card({cursor:"pointer",border:selectedStudent.id===s.id?`2px solid ${rc}`:"1px solid #e2e8f0",padding:"12px 16px",display:"flex",alignItems:"center",gap:10})}} >
                    <div style={{width:40,height:40,borderRadius:"50%",background:`linear-gradient(135deg,${rc},${rc}cc)`,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontWeight:700,fontSize:13,flexShrink:0}}>{s.avatar}</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:700,color:"#1e293b"}}>{isRtl?s.nameAr:s.nameEn}</div>
                      <div style={{fontSize:11,color:"#94a3b8"}}>{s.grade}</div>
                    </div>
                    {selectedStudent.id===s.id&&<span style={{color:rc,marginRight:"auto",fontSize:16}}>✓</span>}
                  </div>
                ))}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))",gap:12,marginBottom:16}}>
                {[
                  {icon:"📊",label:tx.gpa,val:`${selectedStudent.gpa}%`,c:"#0f6cbd"},
                  {icon:"✅",label:tx.attendanceRate,val:`${selectedStudent.attendance}%`,c:"#059669"},
                  {icon:"📚",label:tx.activeCourses,val:"6",c:"#7c3aed"},
                  {icon:"🏆",label:tx.completed,val:selectedStudent.gpa>=85?"3":"1",c:"#f59e0b"},
                ].map((s,i)=>(
                  <div key={i} style={card()}>
                    <div style={{fontSize:22,marginBottom:6}}>{s.icon}</div>
                    <div style={{fontSize:11,color:"#64748b",marginBottom:3}}>{s.label}</div>
                    <div style={{fontSize:24,fontWeight:900,color:s.c}}>{s.val}</div>
                  </div>
                ))}
              </div>
              <div style={card()}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                  <h3 style={{margin:0,fontSize:14,fontWeight:700,color:"#0f172a"}}>{tx.childProgress}</h3>
                  <button onClick={()=>setPage("grades")} style={{background:"none",border:"none",color:rc,fontSize:12,fontWeight:600,cursor:"pointer"}}>{tx.viewReport}</button>
                </div>
                {GRADES_DATA.map(s=>{
                  const lg=gradeInfo(s.total,tx);
                  return (
                    <div key={s.id} style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                      <div style={{width:26,height:26,borderRadius:7,background:s.color+"20",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:s.color,flexShrink:0}}>{s.icon}</div>
                      <div style={{flex:1}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                          <span style={{fontSize:12,fontWeight:600,color:"#1e293b"}}>{isRtl?s.arName:s.enName}</span>
                          <span style={{fontSize:12,fontWeight:700,color:lg.color}}>{s.total}%</span>
                        </div>
                        <Bar val={s.total} color={lg.color}/>
                      </div>
                      <Badge {...lg}/>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── CERTIFICATES ── */}
          {page==="certificates"&&(
            <div>
              <div style={{...card({background:`linear-gradient(135deg,${rc},${rc}dd)`,border:"none",marginBottom:18,color:"#fff"})}}>
                <div style={{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
                  <span style={{fontSize:40}}>🏆</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:17,fontWeight:800,marginBottom:3}}>{avg>=75?tx.certEarned:tx.certPending}</div>
                    <div style={{fontSize:13,opacity:0.85}}>{avg>=75?(isRtl?"معدلك يؤهلك للحصول على شهادة التفوق":"Your average qualifies you for the Excellence Certificate"):(isRtl?`تحتاج ${75-avg}% إضافية`:`Need ${75-avg}% more`)}</div>
                  </div>
                  {avg>=75&&(
                    <button onClick={()=>window.print()} style={{padding:"10px 20px",background:"rgba(255,255,255,0.2)",color:"#fff",border:"1.5px solid rgba(255,255,255,0.4)",borderRadius:10,fontSize:13,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap"}}>
                      🖨️ {tx.downloadCert}
                    </button>
                  )}
                </div>
              </div>
              <div ref={certRef}>
                <Certificate student={selectedStudent} lang={lang} tx={tx}/>
              </div>
            </div>
          )}
        </div>
      </div>

      {showModal&&<MoodleModal lang={lang} tx={tx} onConnect={d=>{setMoodle(d);setShowModal(false);}} onClose={()=>setShowModal(false)}/>}

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .dashboard-grid { grid-template-columns: 1fr !important; }
          .teacher-grid { grid-template-columns: 1fr !important; }
        }
        @media print {
          .desktop-sidebar, header, .no-print { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
}
