"use client";
import { useState, useEffect } from "react";
import SchoolFooter, { SCHOOL } from "./SchoolFooter";

const MOODLE_URL = "http://localhost";

export default function LoginPage({ onLogin, lang, setLang }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused,  setFocused]  = useState("");
  const [mounted,  setMounted]  = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const isRtl = lang === "ar";

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/moodle-login", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ moodleUrl:MOODLE_URL, username, password }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(isRtl ? "اسم المستخدم أو كلمة المرور غير صحيحة" : "Incorrect username or password");
        setLoading(false); return;
      }
      onLogin({
        token:     data.token,
        userId:    data.userId,
        username:  data.username,
        nameEn:    data.fullname,
        nameAr:    data.fullname,
        moodleUrl: data.moodleUrl || MOODLE_URL,
        role:      detectRole(data.username),
      });
    } catch {
      setError(isRtl ? "خطأ في الاتصال بالخادم" : "Cannot reach server. Is Moodle running?");
      setLoading(false);
    }
  }

  function detectRole(u) {
    const s = u.toLowerCase();
    if (s.startsWith("adm") || s === "admin")           return "admin";
    if (s.startsWith("tch") || s.startsWith("teacher")) return "teacher";
    if (s.startsWith("par") || s.startsWith("parent"))  return "parent";
    return "student";
  }

  const features = [
    { icon:"📊", en:"Real-time Grades",        ar:"الدرجات الفورية" },
    { icon:"🏅", en:"Achievement Certificates", ar:"شهادات التفوق" },
    { icon:"📅", en:"Attendance Tracking",      ar:"تتبع الحضور" },
    { icon:"👨‍👩‍👧", en:"Parent Portal",          ar:"بوابة أولياء الأمور" },
  ];

  const SocialIcon = ({ href, label, svg }) => (
    <a href={href} target="_blank" rel="noopener noreferrer" title={label}
      style={{ width:38,height:38,borderRadius:"50%",background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.2s",flexShrink:0,textDecoration:"none" }}
      onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.22)";e.currentTarget.style.transform="translateY(-2px)";}}
      onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)";e.currentTarget.style.transform="";}}>
      <span style={{ fontSize:18 }}>{svg}</span>
    </a>
  );

  return (
    <div style={{ minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:"'Segoe UI',system-ui,sans-serif",direction:isRtl?"rtl":"ltr",background:"#f4f7fb" }}>

      {/* ══════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════ */}
      <header style={{ background:"#fff",borderBottom:"1px solid #e2eaf5",position:"sticky",top:0,zIndex:200,boxShadow:"0 2px 12px rgba(29,111,216,0.07)" }}>
        <div style={{ maxWidth:1180,margin:"0 auto",padding:"0 24px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between",gap:16 }}>

          {/* Logo + Name */}
          <div style={{ display:"flex",alignItems:"center",gap:12,flexShrink:0 }}>
            <div style={{ width:44,height:44,borderRadius:12,overflow:"hidden",border:`2px solid ${SCHOOL.color}22`,boxShadow:`0 2px 10px ${SCHOOL.color}18`,flexShrink:0 }}>
              <img src="/logo.png" alt="logo" style={{ width:"100%",height:"100%",objectFit:"cover" }}
                onError={e=>{e.currentTarget.style.display="none";e.currentTarget.nextElementSibling.style.display="flex";}}/>
              <div style={{ display:"none",width:"100%",height:"100%",alignItems:"center",justifyContent:"center",fontSize:22,background:SCHOOL.light }}>🌱</div>
            </div>
            <div>
              <div style={{ fontSize:15,fontWeight:800,color:"#0f172a",letterSpacing:"-0.02em",lineHeight:1.2 }}>
                {isRtl ? SCHOOL.nameAr : SCHOOL.nameEn}
              </div>
              <div style={{ fontSize:10,color:SCHOOL.color,fontWeight:600,letterSpacing:"0.03em" }}>
                {isRtl ? SCHOOL.tagAr : SCHOOL.tagEn}
              </div>
            </div>
          </div>

          {/* Desktop Nav */}
          <nav className="desktop-nav" style={{ display:"flex",alignItems:"center",gap:6 }}>
            {[
              {en:"Home",ar:"الرئيسية"},
              {en:"About",ar:"عن المدرسة"},
              {en:"Portal",ar:"البوابة"},
              {en:"Contact",ar:"تواصل معنا"},
            ].map((n,i)=>(
              <a key={i} href="#" style={{ padding:"6px 14px",borderRadius:8,fontSize:13,fontWeight:600,color:"#374151",textDecoration:"none",transition:"all 0.15s" }}
                onMouseEnter={e=>{e.currentTarget.style.background=SCHOOL.light;e.currentTarget.style.color=SCHOOL.color;}}
                onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#374151";}}>
                {isRtl?n.ar:n.en}
              </a>
            ))}
          </nav>

          {/* Right side */}
          <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
            <button onClick={()=>setLang(l=>l==="en"?"ar":"en")}
              style={{ padding:"6px 14px",border:`1.5px solid ${SCHOOL.color}30`,borderRadius:20,cursor:"pointer",fontSize:12,fontWeight:700,background:SCHOOL.light,color:SCHOOL.color,transition:"all 0.2s" }}>
              {lang==="en"?"عربي":"EN"}
            </button>
            {/* Mobile hamburger */}
            <button className="hamburger" onClick={()=>setMenuOpen(o=>!o)}
              style={{ display:"none",width:36,height:36,border:`1.5px solid #e2eaf5`,borderRadius:9,background:"#f8fafc",cursor:"pointer",fontSize:18,alignItems:"center",justifyContent:"center",color:"#374151" }}>
              {menuOpen?"✕":"☰"}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen&&(
          <div style={{ background:"#fff",borderTop:"1px solid #e2eaf5",padding:"12px 24px 18px" }}>
            {[{en:"Home",ar:"الرئيسية"},{en:"About",ar:"عن المدرسة"},{en:"Portal",ar:"البوابة"},{en:"Contact",ar:"تواصل معنا"}].map((n,i)=>(
              <a key={i} href="#" style={{ display:"block",padding:"10px 0",fontSize:14,fontWeight:600,color:"#374151",textDecoration:"none",borderBottom:"1px solid #f1f5f9" }}>
                {isRtl?n.ar:n.en}
              </a>
            ))}
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════ */}
      <main style={{ flex:1,display:"flex",alignItems:"stretch" }}>

        {/* LEFT — PNG + info */}
        <div className="left-panel" style={{
          flex:1,minWidth:0,position:"relative",
          display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",
          padding:"48px 40px",overflow:"hidden",
        }}>
          {/* PNG background */}
          <div style={{ position:"absolute",inset:0,backgroundImage:"url('/login-bg.png')",backgroundSize:"cover",backgroundPosition:"center" }}/>
          {/* Blue overlay */}
          <div style={{ position:"absolute",inset:0,background:`linear-gradient(150deg,${SCHOOL.color}e8 0%,${SCHOOL.dark}f0 100%)` }}/>
          {/* Dot pattern */}
          <div style={{ position:"absolute",inset:0,backgroundImage:"radial-gradient(circle,rgba(255,255,255,0.12) 1.5px,transparent 1.5px)",backgroundSize:"30px 30px",opacity:0.6 }}/>
          {/* Decorative circles */}
          <div style={{ position:"absolute",width:320,height:320,borderRadius:"50%",border:"1.5px solid rgba(255,255,255,0.12)",top:-80,right:-80,pointerEvents:"none" }}/>
          <div style={{ position:"absolute",width:200,height:200,borderRadius:"50%",border:"1.5px solid rgba(255,255,255,0.08)",bottom:-50,left:-50,pointerEvents:"none" }}/>

          <div style={{ position:"relative",zIndex:2,maxWidth:400,width:"100%",
            opacity:mounted?1:0,transform:mounted?"translateY(0)":"translateY(20px)",
            transition:"all 0.8s cubic-bezier(0.16,1,0.3,1)",
          }}>
            {/* Logo */}
            <div style={{ textAlign:"center",marginBottom:36 }}>
              <div style={{ width:96,height:96,borderRadius:"50%",background:"rgba(255,255,255,0.15)",border:"3px solid rgba(255,255,255,0.4)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 18px",overflow:"hidden",boxShadow:"0 12px 40px rgba(0,0,0,0.2),0 0 0 8px rgba(255,255,255,0.08)" }}>
                <img src="/logo.png" alt="logo" style={{ width:"100%",height:"100%",objectFit:"cover" }}
                  onError={e=>{e.currentTarget.style.display="none";e.currentTarget.nextElementSibling.style.display="block";}}/>
                <span style={{ display:"none",fontSize:44 }}>🌱</span>
              </div>
              <h1 style={{ color:"#fff",fontSize:26,fontWeight:900,margin:"0 0 6px",letterSpacing:"-0.02em",textShadow:"0 2px 12px rgba(0,0,0,0.15)" }}>
                {isRtl ? SCHOOL.nameAr : SCHOOL.nameEn}
              </h1>
              <p style={{ color:"rgba(255,255,255,0.75)",fontSize:13,margin:0 }}>
                {isRtl ? SCHOOL.tagAr : SCHOOL.tagEn}
              </p>
            </div>

            {/* Feature cards */}
            <div style={{ display:"flex",flexDirection:"column",gap:10 }}>
              {features.map((f,i)=>(
                <div key={i} style={{
                  display:"flex",alignItems:"center",gap:14,
                  background:"rgba(255,255,255,0.13)",
                  backdropFilter:"blur(12px)",
                  borderRadius:14,padding:"12px 16px",
                  border:"1px solid rgba(255,255,255,0.2)",
                  textAlign:isRtl?"right":"left",
                  opacity:mounted?1:0,
                  transform:mounted?"translateX(0)":`translateX(${isRtl?"16px":"-16px"})`,
                  transition:`all 0.65s cubic-bezier(0.16,1,0.3,1) ${0.12+i*0.08}s`,
                }}>
                  <div style={{ width:38,height:38,borderRadius:10,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>{f.icon}</div>
                  <span style={{ color:"#fff",fontSize:13,fontWeight:600,textShadow:"0 1px 4px rgba(0,0,0,0.1)" }}>{isRtl?f.ar:f.en}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT — Login form */}
        <div style={{
          width:"100%",maxWidth:460,background:"#fff",
          display:"flex",flexDirection:"column",
          alignItems:"center",justifyContent:"center",
          padding:"40px 36px",
          borderLeft:isRtl?"none":"1px solid #e2eaf5",
          borderRight:isRtl?"1px solid #e2eaf5":"none",
          position:"relative",
        }}>
          {/* Top accent line */}
          <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:`linear-gradient(to right,${SCHOOL.color},#38bdf8,${SCHOOL.color})`,backgroundSize:"200% 100%",animation:"shimmer 3s linear infinite" }}/>

          <div style={{ width:"100%",maxWidth:370,
            opacity:mounted?1:0,transform:mounted?"translateY(0)":"translateY(16px)",
            transition:"all 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s",
          }}>
            {/* Mobile logo */}
            <div className="mobile-logo" style={{ textAlign:"center",marginBottom:28 }}>
              <div style={{ width:64,height:64,borderRadius:"50%",background:SCHOOL.light,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",overflow:"hidden",border:`2px solid ${SCHOOL.color}22`,boxShadow:`0 4px 20px ${SCHOOL.color}22` }}>
                <img src="/logo.png" alt="logo" style={{ width:"100%",height:"100%",objectFit:"cover" }} onError={e=>e.currentTarget.style.display="none"}/>
              </div>
              <div style={{ fontSize:15,fontWeight:800,color:"#0f172a" }}>{isRtl?SCHOOL.nameAr:SCHOOL.nameEn}</div>
            </div>

            {/* Heading */}
            <div style={{ marginBottom:28 }}>
              <h2 style={{ fontSize:24,fontWeight:900,color:"#0f172a",margin:"0 0 6px",letterSpacing:"-0.02em" }}>
                {isRtl ? "مرحباً بعودتك" : "Welcome Back"}
              </h2>
              <p style={{ fontSize:13,color:"#64748b",margin:0 }}>
                {isRtl ? "سجل دخولك للمتابعة" : "Sign in to continue learning"}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin}>
              {/* Username */}
              <div style={{ marginBottom:16 }}>
                <label style={{ display:"block",fontSize:11,fontWeight:700,color:"#475569",marginBottom:6,letterSpacing:"0.06em",textTransform:"uppercase" }}>
                  {isRtl?"اسم المستخدم":"Username"}
                </label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute",top:"50%",transform:"translateY(-50%)",[isRtl?"right":"left"]:13,fontSize:15,color:focused==="u"?SCHOOL.color:"#94a3b8",transition:"color 0.2s",pointerEvents:"none" }}>👤</span>
                  <input type="text" value={username}
                    onChange={e=>setUsername(e.target.value)}
                    onFocus={()=>setFocused("u")} onBlur={()=>setFocused("")}
                    placeholder={isRtl?"أدخل اسم المستخدم":"Enter username"}
                    required autoComplete="username"
                    style={{ width:"100%",padding:isRtl?"13px 42px 13px 14px":"13px 14px 13px 42px",border:`2px solid ${focused==="u"?SCHOOL.color:error?"#fca5a5":"#e2e8f0"}`,borderRadius:12,fontSize:14,outline:"none",boxSizing:"border-box",background:focused==="u"?"#f8fbff":"#f9fafb",color:"#0f172a",transition:"all 0.22s",boxShadow:focused==="u"?`0 0 0 4px ${SCHOOL.color}14`:"none" }}/>
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom:20 }}>
                <label style={{ display:"block",fontSize:11,fontWeight:700,color:"#475569",marginBottom:6,letterSpacing:"0.06em",textTransform:"uppercase" }}>
                  {isRtl?"كلمة المرور":"Password"}
                </label>
                <div style={{ position:"relative" }}>
                  <span style={{ position:"absolute",top:"50%",transform:"translateY(-50%)",[isRtl?"right":"left"]:13,fontSize:15,color:focused==="p"?SCHOOL.color:"#94a3b8",transition:"color 0.2s",pointerEvents:"none" }}>🔒</span>
                  <input type={showPass?"text":"password"} value={password}
                    onChange={e=>setPassword(e.target.value)}
                    onFocus={()=>setFocused("p")} onBlur={()=>setFocused("")}
                    placeholder="••••••••••"
                    required autoComplete="current-password"
                    style={{ width:"100%",padding:"13px 44px 13px 42px",border:`2px solid ${focused==="p"?SCHOOL.color:error?"#fca5a5":"#e2e8f0"}`,borderRadius:12,fontSize:14,outline:"none",boxSizing:"border-box",background:focused==="p"?"#f8fbff":"#f9fafb",color:"#0f172a",transition:"all 0.22s",boxShadow:focused==="p"?`0 0 0 4px ${SCHOOL.color}14`:"none" }}/>
                  <button type="button" onClick={()=>setShowPass(s=>!s)}
                    style={{ position:"absolute",top:"50%",transform:"translateY(-50%)",[isRtl?"left":"right"]:12,background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#94a3b8",padding:4,transition:"color 0.2s" }}
                    onMouseEnter={e=>e.currentTarget.style.color=SCHOOL.color}
                    onMouseLeave={e=>e.currentTarget.style.color="#94a3b8"}>
                    {showPass?"🙈":"👁️"}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error&&(
                <div style={{ background:"#fff0f3",border:"1.5px solid #fecdd3",borderRadius:11,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#e11d48",display:"flex",alignItems:"center",gap:8,animation:"shake 0.35s ease" }}>
                  <span>⚠️</span><span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading}
                style={{ width:"100%",padding:"14px",border:"none",borderRadius:12,background:loading?`${SCHOOL.color}88`:`linear-gradient(135deg,${SCHOOL.color},${SCHOOL.dark})`,color:"#fff",fontSize:15,fontWeight:700,cursor:loading?"not-allowed":"pointer",boxShadow:loading?"none":`0 6px 20px ${SCHOOL.color}38`,transition:"all 0.25s",display:"flex",alignItems:"center",justifyContent:"center",gap:10,letterSpacing:"0.02em" }}
                onMouseEnter={e=>{ if(!loading){e.currentTarget.style.transform="translateY(-1px)";e.currentTarget.style.boxShadow=`0 10px 28px ${SCHOOL.color}48`;} }}
                onMouseLeave={e=>{ e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=loading?"none":`0 6px 20px ${SCHOOL.color}38`; }}>
                {loading
                  ? <><span style={{ display:"inline-block",animation:"spin 1s linear infinite" }}>◌</span>{isRtl?"جارٍ التحقق...":"Verifying..."}</>
                  : (isRtl ? "← دخول" : "Sign In →")
                }
              </button>
            </form>

            {/* Note */}
            <div style={{ marginTop:20,padding:"12px 16px",background:SCHOOL.light,borderRadius:12,border:`1px solid ${SCHOOL.color}22` }}>
              <div style={{ fontSize:11,fontWeight:700,color:SCHOOL.color,marginBottom:3 }}>ℹ️ {isRtl?"ملاحظة:":"Note:"}</div>
              <div style={{ fontSize:12,color:"#3b6cbf",lineHeight:1.6 }}>{isRtl?"استخدم بيانات تسجيل الدخول الخاصة بـ Moodle":"Use your existing Moodle credentials"}</div>
            </div>
          </div>
        </div>
      </main>

      <SchoolFooter lang={lang} isRtl={isRtl} />

      <style>{`
        *  { box-sizing:border-box; }
        body { margin:0; }
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes shake   { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)} }
        @keyframes shimmer { 0%{background-position:0% 0} 100%{background-position:200% 0} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

        .left-panel { animation: fadeUp 0.7s ease; }

        @media (max-width:768px) {
          .left-panel      { display:none !important; }
          .desktop-nav     { display:none !important; }
          .hamburger       { display:flex !important; }
          .mobile-logo     { display:block !important; }
        }
        @media (min-width:769px) {
          .mobile-logo     { display:none !important; }
          .hamburger       { display:none !important; }
        }
      `}</style>
    </div>
  );
}
