"use client";
import { useState } from "react";
import Image from "next/image";

const SCHOOL = {
  nameEn: "New Baby Garden",
  nameAr: "روضة النجم الجديد",
  tagEn: "Nurturing Tomorrow's Leaders",
  tagAr: "نرعى قادة الغد",
  color: "#0f6cbd",
};

// Moodle URL — change this to your Moodle URL


export default function LoginPage({ onLogin, lang, setLang }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);
  const isRtl = lang === "ar";

 async function handleLogin(e) {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await fetch("/api/moodle-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    // Show exact error from Moodle
    if (!res.ok || data.error) {
      setError(isRtl
        ? "اسم المستخدم أو كلمة المرور غير صحيحة"
        : data.error || "Invalid username or password"
      );
      setLoading(false);
      return;
    }

    // ✅ Success — pass real Moodle data to dashboard
    onLogin({
      token:     data.token,
      userId:    data.userId,
      username:  data.username,
      nameEn:    data.fullname,
      nameAr:    data.fullname,
      moodleUrl: data.moodleUrl,
      role:      detectRole(data.username),
    });

  } catch (err) {
    setError(isRtl
      ? "خطأ في الاتصال بالخادم"
      : "Connection error. Is Moodle running?"
    );
  }

  setLoading(false);
}

  // Simple role detection — customize based on your Moodle username convention
  // e.g. teachers start with "tch.", admins with "adm.", parents with "par."
  function detectRole(username) {
    const u = username.toLowerCase();
    if (u.startsWith("adm") || u === "admin") return "admin";
    if (u.startsWith("tch") || u.startsWith("teacher")) return "teacher";
    if (u.startsWith("par") || u.startsWith("parent")) return "parent";
    return "student"; // default
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      fontFamily: "'Segoe UI', system-ui, sans-serif",
      direction: isRtl ? "rtl" : "ltr",
      background: "#f0f4f8",
    }}>
      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: 1, minWidth: 0,
        background: `linear-gradient(160deg, ${SCHOOL.color} 0%, #0a4a8f 100%)`,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "48px", position: "relative", overflow: "hidden",
      }} className="login-left-panel">
        {/* dot pattern */}
        <div style={{ position:"absolute",inset:0,opacity:0.07,backgroundImage:"radial-gradient(circle,#fff 1.5px,transparent 1.5px)",backgroundSize:"32px 32px" }}/>
        {/* circles */}
        <div style={{ position:"absolute",width:300,height:300,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.15)",top:-80,right:-80 }}/>
        <div style={{ position:"absolute",width:200,height:200,borderRadius:"50%",border:"2px solid rgba(255,255,255,0.1)",bottom:-50,left:-50 }}/>

        <div style={{ position:"relative",zIndex:1,textAlign:"center",maxWidth:380 }}>
          {/* Logo */}
          <div style={{ marginBottom:32 }}>
            <div style={{ width:100,height:100,borderRadius:"50%",background:"rgba(255,255,255,0.15)",border:"3px solid rgba(255,255,255,0.4)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",overflow:"hidden",boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
              <img src="/logo.png" alt="School Logo"
                style={{ width:80, height:80, borderRadius:"50%", objectFit:"cover" }}
                onError={e => { e.currentTarget.style.display="none"; e.currentTarget.nextElementSibling.style.display="flex"; }}
                />
              <span style={{ display:"none", fontSize:48 }}>🌱</span>
            </div>
            <h1 style={{ color:"#fff",fontSize:28,fontWeight:900,margin:"0 0 8px",letterSpacing:-0.5 }}>
              {isRtl ? SCHOOL.nameAr : SCHOOL.nameEn}
            </h1>
            <p style={{ color:"rgba(255,255,255,0.7)",fontSize:14,margin:0 }}>
              {isRtl ? SCHOOL.tagAr : SCHOOL.tagEn}
            </p>
          </div>

          {/* Features */}
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            {[
              { icon:"📊", en:"Real-time grades & reports",    ar:"الدرجات والتقارير الفورية" },
              { icon:"✅", en:"Attendance tracking",           ar:"تتبع الحضور والغياب" },
              { icon:"🏆", en:"Achievement certificates",      ar:"شهادات الإنجاز والتفوق" },
              { icon:"👨‍👩‍👧", en:"Parent portal access",       ar:"بوابة أولياء الأمور" },
            ].map((f,i)=>(
              <div key={i} style={{ display:"flex",alignItems:"center",gap:12,background:"rgba(255,255,255,0.1)",borderRadius:12,padding:"11px 14px",border:"1px solid rgba(255,255,255,0.12)",textAlign:isRtl?"right":"left" }}>
                <span style={{ fontSize:20,flexShrink:0 }}>{f.icon}</span>
                <span style={{ color:"#fff",fontSize:13,fontWeight:500 }}>{isRtl?f.ar:f.en}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div style={{ width:"100%",maxWidth:460,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"32px 24px",background:"#fff",position:"relative" }}>
        {/* Lang toggle */}
        <button onClick={()=>setLang(l=>l==="en"?"ar":"en")}
          style={{ position:"absolute",top:20,[isRtl?"left":"right"]:20,padding:"6px 14px",border:"1.5px solid #e2e8f0",borderRadius:20,cursor:"pointer",fontSize:13,fontWeight:700,background:"#f8fafc",color:"#374151" }}>
          {lang==="en"?"عر":"EN"}
        </button>

        <div style={{ width:"100%",maxWidth:360 }}>
          {/* Mobile logo */}
          <div style={{ textAlign:"center",marginBottom:28 }} className="mobile-logo">
            <div style={{ width:64,height:64,borderRadius:"50%",background:`linear-gradient(135deg,${SCHOOL.color},#0a4a8f)`,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 10px",overflow:"hidden",boxShadow:`0 4px 20px ${SCHOOL.color}44` }}>
              <img src="/logo.png" alt="logo" style={{ width:60,height:60,borderRadius:"50%",objectFit:"cover" }} onError={e=>{e.target.style.display="none";}}/>
            </div>
            <div style={{ fontSize:16,fontWeight:800,color:"#0f172a" }}>{isRtl?SCHOOL.nameAr:SCHOOL.nameEn}</div>
          </div>

          <h2 style={{ fontSize:24,fontWeight:800,color:"#0f172a",margin:"0 0 6px" }}>
            {isRtl?"مرحباً بك 👋":"Welcome Back 👋"}
          </h2>
          <p style={{ fontSize:13,color:"#64748b",margin:"0 0 28px" }}>
            {isRtl?"سجل دخولك باستخدام بيانات Moodle":"Sign in with your Moodle credentials"}
          </p>

          <form onSubmit={handleLogin}>
            {/* Username */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block",fontSize:12,fontWeight:700,color:"#374151",marginBottom:6 }}>
                {isRtl?"اسم المستخدم":"Username"}
              </label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute",top:"50%",transform:"translateY(-50%)",[isRtl?"right":"left"]:12,fontSize:16,color:"#94a3b8" }}>👤</span>
                <input type="text" value={username} onChange={e=>setUsername(e.target.value)}
                  placeholder={isRtl?"أدخل اسم المستخدم":"Enter your username"}
                  required autoComplete="username"
                  style={{ width:"100%",padding:isRtl?"12px 40px 12px 14px":"12px 14px 12px 40px",border:`1.5px solid ${error?"#fca5a5":"#e2e8f0"}`,borderRadius:10,fontSize:14,outline:"none",boxSizing:"border-box",background:"#f8fafc" }}
                  onFocus={e=>e.target.style.borderColor=SCHOOL.color}
                  onBlur={e=>e.target.style.borderColor=error?"#fca5a5":"#e2e8f0"}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom:20 }}>
              <label style={{ display:"block",fontSize:12,fontWeight:700,color:"#374151",marginBottom:6 }}>
                {isRtl?"كلمة المرور":"Password"}
              </label>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute",top:"50%",transform:"translateY(-50%)",[isRtl?"right":"left"]:12,fontSize:16,color:"#94a3b8" }}>🔒</span>
                <input type={showPass?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder={isRtl?"أدخل كلمة المرور":"Enter password"}
                  required autoComplete="current-password"
                  style={{ width:"100%",padding:isRtl?"12px 40px 12px 40px":"12px 40px 12px 40px",border:`1.5px solid ${error?"#fca5a5":"#e2e8f0"}`,borderRadius:10,fontSize:14,outline:"none",boxSizing:"border-box",background:"#f8fafc" }}
                  onFocus={e=>e.target.style.borderColor=SCHOOL.color}
                  onBlur={e=>e.target.style.borderColor=error?"#fca5a5":"#e2e8f0"}
                />
                <button type="button" onClick={()=>setShowPass(s=>!s)}
                  style={{ position:"absolute",top:"50%",transform:"translateY(-50%)",[isRtl?"left":"right"]:12,background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#94a3b8" }}>
                  {showPass?"🙈":"👁"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error&&(
              <div style={{ background:"#fee2e2",border:"1px solid #fca5a5",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:13,color:"#dc2626",display:"flex",alignItems:"center",gap:8 }}>
                <span>⚠️</span><span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{ width:"100%",padding:"13px",border:"none",borderRadius:10,background:loading?"#94a3b8":`linear-gradient(135deg,${SCHOOL.color},#0a4a8f)`,color:"#fff",fontSize:15,fontWeight:700,cursor:loading?"not-allowed":"pointer",boxShadow:loading?"none":`0 4px 15px ${SCHOOL.color}44`,transition:"all 0.2s",display:"flex",alignItems:"center",justifyContent:"center",gap:8 }}>
              {loading
                ? <><span style={{ display:"inline-block",animation:"spin 1s linear infinite" }}>⟳</span> {isRtl?"جارٍ التحقق...":"Verifying..."}</>
                : (isRtl?"تسجيل الدخول ←":"Sign In →")
              }
            </button>
          </form>

          {/* Info box */}
          <div style={{ marginTop:20,background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:10,padding:"12px 14px" }}>
            <div style={{ fontSize:11,fontWeight:700,color:"#0284c7",marginBottom:4 }}>
              {isRtl?"ℹ️ تنبيه:":"ℹ️ Note:"}
            </div>
            <div style={{ fontSize:12,color:"#0369a1",lineHeight:1.6 }}>
              {isRtl
                ? "استخدم نفس بيانات تسجيل الدخول في Moodle"
                : "Use your existing Moodle username and password"}
            </div>
          </div>

          <p style={{ textAlign:"center",fontSize:11,color:"#94a3b8",marginTop:24 }}>
            {isRtl?`© ${new Date().getFullYear()} ${SCHOOL.nameAr}`:`© ${new Date().getFullYear()} ${SCHOOL.nameEn}`}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @media (max-width:768px) {
          .login-left-panel { display:none !important; }
          .mobile-logo { display:block !important; }
        }
        @media (min-width:769px) {
          .mobile-logo { display:none !important; }
        }
      `}</style>
    </div>
  );
}
