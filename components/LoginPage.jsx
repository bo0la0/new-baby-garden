"use client";
import { useState, useEffect, useRef } from "react";

const SCHOOL = {
  nameEn: "New Baby Garden",
  nameAr: "روضة النجم الجديد",
  tagEn:  "Nurturing Tomorrow's Leaders",
  tagAr:  "نرعى قادة الغد",
};

const MOODLE_URL = "http://localhost";

// Animated floating particles
function Particles() {
  const particles = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size:  4 + Math.random() * 6,
    x:     Math.random() * 100,
    y:     Math.random() * 100,
    delay: Math.random() * 6,
    dur:   5 + Math.random() * 8,
  }));
  return (
    <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:1 }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position:"absolute",
          left:`${p.x}%`, top:`${p.y}%`,
          width:p.size, height:p.size,
          borderRadius:"50%",
          background:"rgba(255,255,255,0.55)",
          animation:`floatParticle ${p.dur}s ${p.delay}s ease-in-out infinite alternate`,
          boxShadow:"0 0 6px rgba(255,255,255,0.4)",
        }}/>
      ))}
    </div>
  );
}

export default function LoginPage({ onLogin, lang, setLang }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [focused,  setFocused]  = useState("");
  const [step,     setStep]     = useState(0); // 0=idle,1=entered,2=success
  const isRtl = lang === "ar";

  useEffect(() => {
    const t = setTimeout(() => setStep(1), 80);
    return () => clearTimeout(t);
  }, []);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/moodle-login", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ moodleUrl:MOODLE_URL, username, password }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(isRtl ? "اسم المستخدم أو كلمة المرور غير صحيحة" : "Incorrect username or password");
        setLoading(false);
        return;
      }
      setStep(2);
      setTimeout(() => {
        onLogin({
          token:     data.token,
          userId:    data.userId,
          username:  data.username,
          nameEn:    data.fullname,
          nameAr:    data.fullname,
          moodleUrl: data.moodleUrl || MOODLE_URL,
          role:      detectRole(data.username),
        });
      }, 600);
    } catch {
      setError(isRtl ? "خطأ في الاتصال بالخادم" : "Cannot reach server. Is Moodle running?");
      setLoading(false);
    }
  }

  function detectRole(u) {
    const s = u.toLowerCase();
    if (s.startsWith("adm") || s === "admin")            return "admin";
    if (s.startsWith("tch") || s.startsWith("teacher"))  return "teacher";
    if (s.startsWith("par") || s.startsWith("parent"))   return "parent";
    return "student";
  }

  const entered  = step >= 1;
  const success  = step === 2;

  return (
    <div dir={isRtl ? "rtl" : "ltr"} style={{
      minHeight:"100vh", position:"relative",
      fontFamily:"'Segoe UI', system-ui, -apple-system, sans-serif",
      overflow:"hidden", background:"#0a1628",
    }}>

      {/* ── FULL SCREEN PNG BACKGROUND ── */}
      <div style={{
        position:"absolute", inset:0, zIndex:0,
        backgroundImage:"url('/login-bg.png')",
        backgroundSize:"cover", backgroundPosition:"center",
        transform: entered ? "scale(1)" : "scale(1.06)",
        transition:"transform 1.4s cubic-bezier(0.16,1,0.3,1)",
      }}/>

      {/* ── DARK GRADIENT OVERLAY — heavier on form side ── */}
      <div style={{
        position:"absolute", inset:0, zIndex:1,
        background: isRtl
          ? "linear-gradient(to left, rgba(8,18,40,0.96) 0%, rgba(8,18,40,0.75) 38%, rgba(8,18,40,0.15) 65%, rgba(8,18,40,0.05) 100%)"
          : "linear-gradient(to right, rgba(8,18,40,0.96) 0%, rgba(8,18,40,0.75) 38%, rgba(8,18,40,0.15) 65%, rgba(8,18,40,0.05) 100%)",
      }}/>

      {/* ── DIAGONAL ACCENT LINE ── */}
      <div style={{
        position:"absolute", zIndex:2,
        width:3, height:"130%",
        background:"linear-gradient(to bottom, transparent, rgba(96,165,250,0.5), rgba(147,197,253,0.8), rgba(96,165,250,0.5), transparent)",
        top:"-15%",
        [isRtl ? "right" : "left"]: "42%",
        transform:"rotate(-8deg)",
        transformOrigin:"top center",
        opacity: entered ? 1 : 0,
        transition:"opacity 1s ease 0.6s",
      }}/>

      {/* ── FLOATING PARTICLES ── */}
      <Particles/>

      {/* ── LANG TOGGLE ── */}
      <button onClick={()=>setLang(l=>l==="en"?"ar":"en")} style={{
        position:"fixed", top:24,
        [isRtl?"left":"right"]:24,
        zIndex:100,
        padding:"8px 18px",
        background:"rgba(255,255,255,0.08)",
        border:"1px solid rgba(255,255,255,0.2)",
        borderRadius:99, cursor:"pointer",
        fontSize:13, fontWeight:700, color:"#fff",
        backdropFilter:"blur(12px)",
        transition:"all 0.2s",
        letterSpacing:"0.04em",
      }}
      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.16)"}
      onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.08)"}>
        {lang==="en" ? "عربي" : "EN"}
      </button>

      {/* ── MAIN LAYOUT ── */}
      <div style={{
        position:"relative", zIndex:3,
        minHeight:"100vh",
        display:"flex",
        alignItems:"stretch",
      }}>

        {/* ══ FORM SIDE ══ */}
        <div style={{
          width:"100%", maxWidth:480,
          minHeight:"100vh",
          display:"flex", flexDirection:"column",
          justifyContent:"center",
          padding: "40px 44px",
          [isRtl?"marginRight":"marginLeft"]: 0,
          opacity: entered ? 1 : 0,
          transform: entered
            ? "translateX(0)"
            : isRtl ? "translateX(40px)" : "translateX(-40px)",
          transition:"all 0.9s cubic-bezier(0.16,1,0.3,1)",
        }}>

          {/* Logo + School name */}
          <div style={{ marginBottom:44 }}>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:6 }}>
              <div style={{
                width:52, height:52, borderRadius:14,
                overflow:"hidden", flexShrink:0,
                border:"2px solid rgba(255,255,255,0.25)",
                boxShadow:"0 4px 20px rgba(0,0,0,0.35)",
              }}>
                <img src="/logo.png" alt="logo"
                  style={{ width:"100%", height:"100%", objectFit:"cover" }}
                  onError={e=>{ e.currentTarget.style.display="none"; e.currentTarget.nextElementSibling.style.display="flex"; }}/>
                <div style={{ display:"none", width:"100%", height:"100%", alignItems:"center", justifyContent:"center", fontSize:26, background:"rgba(96,165,250,0.3)" }}>🌱</div>
              </div>
              <div>
                <div style={{ color:"rgba(255,255,255,0.5)", fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", marginBottom:2 }}>
                  {isRtl ? "المنصة التعليمية" : "Learning Portal"}
                </div>
                <div style={{ color:"#fff", fontSize:15, fontWeight:800, letterSpacing:"-0.02em" }}>
                  {isRtl ? SCHOOL.nameAr : SCHOOL.nameEn}
                </div>
              </div>
            </div>
          </div>

          {/* Heading */}
          <div style={{ marginBottom:36 }}>
            <h1 style={{
              color:"#fff", fontSize:36, fontWeight:900,
              margin:"0 0 10px", lineHeight:1.1,
              letterSpacing:"-0.03em",
            }}>
              {isRtl ? "مرحباً\nبعودتك" : "Sign in\nto learn"}
            </h1>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:32, height:2, background:"#60a5fa", borderRadius:99 }}/>
              <p style={{ color:"rgba(255,255,255,0.45)", fontSize:13, margin:0 }}>
                {isRtl ? SCHOOL.tagAr : SCHOOL.tagEn}
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Username */}
            <div>
              <label style={{
                display:"block", fontSize:11, fontWeight:700,
                color:"rgba(255,255,255,0.5)", marginBottom:8,
                letterSpacing:"0.1em", textTransform:"uppercase",
              }}>
                {isRtl ? "اسم المستخدم" : "Username"}
              </label>
              <div style={{ position:"relative" }}>
                <input
                  type="text" value={username}
                  onChange={e=>setUsername(e.target.value)}
                  onFocus={()=>setFocused("u")}
                  onBlur={()=>setFocused("")}
                  placeholder={isRtl ? "أدخل اسم المستخدم" : "your.username"}
                  required autoComplete="username"
                  style={{
                    width:"100%",
                    padding: isRtl ? "15px 18px 15px 50px" : "15px 50px 15px 18px",
                    background: focused==="u"
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(255,255,255,0.07)",
                    border: focused==="u"
                      ? "1.5px solid rgba(96,165,250,0.8)"
                      : `1.5px solid ${error?"rgba(248,113,113,0.6)":"rgba(255,255,255,0.12)"}`,
                    borderRadius:14, fontSize:14, outline:"none",
                    boxSizing:"border-box", color:"#fff",
                    transition:"all 0.25s",
                    backdropFilter:"blur(8px)",
                    boxShadow: focused==="u" ? "0 0 0 4px rgba(96,165,250,0.12)" : "none",
                  }}/>
                <span style={{
                  position:"absolute", top:"50%", transform:"translateY(-50%)",
                  [isRtl?"left":"right"]:16,
                  fontSize:16,
                  color: focused==="u" ? "#60a5fa" : "rgba(255,255,255,0.3)",
                  transition:"color 0.2s",
                  pointerEvents:"none",
                }}>👤</span>
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{
                display:"block", fontSize:11, fontWeight:700,
                color:"rgba(255,255,255,0.5)", marginBottom:8,
                letterSpacing:"0.1em", textTransform:"uppercase",
              }}>
                {isRtl ? "كلمة المرور" : "Password"}
              </label>
              <div style={{ position:"relative" }}>
                <input
                  type={showPass?"text":"password"} value={password}
                  onChange={e=>setPassword(e.target.value)}
                  onFocus={()=>setFocused("p")}
                  onBlur={()=>setFocused("")}
                  placeholder="••••••••••"
                  required autoComplete="current-password"
                  style={{
                    width:"100%",
                    padding:"15px 50px 15px 18px",
                    background: focused==="p"
                      ? "rgba(255,255,255,0.12)"
                      : "rgba(255,255,255,0.07)",
                    border: focused==="p"
                      ? "1.5px solid rgba(96,165,250,0.8)"
                      : `1.5px solid ${error?"rgba(248,113,113,0.6)":"rgba(255,255,255,0.12)"}`,
                    borderRadius:14, fontSize:14, outline:"none",
                    boxSizing:"border-box", color:"#fff",
                    transition:"all 0.25s",
                    backdropFilter:"blur(8px)",
                    boxShadow: focused==="p" ? "0 0 0 4px rgba(96,165,250,0.12)" : "none",
                  }}/>
                <button type="button" onClick={()=>setShowPass(s=>!s)}
                  style={{
                    position:"absolute", top:"50%", transform:"translateY(-50%)",
                    right:14, background:"none", border:"none",
                    cursor:"pointer", fontSize:16, padding:4,
                    color:"rgba(255,255,255,0.35)",
                    transition:"color 0.2s",
                  }}
                  onMouseEnter={e=>e.currentTarget.style.color="#60a5fa"}
                  onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.35)"}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div style={{
                padding:"12px 16px",
                background:"rgba(239,68,68,0.12)",
                border:"1px solid rgba(239,68,68,0.35)",
                borderRadius:12, fontSize:13,
                color:"#fca5a5",
                display:"flex", alignItems:"center", gap:10,
                animation:"shake 0.35s ease",
              }}>
                <span>⚠️</span><span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading || success}
              style={{
                marginTop:6,
                padding:"16px",
                background: success
                  ? "rgba(34,197,94,0.85)"
                  : loading
                  ? "rgba(96,165,250,0.4)"
                  : "rgba(96,165,250,0.9)",
                border:"none", borderRadius:14,
                color:"#fff", fontSize:15, fontWeight:700,
                cursor: loading||success ? "default" : "pointer",
                transition:"all 0.3s cubic-bezier(0.16,1,0.3,1)",
                display:"flex", alignItems:"center", justifyContent:"center", gap:10,
                letterSpacing:"0.02em",
                backdropFilter:"blur(8px)",
                boxShadow: loading||success ? "none" : "0 8px 32px rgba(96,165,250,0.35)",
                transform: loading ? "scale(0.98)" : "scale(1)",
              }}
              onMouseEnter={e=>{ if(!loading&&!success){ e.currentTarget.style.background="rgba(96,165,250,1)"; e.currentTarget.style.boxShadow="0 10px 40px rgba(96,165,250,0.5)"; e.currentTarget.style.transform="translateY(-1px)"; }}}
              onMouseLeave={e=>{ e.currentTarget.style.background="rgba(96,165,250,0.9)"; e.currentTarget.style.boxShadow="0 8px 32px rgba(96,165,250,0.35)"; e.currentTarget.style.transform="scale(1)"; }}>
              {success ? (
                <><span style={{ animation:"popIn 0.4s ease" }}>✓</span> {isRtl?"جارٍ الدخول...":"Entering..."}</>
              ) : loading ? (
                <><span style={{ display:"inline-block", animation:"spin 1s linear infinite" }}>◌</span> {isRtl?"جارٍ التحقق...":"Verifying..."}</>
              ) : (
                isRtl ? "دخول ←" : "Sign In →"
              )}
            </button>
          </form>

          {/* Footer note */}
          <div style={{ marginTop:32, paddingTop:24, borderTop:"1px solid rgba(255,255,255,0.08)" }}>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.25)", margin:0, lineHeight:1.7 }}>
              {isRtl
                ? "استخدم بيانات تسجيل الدخول الخاصة بـ Moodle"
                : "Use your Moodle credentials to sign in"}
            </p>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.18)", margin:"8px 0 0" }}>
              © {new Date().getFullYear()} {isRtl ? SCHOOL.nameAr : SCHOOL.nameEn}
            </p>
          </div>
        </div>

        {/* ══ RIGHT SIDE — Info cards floating over image ══ */}
        <div className="info-side" style={{
          flex:1, display:"flex", flexDirection:"column",
          justifyContent:"center", alignItems:"center",
          padding:"40px",
          opacity: entered ? 1 : 0,
          transition:"opacity 1s ease 0.5s",
        }}>
          <div style={{
            display:"grid", gridTemplateColumns:"1fr 1fr",
            gap:14, maxWidth:380,
          }}>
            {[
              { icon:"📊", en:"Real-time\nGrades",       ar:"الدرجات\nالفورية",       color:"#60a5fa" },
              { icon:"🏅", en:"Achievement\nCertificates",ar:"شهادات\nالتفوق",        color:"#34d399" },
              { icon:"📅", en:"Attendance\nTracking",     ar:"تتبع\nالحضور",          color:"#f472b6" },
              { icon:"👨‍👩‍👧",en:"Parent\nPortal",         ar:"بوابة أولياء\nالأمور",   color:"#fb923c" },
            ].map((f, i) => (
              <div key={i} className="info-card" style={{
                background:"rgba(8,18,40,0.55)",
                backdropFilter:"blur(16px)",
                border:"1px solid rgba(255,255,255,0.1)",
                borderRadius:20, padding:"20px 18px",
                cursor:"default",
                opacity: entered ? 1 : 0,
                transform: entered ? "translateY(0)" : "translateY(24px)",
                transition:`all 0.7s cubic-bezier(0.16,1,0.3,1) ${0.5 + i*0.1}s`,
              }}>
                <div style={{
                  width:44, height:44, borderRadius:12,
                  background:`${f.color}22`,
                  border:`1px solid ${f.color}44`,
                  display:"flex", alignItems:"center",
                  justifyContent:"center", fontSize:22,
                  marginBottom:12,
                }}>{f.icon}</div>
                <div style={{
                  fontSize:13, fontWeight:700, color:"#fff",
                  lineHeight:1.4, whiteSpace:"pre-line",
                }}>{isRtl ? f.ar : f.en}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        * { box-sizing:border-box; }
        body { margin:0; }

        input::placeholder { color:rgba(255,255,255,0.25); }
        input:-webkit-autofill {
          -webkit-box-shadow:0 0 0 100px rgba(255,255,255,0.07) inset !important;
          -webkit-text-fill-color:#fff !important;
        }

        @keyframes floatParticle {
          from { transform:translateY(0px) translateX(0px) scale(1); opacity:0.4; }
          to   { transform:translateY(-28px) translateX(10px) scale(1.3); opacity:0.15; }
        }
        @keyframes spin {
          from { transform:rotate(0deg); }
          to   { transform:rotate(360deg); }
        }
        @keyframes shake {
          0%,100% { transform:translateX(0); }
          25%     { transform:translateX(-8px); }
          75%     { transform:translateX(8px); }
        }
        @keyframes popIn {
          0%   { transform:scale(0.5); opacity:0; }
          70%  { transform:scale(1.2); }
          100% { transform:scale(1); opacity:1; }
        }

        .info-card:hover {
          background:rgba(8,18,40,0.75) !important;
          transform:translateY(-4px) scale(1.02) !important;
          border-color:rgba(255,255,255,0.2) !important;
          transition:all 0.22s ease !important;
        }

        @media (max-width:768px) {
          .info-side { display:none !important; }
        }

        @media print {
          body { background:#fff; }
        }
      `}</style>
    </div>
  );
}
