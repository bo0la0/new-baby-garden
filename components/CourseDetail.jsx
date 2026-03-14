"use client";
import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════
   COURSE DETAIL — Tabbed page with Quizzes (+ more coming)
   Props: course, user, lang, isRtl, tx, onBack, moodle
═══════════════════════════════════════════════════════════ */

const C = {
  blue:   "#1d6fd8",
  dark:   "#0f4fa3",
  light:  "#e8f1fd",
  bg:     "#f0f4f8",
};

function Spinner({ size=32, color=C.blue }) {
  return (
    <div style={{ display:"flex",justifyContent:"center",padding:40 }}>
      <div style={{ width:size,height:size,border:`3px solid ${color}22`,borderTop:`3px solid ${color}`,borderRadius:"50%",animation:"spin 0.8s linear infinite" }}/>
    </div>
  );
}

function Card({ children, style={} }) {
  return (
    <div style={{ background:"#fff",border:"1px solid #e2eaf5",borderRadius:16,boxShadow:"0 2px 12px rgba(29,111,216,0.06)",...style }}>
      {children}
    </div>
  );
}

function Badge({ label, color, bg, border }) {
  return (
    <span style={{ background:bg,color,border:`1px solid ${border}`,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:20,whiteSpace:"nowrap" }}>
      {label}
    </span>
  );
}

// ── Tab definitions ───────────────────────────────────────
const TABS = [
  { id:"overview",    en:"Overview",    ar:"نظرة عامة",   icon:"📋" },
  { id:"quizzes",     en:"Quizzes",     ar:"الاختبارات",  icon:"📝" },
  { id:"exams",       en:"Exams",       ar:"الامتحانات",  icon:"📖" },
  { id:"assignments", en:"Assignments", ar:"الواجبات",    icon:"📌" },
  { id:"chat",        en:"Chat",        ar:"المحادثة",    icon:"💬" },
];

/* ═══════════════════════════════════════════════════════════
   QUIZ ATTEMPT SCREEN
═══════════════════════════════════════════════════════════ */
function QuizAttemptScreen({ quiz, attemptId, moodle, lang, isRtl, onFinish }) {
  const [questions, setQuestions]   = useState([]);
  const [answers,   setAnswers]     = useState({});
  const [page,      setPage]        = useState(0);
  const [loading,   setLoading]     = useState(true);
  const [submitting,setSubmitting]  = useState(false);
  const [totalPages,setTotalPages]  = useState(1);
  const [timeLeft,  setTimeLeft]    = useState(quiz.timelimit || 0);
  const timerRef = useRef(null);

  useEffect(() => {
    loadPage(0);
    if (quiz.timelimit > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) { clearInterval(timerRef.current); handleSubmit(true); return 0; }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, []);

  async function loadPage(p) {
    setLoading(true);
    try {
      const data = await moodle("mod_quiz_get_attempt_data", { attemptid: attemptId, page: p });
      setQuestions(data.questions || []);
      setTotalPages(data.nextpage === -1 ? p + 1 : (data.nextpage || p + 1));
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  function handleAnswer(slot, name, value) {
    setAnswers(prev => ({ ...prev, [`${slot}_${name}`]: value }));
  }

  async function handleSubmit(autoSubmit = false) {
    if (!autoSubmit) {
      if (!confirm(isRtl ? "هل أنت متأكد من إنهاء الاختبار؟" : "Are you sure you want to finish the quiz?")) return;
    }
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      // Build data array for process_attempt
      const dataArr = [];
      Object.entries(answers).forEach(([key, val]) => {
        const [slot, ...nameParts] = key.split("_");
        dataArr.push({ name: nameParts.join("_"), value: val });
      });
      dataArr.push({ name: "finishattempt", value: "1" });
      dataArr.push({ name: "timeup", value: autoSubmit ? "1" : "0" });

      await moodle("mod_quiz_process_attempt", {
        attemptid: attemptId,
        finishattempt: 1,
        timeup: autoSubmit ? 1 : 0,
        "data[0][name]": "finishattempt",
        "data[0][value]": "1",
      });

      // Get review
      const review = await moodle("mod_quiz_get_attempt_review", { attemptid: attemptId });
      onFinish(review);
    } catch(e) {
      console.error(e);
      // Even if process fails, try to get review
      try {
        const review = await moodle("mod_quiz_get_attempt_review", { attemptid: attemptId });
        onFinish(review);
      } catch {
        onFinish(null);
      }
    }
    setSubmitting(false);
  }

  function formatTime(s) {
    const m = Math.floor(s / 60), sec = s % 60;
    return `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
  }

  const urgent = timeLeft > 0 && timeLeft < 60;

  return (
    <div style={{ maxWidth:760,margin:"0 auto" }}>
      {/* Quiz header */}
      <Card style={{ padding:"16px 20px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap" }}>
        <div>
          <div style={{ fontSize:16,fontWeight:800,color:"#0f172a" }}>{quiz.name}</div>
          <div style={{ fontSize:12,color:"#64748b",marginTop:2 }}>
            {isRtl?"السؤال":"Page"} {page+1} {isRtl?"من":"of"} {totalPages}
          </div>
        </div>
        {quiz.timelimit > 0 && (
          <div style={{ display:"flex",alignItems:"center",gap:8,padding:"8px 16px",borderRadius:12,background:urgent?"#fee2e2":"#f0f9ff",border:`1px solid ${urgent?"#fca5a5":"#bae6fd"}` }}>
            <span style={{ fontSize:18 }}>{urgent?"⚠️":"⏱️"}</span>
            <span style={{ fontSize:18,fontWeight:800,color:urgent?"#dc2626":"#0369a1",fontVariantNumeric:"tabular-nums" }}>
              {formatTime(timeLeft)}
            </span>
          </div>
        )}
      </Card>

      {/* Questions */}
      {loading ? <Spinner/> : (
        <div>
          {questions.map((q, qi) => (
            <Card key={q.slot} style={{ padding:"20px 24px",marginBottom:14,animation:"fadeUp 0.35s ease" }}>
              {/* Question number badge */}
              <div style={{ display:"flex",alignItems:"flex-start",gap:14,marginBottom:16 }}>
                <div style={{ width:32,height:32,borderRadius:10,background:C.light,border:`1.5px solid ${C.blue}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:C.blue,flexShrink:0 }}>
                  {q.number || qi+1}
                </div>
                {/* Question HTML from Moodle */}
                <div style={{ flex:1,fontSize:14,color:"#0f172a",lineHeight:1.7 }}
                  dangerouslySetInnerHTML={{ __html: q.html || `<p>${q.questionsummary || (isRtl?"السؤال غير متاح":"Question unavailable")}</p>` }}/>
              </div>

              {/* Answer area — rendered from Moodle HTML or fallback */}
              {q.html ? (
                <div style={{ paddingRight:isRtl?0:46,paddingLeft:isRtl?46:0 }}>
                  {/* Render Moodle answer HTML — inputs need to be tracked */}
                  <div
                    dangerouslySetInnerHTML={{ __html: q.html }}
                    style={{ fontSize:14 }}
                    onChangeCapture={(e) => {
                      const el = e.target;
                      if (el.name) handleAnswer(q.slot, el.name, el.value);
                    }}
                  />
                </div>
              ) : (
                /* Fallback: multiple choice from questionsummary */
                <div style={{ paddingRight:isRtl?0:46,paddingLeft:isRtl?46:0 }}>
                  <textarea
                    placeholder={isRtl?"اكتب إجابتك هنا...":"Type your answer here..."}
                    value={answers[`${q.slot}_answer`] || ""}
                    onChange={e => handleAnswer(q.slot, "answer", e.target.value)}
                    rows={3}
                    style={{ width:"100%",padding:"10px 12px",border:"1.5px solid #e2e8f0",borderRadius:10,fontSize:13,outline:"none",resize:"vertical",fontFamily:"inherit",boxSizing:"border-box",transition:"border-color 0.2s" }}
                    onFocus={e=>e.target.style.borderColor=C.blue}
                    onBlur={e=>e.target.style.borderColor="#e2e8f0"}
                  />
                </div>
              )}
            </Card>
          ))}

          {/* Navigation */}
          <div style={{ display:"flex",gap:10,justifyContent:"space-between",marginTop:8 }}>
            <button
              onClick={() => { setPage(p => p-1); loadPage(page-1); }}
              disabled={page===0}
              style={{ padding:"10px 20px",border:"1.5px solid #e2eaf5",borderRadius:11,background:"#fff",cursor:page===0?"not-allowed":"pointer",fontSize:13,fontWeight:600,color:"#374151",opacity:page===0?0.4:1,transition:"all 0.18s" }}>
              {isRtl?"التالي →":"← Previous"}
            </button>

            {page < totalPages - 1 ? (
              <button
                onClick={() => { setPage(p => p+1); loadPage(page+1); }}
                style={{ padding:"10px 24px",border:"none",borderRadius:11,background:`linear-gradient(135deg,${C.blue},${C.dark})`,cursor:"pointer",fontSize:13,fontWeight:700,color:"#fff",boxShadow:`0 4px 14px ${C.blue}40`,transition:"all 0.18s" }}
                onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
                onMouseLeave={e=>e.currentTarget.style.transform=""}>
                {isRtl?"← السابق":"Next →"}
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                style={{ padding:"10px 28px",border:"none",borderRadius:11,background:submitting?"#94a3b8":"linear-gradient(135deg,#059669,#10b981)",cursor:submitting?"not-allowed":"pointer",fontSize:13,fontWeight:700,color:"#fff",boxShadow:"0 4px 14px rgba(5,150,105,0.35)",display:"flex",alignItems:"center",gap:8,transition:"all 0.18s" }}>
                {submitting
                  ? <><span style={{ width:14,height:14,border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block" }}/>{isRtl?"جارٍ الإرسال...":"Submitting..."}</>
                  : <>{isRtl?"✓ إنهاء الاختبار":"✓ Submit Quiz"}</>
                }
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   QUIZ REVIEW SCREEN
═══════════════════════════════════════════════════════════ */
function QuizReviewScreen({ review, quiz, isRtl, onBack }) {
  const attempt  = review?.attempt;
  const grade    = review?.grade;
  const maxGrade = quiz?.grade;

  const pct = grade && maxGrade
    ? Math.round((parseFloat(grade) / parseFloat(maxGrade)) * 100)
    : null;

  const passed  = pct != null && pct >= 50;
  const gradeColor = pct == null ? "#64748b" : pct >= 85 ? "#059669" : pct >= 70 ? "#0284c7" : pct >= 50 ? "#d97706" : "#dc2626";
  const gradeBg    = pct == null ? "#f8fafc" : pct >= 85 ? "#d1fae5" : pct >= 70 ? "#e0f2fe" : pct >= 50 ? "#fef3c7" : "#fee2e2";
  const gradeLabel = pct == null ? "—" : pct >= 85 ? (isRtl?"ممتاز":"Excellent") : pct >= 70 ? (isRtl?"جيد جداً":"Very Good") : pct >= 50 ? (isRtl?"مقبول":"Pass") : (isRtl?"راسب":"Fail");

  return (
    <div style={{ maxWidth:640,margin:"0 auto",animation:"fadeUp 0.5s ease" }}>
      <Card style={{ padding:"36px 32px",textAlign:"center",marginBottom:16 }}>
        {/* Big result circle */}
        <div style={{ width:110,height:110,borderRadius:"50%",background:gradeBg,border:`3px solid ${gradeColor}40`,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",boxShadow:`0 8px 32px ${gradeColor}20` }}>
          <div style={{ fontSize:28,fontWeight:900,color:gradeColor,lineHeight:1 }}>{pct != null ? `${pct}%` : "—"}</div>
          <div style={{ fontSize:11,color:gradeColor,fontWeight:600,marginTop:2 }}>{gradeLabel}</div>
        </div>

        <h2 style={{ fontSize:22,fontWeight:900,color:"#0f172a",margin:"0 0 6px" }}>
          {passed ? (isRtl?"أحسنت! 🎉":"Well Done! 🎉") : (isRtl?"حاول مرة أخرى":"Try Again")}
        </h2>
        <p style={{ fontSize:13,color:"#64748b",margin:"0 0 24px" }}>{quiz?.name}</p>

        {/* Score breakdown */}
        <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:28 }}>
          {[
            { label:isRtl?"درجتك":"Your Score",   val:grade ? parseFloat(grade).toFixed(1) : "—",   c:"#1d6fd8" },
            { label:isRtl?"من أصل":"Out of",       val:maxGrade ? parseFloat(maxGrade).toFixed(1):"—", c:"#475569" },
            { label:isRtl?"الحالة":"Status",       val:gradeLabel,                                    c:gradeColor },
          ].map((s,i)=>(
            <div key={i} style={{ padding:"14px 8px",background:"#f8fafc",borderRadius:12,border:"1px solid #e2eaf5" }}>
              <div style={{ fontSize:10,color:"#94a3b8",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:18,fontWeight:800,color:s.c }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Question review if available */}
        {review?.questions?.length > 0 && (
          <div style={{ textAlign:isRtl?"right":"left",marginBottom:20 }}>
            <div style={{ fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:10 }}>
              {isRtl?"مراجعة الأسئلة":"Question Review"}
            </div>
            {review.questions.map((q,i) => {
              const correct = q.mark != null && q.maxmark != null && q.mark === q.maxmark;
              const partial = q.mark > 0 && q.mark < q.maxmark;
              return (
                <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",borderRadius:10,marginBottom:6,background:correct?"#f0fdf4":partial?"#fffbeb":"#fff5f5",border:`1px solid ${correct?"#bbf7d0":partial?"#fde68a":"#fecaca"}` }}>
                  <span style={{ fontSize:16,flexShrink:0 }}>{correct?"✅":partial?"🟡":"❌"}</span>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ fontSize:12,fontWeight:600,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>
                      {isRtl?"سؤال":"Q"}{q.number}: {q.questionsummary?.slice(0,60) || "—"}
                    </div>
                  </div>
                  <div style={{ fontSize:12,fontWeight:700,color:correct?"#059669":partial?"#d97706":"#dc2626",flexShrink:0 }}>
                    {q.mark != null ? q.mark.toFixed(1) : "—"}/{q.maxmark != null ? q.maxmark.toFixed(1) : "—"}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={onBack}
          style={{ padding:"12px 32px",border:"none",borderRadius:12,background:`linear-gradient(135deg,${C.blue},${C.dark})`,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",boxShadow:`0 4px 16px ${C.blue}35` }}>
          {isRtl?"← العودة للاختبارات":"← Back to Quizzes"}
        </button>
      </Card>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   QUIZZES TAB
═══════════════════════════════════════════════════════════ */
function QuizzesTab({ course, user, moodle, lang, isRtl, tx }) {
  const [quizzes,     setQuizzes]     = useState([]);
  const [attempts,    setAttempts]    = useState({}); // quizId -> attempts[]
  const [loading,     setLoading]     = useState(true);
  const [activeQuiz,  setActiveQuiz]  = useState(null);  // quiz object
  const [attemptId,   setAttemptId]   = useState(null);  // current attempt
  const [review,      setReview]      = useState(null);  // finished review
  const [starting,    setStarting]    = useState(null);  // quizId being started

  useEffect(() => { loadQuizzes(); }, [course.id]);

  async function loadQuizzes() {
    setLoading(true);
    try {
      const data = await moodle("mod_quiz_get_quizzes_by_courses", { "courseids[0]": course.id });
      const list = (data?.quizzes || []).filter(
        q => !(q.timeopen > 0 && q.timeclose > 0 && q.timelimit > 0)
      );      setQuizzes(list);
      // Load attempts for each quiz
      const attMap = {};
      await Promise.all(list.map(async q => {
        try {
          const a = await moodle("mod_quiz_get_user_attempts", { quizid: q.id, userid: user.userId, status: "all" });
          attMap[q.id] = a?.attempts || [];
        } catch { attMap[q.id] = []; }
      }));
      setAttempts(attMap);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  async function startQuiz(quiz) {
    setStarting(quiz.id);
    try {
      // Check for an in-progress attempt first
      const existing = attempts[quiz.id]?.find(a => a.state === "inprogress");
      if (existing) {
        setActiveQuiz(quiz);
        setAttemptId(existing.id);
        setReview(null);
        setStarting(null);
        return;
      }
      const data = await moodle("mod_quiz_start_attempt", { quizid: quiz.id });
      if (data?.attempt?.id) {
        setActiveQuiz(quiz);
        setAttemptId(data.attempt.id);
        setReview(null);
      } else {
        alert(data?.warnings?.[0]?.message || (isRtl ? "لا يمكن بدء الاختبار" : "Cannot start quiz"));
      }
    } catch(e) {
      alert(e.message || (isRtl?"حدث خطأ":"Error starting quiz"));
    }
    setStarting(null);
  }

  async function viewReview(quiz, attemptId) {
    setStarting(quiz.id);
    try {
      const r = await moodle("mod_quiz_get_attempt_review", { attemptid: attemptId });
      setActiveQuiz(quiz);
      setAttemptId(null);
      setReview(r);
    } catch(e) { alert(e.message); }
    setStarting(null);
  }

  function onFinishAttempt(r) {
    setAttemptId(null);
    setReview(r);
    loadQuizzes(); // refresh attempt counts
  }

  function onBackFromReview() {
    setActiveQuiz(null);
    setReview(null);
    setAttemptId(null);
  }

  // ── ATTEMPT SCREEN ───────────────────────────────────
  if (activeQuiz && attemptId) {
    return (
      <QuizAttemptScreen
        quiz={activeQuiz}
        attemptId={attemptId}
        moodle={moodle}
        lang={lang}
        isRtl={isRtl}
        onFinish={onFinishAttempt}
      />
    );
  }

  // ── REVIEW SCREEN ─────────────────────────────────────
  if (activeQuiz && review) {
    return (
      <QuizReviewScreen
        review={review}
        quiz={activeQuiz}
        isRtl={isRtl}
        onBack={onBackFromReview}
      />
    );
  }

  // ── QUIZ LIST ─────────────────────────────────────────
  if (loading) return <Spinner/>;

  if (quizzes.length === 0) {
    return (
      <Card style={{ textAlign:"center",padding:"60px 24px",color:"#94a3b8" }}>
        <div style={{ fontSize:48,marginBottom:12 }}>📝</div>
        <div style={{ fontSize:15,fontWeight:600 }}>{isRtl?"لا توجد اختبارات في هذه المادة":"No quizzes in this course"}</div>
      </Card>
    );
  }

  const now = Math.floor(Date.now() / 1000);

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
      {quizzes.map((quiz, i) => {
        const quizAttempts = attempts[quiz.id] || [];
        const finished     = quizAttempts.filter(a => a.state === "finished");
        const inProgress   = quizAttempts.find(a => a.state === "inprogress");
        const attAllowed   = quiz.attempts || 0; // 0 = unlimited
        const attUsed      = finished.length;
        const attLeft      = attAllowed === 0 ? "∞" : Math.max(0, attAllowed - attUsed);
        const noAttLeft    = attAllowed > 0 && attUsed >= attAllowed;
        const notOpen      = quiz.timeopen && now < quiz.timeopen;
        const closed       = quiz.timeclose && now > quiz.timeclose;
        const canStart     = !noAttLeft && !notOpen && !closed;

        // Best score
        const bestAttempt  = finished.sort((a,b) => (b.sumgrades||0)-(a.sumgrades||0))[0];
        const bestPct      = bestAttempt && quiz.grade
          ? Math.round((bestAttempt.sumgrades / parseFloat(quiz.grade)) * 100) : null;

        const statusColor  = closed ? "#dc2626" : notOpen ? "#d97706" : inProgress ? "#7c3aed" : "#059669";
        const statusBg     = closed ? "#fee2e2" : notOpen ? "#fef3c7" : inProgress ? "#ede9fe" : "#d1fae5";
        const statusLabel  = closed
          ? (isRtl?"مغلق":"Closed")
          : notOpen
          ? (isRtl?"لم يُفتح بعد":"Not Open Yet")
          : inProgress
          ? (isRtl?"جارٍ...":"In Progress")
          : (isRtl?"متاح":"Available");

        return (
          <Card key={quiz.id} style={{ padding:0,overflow:"hidden",animation:`fadeUp 0.4s ease ${i*0.06}s both` }}>
            {/* Top color bar */}
            <div style={{ height:4,background:`linear-gradient(to right,${C.blue},#38bdf8)` }}/>

            <div style={{ padding:"18px 20px" }}>
              <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:14 }}>
                <div style={{ flex:1,minWidth:0 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:4 }}>
                    <div style={{ width:36,height:36,borderRadius:10,background:C.light,border:`1.5px solid ${C.blue}25`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>📝</div>
                    <div>
                      <div style={{ fontSize:15,fontWeight:800,color:"#0f172a",lineHeight:1.3 }}>{quiz.name}</div>
                      {quiz.intro && (
                        <div style={{ fontSize:12,color:"#64748b",marginTop:2 }}
                          dangerouslySetInnerHTML={{ __html: quiz.intro.replace(/<[^>]*>/g,"").slice(0,100) }}/>
                      )}
                    </div>
                  </div>
                </div>
                {/* Status badge */}
                <span style={{ background:statusBg,color:statusColor,border:`1px solid ${statusColor}30`,fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:20,whiteSpace:"nowrap",flexShrink:0 }}>
                  {statusLabel}
                </span>
              </div>

              {/* Info row */}
              <div style={{ display:"flex",gap:16,flexWrap:"wrap",marginBottom:16 }}>
                {[
                  { icon:"🔄", label:isRtl?"المحاولات المسموحة":"Attempts Allowed", val:attAllowed===0?(isRtl?"غير محدود":"Unlimited"):attAllowed },
                  { icon:"✅", label:isRtl?"المحاولات المستخدمة":"Used",            val:attUsed },
                  { icon:"🎯", label:isRtl?"المحاولات المتبقية":"Remaining",        val:attLeft },
                  ...(quiz.timelimit ? [{ icon:"⏱️", label:isRtl?"الوقت":"Time", val:`${Math.round(quiz.timelimit/60)} ${isRtl?"دقيقة":"min"}` }] : []),
                  ...(quiz.grade     ? [{ icon:"💯", label:isRtl?"الدرجة الكلية":"Max Grade", val:quiz.grade }] : []),
                ].map((info,j) => (
                  <div key={j} style={{ display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#64748b" }}>
                    <span>{info.icon}</span>
                    <span style={{ color:"#94a3b8" }}>{info.label}:</span>
                    <span style={{ fontWeight:700,color:"#374151" }}>{info.val}</span>
                  </div>
                ))}
              </div>

              {/* Date range */}
              {(quiz.timeopen || quiz.timeclose) && (
                <div style={{ display:"flex",gap:16,marginBottom:14,flexWrap:"wrap" }}>
                  {quiz.timeopen > 0 && (
                    <div style={{ fontSize:11,color:"#64748b",display:"flex",alignItems:"center",gap:4 }}>
                      <span>📅</span>
                      <span>{isRtl?"يفتح:":"Opens:"}</span>
                      <span style={{ color:"#374151",fontWeight:600 }}>{new Date(quiz.timeopen*1000).toLocaleString(isRtl?"ar-EG":"en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</span>
                    </div>
                  )}
                  {quiz.timeclose > 0 && (
                    <div style={{ fontSize:11,color:"#64748b",display:"flex",alignItems:"center",gap:4 }}>
                      <span>🔒</span>
                      <span>{isRtl?"يغلق:":"Closes:"}</span>
                      <span style={{ color:closed?"#dc2626":"#374151",fontWeight:600 }}>{new Date(quiz.timeclose*1000).toLocaleString(isRtl?"ar-EG":"en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Best score bar */}
              {bestPct != null && (
                <div style={{ marginBottom:14,padding:"10px 14px",background:"#f0f9ff",borderRadius:10,border:"1px solid #bae6fd" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                    <span style={{ fontSize:11,color:"#0369a1",fontWeight:600 }}>{isRtl?"أفضل درجة":"Best Score"}</span>
                    <span style={{ fontSize:13,fontWeight:800,color:bestPct>=50?"#059669":"#dc2626" }}>{bestPct}%</span>
                  </div>
                  <div style={{ height:6,background:"#bae6fd",borderRadius:99,overflow:"hidden" }}>
                    <div style={{ width:`${bestPct}%`,height:"100%",background:bestPct>=85?"#059669":bestPct>=50?"#0284c7":"#dc2626",borderRadius:99,transition:"width 1s ease" }}/>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
                {/* Start / Continue button */}
                {inProgress ? (
                  <button onClick={() => startQuiz(quiz)} disabled={starting === quiz.id}
                    style={{ padding:"10px 22px",border:"none",borderRadius:11,background:"linear-gradient(135deg,#7c3aed,#6d28d9)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:8,boxShadow:"0 4px 14px rgba(124,58,237,0.35)",transition:"all 0.2s" }}
                    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
                    onMouseLeave={e=>e.currentTarget.style.transform=""}>
                    {starting===quiz.id ? <><span style={{ width:13,height:13,border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block" }}/>{isRtl?"جارٍ...":"Loading..."}</> : <>{isRtl?"▶ متابعة":"▶ Continue"}</>}
                  </button>
                ) : canStart ? (
                  <button onClick={() => startQuiz(quiz)} disabled={starting === quiz.id}
                    style={{ padding:"10px 22px",border:"none",borderRadius:11,background:`linear-gradient(135deg,${C.blue},${C.dark})`,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:8,boxShadow:`0 4px 14px ${C.blue}35`,transition:"all 0.2s" }}
                    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
                    onMouseLeave={e=>e.currentTarget.style.transform=""}>
                    {starting===quiz.id ? <><span style={{ width:13,height:13,border:"2px solid rgba(255,255,255,0.3)",borderTop:"2px solid #fff",borderRadius:"50%",animation:"spin 0.7s linear infinite",display:"inline-block" }}/>{isRtl?"جارٍ...":"Starting..."}</> : <>{isRtl?"▶ ابدأ الاختبار":"▶ Start Quiz"}</>}
                  </button>
                ) : (
                  <button disabled style={{ padding:"10px 22px",border:"1.5px solid #e2e8f0",borderRadius:11,background:"#f8fafc",color:"#94a3b8",fontSize:13,fontWeight:600,cursor:"not-allowed" }}>
                    {noAttLeft ? (isRtl?"انتهت المحاولات":"No Attempts Left") : notOpen ? (isRtl?"لم يُفتح بعد":"Not Open Yet") : (isRtl?"مغلق":"Closed")}
                  </button>
                )}

                {/* View last result */}
                {finished.length > 0 && (
                  <button onClick={() => viewReview(quiz, finished[finished.length-1].id)} disabled={starting===quiz.id}
                    style={{ padding:"10px 20px",border:`1.5px solid ${C.blue}30`,borderRadius:11,background:C.light,color:C.blue,fontSize:13,fontWeight:600,cursor:"pointer",transition:"all 0.2s" }}
                    onMouseEnter={e=>{e.currentTarget.style.background=C.blue;e.currentTarget.style.color="#fff";}}
                    onMouseLeave={e=>{e.currentTarget.style.background=C.light;e.currentTarget.style.color=C.blue;}}>
                    {isRtl?"📊 عرض النتيجة":"📊 View Result"}
                  </button>
                )}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   EXAMS TAB
   Exam = quiz where timeopen > 0 AND timeclose > 0 AND timelimit > 0
═══════════════════════════════════════════════════════════ */
function ExamsTab({ course, user, moodle, lang, isRtl, tx, onExamIdsLoaded }) {

  const [exams,      setExams]      = useState([]);
  const [attempts,   setAttempts]   = useState({});
  const [loading,    setLoading]    = useState(true);
  const [now,        setNow]        = useState(Math.floor(Date.now() / 1000));
  const [enrolled,   setEnrolled]   = useState({});  // local placeholder — no API call yet
  const [starting,   setStarting]   = useState(null);
  const [activeExam, setActiveExam] = useState(null);
  const [attemptId,  setAttemptId]  = useState(null);
  const [review,     setReview]     = useState(null);

  // Live clock — ticks every second so phase + countdown stay accurate
  useEffect(() => {
    const id = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => { loadExams(); }, [course.id]);

  async function loadExams() {
    setLoading(true);
    try {
      const data = await moodle("mod_quiz_get_quizzes_by_courses", { "courseids[0]": course.id });
      const all  = data?.quizzes || [];
      // ── Exam filter: all three timing fields must be set (> 0) ──
      const examList = all.filter(q => q.timeopen > 0 && q.timeclose > 0 && q.timelimit > 0);
      setExams(examList);
      if (onExamIdsLoaded) onExamIdsLoaded(examList.map(q => q.id));
      const attMap = {};
      await Promise.all(examList.map(async q => {
        try {
          const a = await moodle("mod_quiz_get_user_attempts", { quizid: q.id, userid: user.userId, status: "all" });
          attMap[q.id] = a?.attempts || [];
        } catch { attMap[q.id] = []; }
      }));
      setAttempts(attMap);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  async function startExam(exam) {
    setStarting(exam.id);
    try {
      const existing = (attempts[exam.id] || []).find(a => a.state === "inprogress");
      if (existing) {
        setActiveExam(exam); setAttemptId(existing.id); setReview(null);
        setStarting(null); return;
      }
      const data = await moodle("mod_quiz_start_attempt", { quizid: exam.id });
      if (data?.attempt?.id) {
        setActiveExam(exam); setAttemptId(data.attempt.id); setReview(null);
      } else {
        alert(data?.warnings?.[0]?.message || (isRtl ? "لا يمكن بدء الامتحان" : "Cannot start exam"));
      }
    } catch(e) { alert(e.message || (isRtl ? "حدث خطأ" : "Error starting exam")); }
    setStarting(null);
  }

  async function viewReview(exam, attId) {
    setStarting(exam.id);
    try {
      const r = await moodle("mod_quiz_get_attempt_review", { attemptid: attId });
      setActiveExam(exam); setAttemptId(null); setReview(r);
    } catch(e) { alert(e.message); }
    setStarting(null);
  }

  function onFinishAttempt(r) { setAttemptId(null); setReview(r); loadExams(); }
  function onBackFromReview() { setActiveExam(null); setReview(null); setAttemptId(null); }

  // Returns "locked" | "enrollable" | "active" | "closed"
  function getPhase(exam) {
    const ENROLL_WINDOW = 10 * 60; // 10 min in seconds
    if (now > exam.timeclose)                       return "closed";
    if (now >= exam.timeopen)                       return "active";
    if (now >= exam.timeopen - ENROLL_WINDOW)       return "enrollable";
    return "locked";
  }

  function formatCountdown(secs) {
    if (secs <= 0) return "00:00:00";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    const pad = n => String(n).padStart(2, "0");
    return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
  }

  // ── Attempt / Review screens reuse QuizAttemptScreen & QuizReviewScreen ──
  if (activeExam && attemptId) {
    return <QuizAttemptScreen quiz={activeExam} attemptId={attemptId} moodle={moodle} lang={lang} isRtl={isRtl} onFinish={onFinishAttempt} />;
  }
  if (activeExam && review) {
    return <QuizReviewScreen review={review} quiz={activeExam} isRtl={isRtl} onBack={onBackFromReview} />;
  }

  if (loading) return <Spinner />;

  if (exams.length === 0) {
    return (
      <Card style={{ textAlign:"center", padding:"60px 24px", color:"#94a3b8" }}>
        <div style={{ fontSize:48, marginBottom:12 }}>📖</div>
        <div style={{ fontSize:15, fontWeight:600 }}>
          {isRtl ? "لا توجد امتحانات في هذه المادة" : "No exams in this course"}
        </div>
      </Card>
    );
  }

  // Phase-based visual config
  const PHASE_STYLE = {
    locked:     { color:"#475569", bg:"#f1f5f9", border:"#e2e8f0", bar:"linear-gradient(to right,#94a3b8,#cbd5e1)", icon:"🔒", label: isRtl?"الامتحان مغلق":"Exam Locked"        },
    enrollable: { color:"#d97706", bg:"#fef3c7", border:"#fde68a", bar:"linear-gradient(to right,#d97706,#fbbf24)", icon:"📋", label: isRtl?"التسجيل متاح":"Enrollment Open"     },
    active:     { color:"#059669", bg:"#d1fae5", border:"#a7f3d0", bar:"linear-gradient(to right,#059669,#34d399)", icon:"🟢", label: isRtl?"الامتحان جارٍ":"Exam Active"         },
    closed:     { color:"#dc2626", bg:"#fee2e2", border:"#fecaca", bar:"linear-gradient(to right,#dc2626,#f87171)", icon:"🔴", label: isRtl?"انتهى الامتحان":"Exam Closed"         },
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      {exams.map((exam, i) => {
        const phase        = getPhase(exam);
        const ps           = PHASE_STYLE[phase];
        const examAttempts = attempts[exam.id] || [];
        const finished     = examAttempts.filter(a => a.state === "finished");
        const inProgress   = examAttempts.find(a => a.state === "inprogress");
        const isEnrolled   = !!enrolled[exam.id];

        const countdown =
          phase === "locked"     ? exam.timeopen  - now :
          phase === "enrollable" ? exam.timeopen  - now :
          phase === "active"     ? exam.timeclose - now : 0;

        const bestAttempt = [...finished].sort((a,b)=>(b.sumgrades||0)-(a.sumgrades||0))[0];
        const bestPct     = bestAttempt && exam.grade
          ? Math.round((bestAttempt.sumgrades / parseFloat(exam.grade)) * 100) : null;

        const spinnerEl = (
          <span style={{ width:13, height:13, border:"2px solid rgba(255,255,255,0.3)", borderTop:"2px solid #fff", borderRadius:"50%", animation:"spin 0.7s linear infinite", display:"inline-block" }}/>
        );

        return (
          <Card key={exam.id} style={{ padding:0, overflow:"hidden", animation:`fadeUp 0.4s ease ${i*0.07}s both` }}>

            {/* Phase colour bar */}
            <div style={{ height:4, background:ps.bar }}/>

            <div style={{ padding:"18px 20px" }}>

              {/* ── Header row ── */}
              <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap", marginBottom:14 }}>
                <div style={{ flex:1, minWidth:0, display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:38, height:38, borderRadius:10, background:ps.bg, border:`1.5px solid ${ps.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>
                    {ps.icon}
                  </div>
                  <div>
                    <div style={{ fontSize:15, fontWeight:800, color:"#0f172a", lineHeight:1.3 }}>{exam.name}</div>
                    {exam.intro && (
                      <div style={{ fontSize:12, color:"#64748b", marginTop:2 }}
                        dangerouslySetInnerHTML={{ __html: exam.intro.replace(/<[^>]*>/g,"").slice(0,100) }}/>
                    )}
                  </div>
                </div>
                <span style={{ background:ps.bg, color:ps.color, border:`1px solid ${ps.border}`, fontSize:11, fontWeight:700, padding:"4px 12px", borderRadius:20, whiteSpace:"nowrap", flexShrink:0 }}>
                  {ps.label}
                </span>
              </div>

              {/* ── Live countdown (locked / enrollable / active only) ── */}
              {phase !== "closed" && (
                <div style={{ marginBottom:14, padding:"12px 16px", borderRadius:12, background:ps.bg, border:`1px solid ${ps.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:18 }}>{phase === "active" ? "⏳" : "⏰"}</span>
                    <span style={{ fontSize:12, color:ps.color, fontWeight:600 }}>
                      {phase === "active"
                        ? (isRtl ? "ينتهي خلال" : "Ends in")
                        : (isRtl ? "يبدأ خلال"  : "Starts in")}
                    </span>
                  </div>
                  <div style={{ fontSize:22, fontWeight:900, color:ps.color, fontVariantNumeric:"tabular-nums", letterSpacing:"0.04em" }}>
                    {formatCountdown(countdown)}
                  </div>
                </div>
              )}

              {/* ── Info chips ── */}
              <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:14 }}>
                {[
                  { icon:"📅", lbl:isRtl?"يفتح":"Opens",    val:new Date(exam.timeopen *1000).toLocaleString(isRtl?"ar-EG":"en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}) },
                  { icon:"🔒", lbl:isRtl?"يغلق":"Closes",   val:new Date(exam.timeclose*1000).toLocaleString(isRtl?"ar-EG":"en-GB",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"}) },
                  { icon:"⏱️", lbl:isRtl?"المدة":"Duration", val:`${Math.round(exam.timelimit/60)} ${isRtl?"دقيقة":"min"}` },
                  ...(exam.grade ? [{ icon:"💯", lbl:isRtl?"الدرجة الكاملة":"Max Grade", val:exam.grade }] : []),
                ].map((info,j) => (
                  <div key={j} style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:"#64748b" }}>
                    <span>{info.icon}</span>
                    <span style={{ color:"#94a3b8" }}>{info.lbl}:</span>
                    <span style={{ fontWeight:700, color:"#374151" }}>{info.val}</span>
                  </div>
                ))}
              </div>

              {/* ── Best score bar ── */}
              {bestPct != null && (
                <div style={{ marginBottom:14, padding:"10px 14px", background:"#f0f9ff", borderRadius:10, border:"1px solid #bae6fd" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                    <span style={{ fontSize:11, color:"#0369a1", fontWeight:600 }}>{isRtl?"درجتك":"Your Score"}</span>
                    <span style={{ fontSize:13, fontWeight:800, color:bestPct>=50?"#059669":"#dc2626" }}>{bestPct}%</span>
                  </div>
                  <div style={{ height:6, background:"#bae6fd", borderRadius:99, overflow:"hidden" }}>
                    <div style={{ width:`${bestPct}%`, height:"100%", borderRadius:99, transition:"width 1s ease",
                      background:bestPct>=85?"#059669":bestPct>=50?"#0284c7":"#dc2626" }}/>
                  </div>
                </div>
              )}

              {/* ── Action button ── */}
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>

                {/* LOCKED */}
                {phase === "locked" && (
                  <button disabled style={{ padding:"10px 22px", border:"1.5px solid #e2e8f0", borderRadius:11, background:"#f8fafc", color:"#94a3b8", fontSize:13, fontWeight:600, cursor:"not-allowed", display:"flex", alignItems:"center", gap:7 }}>
                    🔒 {isRtl?"الامتحان مغلق":"Exam Locked"}
                  </button>
                )}

                {/* ENROLLABLE — placeholder toggle, no API call yet */}
                {phase === "enrollable" && (
                  <button
                    onClick={() => setEnrolled(prev => ({ ...prev, [exam.id]: !prev[exam.id] }))}
                    style={{ padding:"10px 22px", border:"none", borderRadius:11, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8, transition:"all 0.2s",
                      background: isEnrolled ? "linear-gradient(135deg,#059669,#10b981)" : "linear-gradient(135deg,#d97706,#f59e0b)",
                      boxShadow:  isEnrolled ? "0 4px 14px rgba(5,150,105,0.35)"         : "0 4px 14px rgba(217,119,6,0.35)" }}
                    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
                    onMouseLeave={e=>e.currentTarget.style.transform=""}>
                    {isEnrolled
                      ? (isRtl ? "✓ تم التسجيل"          : "✓ Enrolled")
                      : (isRtl ? "📋 التسجيل للامتحان"   : "📋 Enroll for Exam")}
                  </button>
                )}

                {/* ACTIVE — start or continue */}
                {phase === "active" && (
                  <button onClick={() => startExam(exam)} disabled={starting === exam.id}
                    style={{ padding:"10px 22px", border:"none", borderRadius:11, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8, transition:"all 0.2s",
                      background:   inProgress ? "linear-gradient(135deg,#7c3aed,#6d28d9)"    : "linear-gradient(135deg,#059669,#10b981)",
                      boxShadow:    inProgress ? "0 4px 14px rgba(124,58,237,0.35)"           : "0 4px 14px rgba(5,150,105,0.35)" }}
                    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
                    onMouseLeave={e=>e.currentTarget.style.transform=""}>
                    {starting === exam.id
                      ? <>{spinnerEl}{isRtl?"جارٍ...":"Loading..."}</>
                      : inProgress
                        ? (isRtl ? "▶ متابعة الامتحان" : "▶ Continue Exam")
                        : (isRtl ? "▶ ابدأ الامتحان"   : "▶ Start Exam")}
                  </button>
                )}

                {/* CLOSED + attempted → view full review */}
                {phase === "closed" && finished.length > 0 && (
                  <button onClick={() => viewReview(exam, finished[finished.length-1].id)} disabled={starting === exam.id}
                    style={{ padding:"10px 22px", border:"none", borderRadius:11, background:`linear-gradient(135deg,${C.blue},${C.dark})`, color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", gap:8, boxShadow:`0 4px 14px ${C.blue}35`, transition:"all 0.2s" }}
                    onMouseEnter={e=>e.currentTarget.style.transform="translateY(-1px)"}
                    onMouseLeave={e=>e.currentTarget.style.transform=""}>
                    {starting === exam.id
                      ? <>{spinnerEl}{isRtl?"جارٍ...":"Loading..."}</>
                      : (isRtl ? "📊 عرض النتيجة" : "📊 View Results")}
                  </button>
                )}

                {/* CLOSED + not attempted */}
                {phase === "closed" && finished.length === 0 && (
                  <button disabled style={{ padding:"10px 22px", border:"1.5px solid #fecaca", borderRadius:11, background:"#fff5f5", color:"#dc2626", fontSize:13, fontWeight:600, cursor:"not-allowed" }}>
                    {isRtl ? "لم تشارك في الامتحان" : "Not Attempted"}
                  </button>
                )}
              </div>

            </div>
          </Card>
        );
      })}
    </div>
  );
}
/* ═══════════════════════════════════════════════════════════
   ASSIGNMENTS TAB
═══════════════════════════════════════════════════════════ */
function AssignmentsTab({ course, user, moodle, lang, isRtl }) {
  const [assignments, setAssignments] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => { loadAssignments(); }, [course.id]);

  async function loadAssignments() {
    setLoading(true);
    try {
      const data = await moodle("mod_assign_get_assignments", { "courseids[0]": course.id });
      const list = data?.courses?.[0]?.assignments || [];
      // For each assignment fetch the user's submission status
      const withStatus = await Promise.all(list.map(async a => {
        try {
          const s = await moodle("mod_assign_get_submission_status", { assignid: a.id });
          return { ...a, submissionStatus: s };
        } catch { return { ...a, submissionStatus: null }; }
      }));
      setAssignments(withStatus);
    } catch(e) { console.error(e); }
    setLoading(false);
  }

  function getStatus(a) {
    const sub = a.submissionStatus;
    const lastSub = sub?.lastattempt?.submission;
    const duedate = a.duedate;
    const now = Math.floor(Date.now() / 1000);

    if (!lastSub || lastSub.status === "new") {
      if (duedate > 0 && now > duedate) {
        return { label: isRtl ? "متأخر" : "Late", color: "#dc2626", bg: "#fee2e2", border: "#fecaca", icon: "⚠️" };
      }
      return { label: isRtl ? "معلق" : "Pending", color: "#d97706", bg: "#fef3c7", border: "#fde68a", icon: "📋" };
    }
    if (lastSub.status === "submitted") {
      return { label: isRtl ? "تم التسليم" : "Submitted", color: "#059669", bg: "#d1fae5", border: "#a7f3d0", icon: "✅" };
    }
    return { label: isRtl ? "مسودة" : "Draft", color: "#0284c7", bg: "#e0f2fe", border: "#7dd3fc", icon: "📝" };
  }

  function fmtDue(ts) {
    if (!ts || ts === 0) return isRtl ? "بدون موعد" : "No due date";
    const now = Math.floor(Date.now() / 1000);
    const diff = ts - now;
    const date = new Date(ts * 1000).toLocaleString(isRtl ? "ar-EG" : "en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
    if (diff < 0) return `${date} ⚠️`;
    if (diff < 86400) {
      const h = Math.floor(diff / 3600);
      return isRtl ? `خلال ${h} ساعة — ${date}` : `In ${h}h — ${date}`;
    }
    const d = Math.floor(diff / 86400);
    return isRtl ? `خلال ${d} يوم — ${date}` : `In ${d}d — ${date}`;
  }

  if (loading) return <Spinner />;

  if (assignments.length === 0) {
    return (
      <Card style={{ textAlign: "center", padding: "60px 24px", color: "#94a3b8" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📌</div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>
          {isRtl ? "لا توجد واجبات في هذه المادة" : "No assignments in this course"}
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {assignments.map((a, i) => {
        const st = getStatus(a);
        const intro = (a.intro || "").replace(/<[^>]*>/g, "").trim().slice(0, 160);
        const isOverdue = a.duedate > 0 && Math.floor(Date.now() / 1000) > a.duedate && st.label !== (isRtl ? "تم التسليم" : "Submitted");

        return (
          <Card key={a.id} style={{ padding: 0, overflow: "hidden", animation: `fadeUp 0.4s ease ${i * 0.06}s both` }}>
            <div style={{ height: 4, background: `linear-gradient(to right,${st.color},${st.color}66)` }} />
            <div style={{ padding: "18px 20px" }}>

              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: st.bg, border: `1.5px solid ${st.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {st.icon}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 }}>{a.name}</div>
                    {intro && <div style={{ fontSize: 12, color: "#64748b", marginTop: 3, lineHeight: 1.5 }}>{intro}</div>}
                  </div>
                </div>
                <span style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}`, fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, whiteSpace: "nowrap", flexShrink: 0 }}>
                  {st.label}
                </span>
              </div>

              {/* Due date */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 10, background: isOverdue ? "#fff5f5" : "#f8fafc", border: `1px solid ${isOverdue ? "#fecaca" : "#e2eaf5"}`, marginBottom: 12 }}>
                <span style={{ fontSize: 16 }}>{isOverdue ? "🔴" : "📅"}</span>
                <div>
                  <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {isRtl ? "موعد التسليم" : "Due Date"}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: isOverdue ? "#dc2626" : "#0f172a" }}>
                    {fmtDue(a.duedate)}
                  </div>
                </div>
              </div>

              {/* Extra info chips */}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                {a.grade > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b" }}>
                    <span>💯</span>
                    <span style={{ color: "#94a3b8" }}>{isRtl ? "الدرجة الكاملة:" : "Max Grade:"}</span>
                    <span style={{ fontWeight: 700, color: "#374151" }}>{a.grade}</span>
                  </div>
                )}
                {a.submissionStatus?.lastattempt?.submission?.timemodified > 0 && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b" }}>
                    <span>🕐</span>
                    <span style={{ color: "#94a3b8" }}>{isRtl ? "وقت التسليم:" : "Submitted at:"}</span>
                    <span style={{ fontWeight: 700, color: "#059669" }}>
                      {new Date(a.submissionStatus.lastattempt.submission.timemodified * 1000)
                        .toLocaleString(isRtl ? "ar-EG" : "en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                )}
                {a.submissionStatus?.lastattempt?.gradingstatus && (
                  <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#64748b" }}>
                    <span>📊</span>
                    <span style={{ color: "#94a3b8" }}>{isRtl ? "حالة التصحيح:" : "Grading:"}</span>
                    <span style={{ fontWeight: 700, color: "#374151", textTransform: "capitalize" }}>
                      {a.submissionStatus.lastattempt.gradingstatus}
                    </span>
                  </div>
                )}
              </div>

            </div>
          </Card>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   CHAT TAB
═══════════════════════════════════════════════════════════ */
function ChatTab({ course, user, moodle, lang, isRtl }) {
  const [teacher,      setTeacher]      = useState(null);
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState("");
  const [loading,      setLoading]      = useState(true);
  const [sending,      setSending]      = useState(false);
  const [error,        setError]        = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
  loadTeacherAndHistory();
  }, [course.id]);

  useEffect(() => {
    if (!teacher) return;
    const interval = setInterval(() => fetchMessages(teacher.id), 5000);
    return () => clearInterval(interval);
  }, [teacher]);

  async function loadTeacherAndHistory() {
  setLoading(true);
  setError("");
  try {
    const enrolled = await moodle("core_enrol_get_enrolled_users", { courseid: course.id });
    const found = (enrolled || []).find(u =>
      u.roles?.some(r => r.roleid === 3 || r.roleid === 4)
    );
    if (!found) {
      setError(isRtl ? "لم يتم العثور على معلم لهذه المادة" : "No teacher found for this course");
      setLoading(false);
      return;
    }
    setTeacher(found);
    await fetchMessages(found.id);
  } catch(e) { setError(e.message); }
  setLoading(false);
}

async function fetchMessages(teacherId) {
  try {
    const [readReceived, unreadReceived, sentMsgs] = await Promise.all([
      moodle("core_message_get_messages", {
        useridto: user.userId, useridfrom: teacherId,
        type: "conversations", read: 1, limitnum: 50,
      }).catch(() => ({ messages: [] })),
      moodle("core_message_get_messages", {
        useridto: user.userId, useridfrom: teacherId,
        type: "conversations", read: 0, limitnum: 50,
      }).catch(() => ({ messages: [] })),
      moodle("core_message_get_messages", {
        useridto: teacherId, useridfrom: user.userId,
        type: "conversations", read: 1, limitnum: 50,
      }).catch(() => ({ messages: [] })),
    ]);

    const received = [
      ...(readReceived?.messages   || []),
      ...(unreadReceived?.messages || []),
    ].map(m => ({ ...m, fromMe: false }));

    const sent = (sentMsgs?.messages || []).map(m => ({ ...m, fromMe: true }));

    const seen = new Set();
    const all = [...received, ...sent]
      .filter(m => { if (seen.has(m.id)) return false; seen.add(m.id); return true; })
      .sort((a, b) => a.timecreated - b.timecreated);

    setMessages(all);
  } catch { }
}

  async function sendMessage() {
    if (!input.trim() || !teacher) return;
    setSending(true);
    const text = input.trim();
    setInput("");
    // Optimistic UI — add message immediately
    const optimistic = { id: Date.now(), text, smallmessage: text, timecreated: Math.floor(Date.now() / 1000), fromMe: true, pending: true };
    setMessages(prev => [...prev, optimistic]);
    try {
      await moodle("core_message_send_instant_messages", {
        "messages[0][touserid]": teacher.id,
        "messages[0][text]":     text,
        "messages[0][textformat]": 0,
      });
      // Mark as sent
      setMessages(prev => prev.map(m => m.id === optimistic.id ? { ...m, pending: false } : m));
    } catch(e) {
      // Remove optimistic message and show error
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setError(isRtl ? "فشل إرسال الرسالة: " + e.message : "Failed to send: " + e.message);
    }
    setSending(false);
  }

  function fmtTime(ts) {
    return new Date(ts * 1000).toLocaleString(isRtl ? "ar-EG" : "en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  }

  if (loading) return <Spinner />;

  if (error && !teacher) {
    return (
      <Card style={{ textAlign: "center", padding: "60px 24px", color: "#94a3b8" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#dc2626" }}>{error}</div>
      </Card>
    );
  }

  return (
    <Card style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: 600 }}>

      {/* ── Teacher header ── */}
      <div style={{ padding: "14px 18px", borderBottom: "1px solid #e2eaf5", display: "flex", alignItems: "center", gap: 12, background: "#f8fafc", flexShrink: 0 }}>
        <div style={{ width: 42, height: 42, borderRadius: "50%", background: `linear-gradient(135deg,${C.blue},${C.dark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#fff", fontWeight: 800, flexShrink: 0, border: `2px solid ${C.blue}30` }}>
          {teacher?.profileimageurl
            ? <img src={teacher.profileimageurl} alt="teacher" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
            : (teacher?.fullname || "T").charAt(0).toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: "#0f172a" }}>{teacher?.fullname}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#059669", display: "inline-block" }} />
              {isRtl ? "معلم المادة" : "Course Teacher"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Messages ── */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10, background: "#f8fafc" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#94a3b8", fontSize: 13, margin: "auto" }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>💬</div>
            <div>{isRtl ? "لا توجد رسائل بعد. ابدأ المحادثة!" : "No messages yet. Start the conversation!"}</div>
          </div>
        )}
        {messages.map((m, i) => {
          const fromMe = m.fromMe;
          const text = m.text || m.smallmessage || m.fullmessage || "";
          const clean = text.replace(/<[^>]*>/g, "");
          return (
            <div key={m.id || i} style={{ display: "flex", justifyContent: fromMe ? (isRtl ? "flex-start" : "flex-end") : (isRtl ? "flex-end" : "flex-start") }}>
              <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", gap: 3, alignItems: fromMe ? (isRtl ? "flex-start" : "flex-end") : (isRtl ? "flex-end" : "flex-start") }}>
                <div style={{
                  padding: "10px 14px", borderRadius: fromMe ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                  background: fromMe ? `linear-gradient(135deg,${C.blue},${C.dark})` : "#fff",
                  color: fromMe ? "#fff" : "#0f172a",
                  fontSize: 13, lineHeight: 1.6,
                  border: fromMe ? "none" : "1px solid #e2eaf5",
                  boxShadow: fromMe ? `0 4px 14px ${C.blue}30` : "0 1px 4px rgba(0,0,0,0.06)",
                  opacity: m.pending ? 0.65 : 1,
                  transition: "opacity 0.3s",
                }}>
                  {clean}
                </div>
                <div style={{ fontSize: 10, color: "#94a3b8", paddingLeft: 4, paddingRight: 4 }}>
                  {m.pending ? (isRtl ? "جارٍ الإرسال..." : "Sending...") : fmtTime(m.timecreated)}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{ padding: "8px 18px", background: "#fee2e2", color: "#dc2626", fontSize: 12, fontWeight: 600, borderTop: "1px solid #fecaca", flexShrink: 0 }}>
          ⚠️ {error}
          <button onClick={() => setError("")} style={{ marginLeft: 8, background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontWeight: 800 }}>✕</button>
        </div>
      )}

      {/* ── Input ── */}
      <div style={{ padding: "12px 16px", borderTop: "1px solid #e2eaf5", display: "flex", gap: 10, alignItems: "flex-end", background: "#fff", flexShrink: 0 }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
          placeholder={isRtl ? "اكتب رسالتك..." : "Type a message..."}
          rows={1}
          style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #e2eaf5", borderRadius: 12, fontSize: 13, outline: "none", resize: "none", fontFamily: "inherit", lineHeight: 1.5, background: "#f8fafc", color: "#0f172a", transition: "border-color 0.2s", direction: isRtl ? "rtl" : "ltr", maxHeight: 100, overflowY: "auto" }}
          onFocus={e => e.target.style.borderColor = C.blue}
          onBlur={e => e.target.style.borderColor = "#e2eaf5"}
        />
        <button
          onClick={sendMessage}
          disabled={sending || !input.trim()}
          style={{ width: 42, height: 42, borderRadius: 12, border: "none", background: sending || !input.trim() ? "#e2eaf5" : `linear-gradient(135deg,${C.blue},${C.dark})`, color: sending || !input.trim() ? "#94a3b8" : "#fff", cursor: sending || !input.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, transition: "all 0.2s", boxShadow: sending || !input.trim() ? "none" : `0 4px 14px ${C.blue}35` }}
          onMouseEnter={e => { if (!sending && input.trim()) e.currentTarget.style.transform = "scale(1.05)"; }}
          onMouseLeave={e => e.currentTarget.style.transform = ""}>
          {sending
            ? <span style={{ width: 14, height: 14, border: "2px solid #94a3b8", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
            : <span style={{ transform: isRtl ? "scaleX(-1)" : "none", display: "inline-block" }}>➤</span>}
        </button>
      </div>

    </Card>
  );
}
/* ═══════════════════════════════════════════════════════════
   COMING SOON TAB
═══════════════════════════════════════════════════════════ */
function ComingSoonTab({ icon, label, isRtl }) {
  return (
    <Card style={{ textAlign:"center",padding:"72px 24px",color:"#94a3b8" }}>
      <div style={{ fontSize:56,marginBottom:16 }}>{icon}</div>
      <div style={{ fontSize:18,fontWeight:800,color:"#0f172a",marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:13,color:"#94a3b8",maxWidth:320,margin:"0 auto",lineHeight:1.7 }}>
        {isRtl?"هذا القسم قيد التطوير وسيكون متاحاً قريباً.":"This section is under development and will be available soon."}
      </div>
      <div style={{ display:"inline-flex",alignItems:"center",gap:6,marginTop:20,padding:"8px 18px",background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:20,fontSize:12,color:"#0369a1",fontWeight:600 }}>
        🚧 {isRtl?"قريباً":"Coming Soon"}
      </div>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN COURSE DETAIL COMPONENT
═══════════════════════════════════════════════════════════ */
export default function CourseDetail({ course, user, lang, isRtl, tx, onBack, courseContent, loadingContent, moodle: moodleCall, initialTab, onTabConsumed, onExamIdsLoaded }) {
  const [activeTab, setActiveTab] = useState(initialTab || "overview");

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
      if (onTabConsumed) onTabConsumed();
    }
  }, [initialTab]);

  const color = ["#1d6fd8","#059669","#7c3aed","#d97706","#dc2626","#0891b2"][course.id % 6];

  // Wrap moodle call to just pass fn + params
  async function moodle(fn, params={}) {
    return moodleCall(user?.token, fn, params);
  }

  const modIcon = (modname) => {
    const map={resource:"📄",url:"🔗",page:"📃",folder:"📁",quiz:"📝",assign:"📋",forum:"💬",video:"🎬",label:"🏷️",scorm:"📦",book:"📖",glossary:"📚",workshop:"🛠️",survey:"📊",feedback:"✍️",choice:"🗳️",lesson:"📖",wiki:"📝",h5pactivity:"🎮"};
    return map[modname]||"📎";
  };

  function fmtDate(ts) {
    if (!ts) return "—";
    return new Date(ts*1000).toLocaleDateString(isRtl?"ar-EG":"en-GB",{day:"numeric",month:"short",year:"numeric"});
  }

  return (
    <div style={{ animation:"fadeUp 0.4s ease" }}>

      {/* ── Course header ── */}
      <div style={{ marginBottom:18 }}>
        <button onClick={onBack}
          style={{ padding:"7px 16px",border:"1.5px solid #e2eaf5",borderRadius:10,background:"#fff",cursor:"pointer",fontSize:13,fontWeight:600,color:"#374151",display:"inline-flex",alignItems:"center",gap:6,marginBottom:12,boxShadow:"0 1px 4px rgba(0,0,0,0.06)",transition:"all 0.15s" }}
          onMouseEnter={e=>e.currentTarget.style.borderColor=C.blue}
          onMouseLeave={e=>e.currentTarget.style.borderColor="#e2eaf5"}>
          {isRtl?"→":"←"} {tx.back}
        </button>

        <Card style={{ padding:0,overflow:"hidden" }}>
          <div style={{ height:6,background:`linear-gradient(to right,${color},${color}88)` }}/>
          <div style={{ padding:"20px 24px",display:"flex",alignItems:"center",gap:16 }}>
            <div style={{ width:52,height:52,borderRadius:14,background:color+"18",border:`1.5px solid ${color}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0 }}>📚</div>
            <div style={{ flex:1,minWidth:0 }}>
              <h2 style={{ margin:0,fontSize:18,fontWeight:900,color:"#0f172a",letterSpacing:"-0.02em" }}>{course.fullname}</h2>
              {course.shortname && <div style={{ fontSize:12,color:"#94a3b8",marginTop:2 }}>{course.shortname}</div>}
            </div>
          </div>
        </Card>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display:"flex",gap:4,marginBottom:20,overflowX:"auto",paddingBottom:2 }}>
        {TABS.map(tab => {
          const active = activeTab === tab.id;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{ display:"flex",alignItems:"center",gap:7,padding:"9px 18px",border:"none",borderRadius:12,cursor:"pointer",fontSize:13,fontWeight:active?700:500,background:active?C.blue:"#fff",color:active?"#fff":"#475569",whiteSpace:"nowrap",flexShrink:0,transition:"all 0.18s",boxShadow:active?`0 4px 14px ${C.blue}35`:"0 1px 4px rgba(0,0,0,0.06)",border:active?"none":"1px solid #e2eaf5" }}
              onMouseEnter={e=>{ if(!active){ e.currentTarget.style.background=C.light; e.currentTarget.style.color=C.blue; }}}
              onMouseLeave={e=>{ if(!active){ e.currentTarget.style.background="#fff"; e.currentTarget.style.color="#475569"; }}}>
              <span>{tab.icon}</span>
              <span>{isRtl ? tab.ar : tab.en}</span>
            </button>
          );
        })}
      </div>

      {/* ── Tab content ── */}

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <div>
          {loadingContent ? <Spinner/> : !courseContent ? (
            <Card style={{ textAlign:"center",padding:40,color:"#94a3b8" }}>
              <div style={{ fontSize:40,marginBottom:10 }}>📭</div>
              <div>{tx.noCourseContent}</div>
            </Card>
          ) : (
            <div>
              {/* Stats row */}
              {(()=>{
                const sections = courseContent || [];
                const allMods  = sections.flatMap(s=>s.modules||[]);
                return (
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10,marginBottom:16 }}>
                    {[
                      {icon:"📄",label:tx.materials, val:allMods.filter(m=>["resource","folder","url"].includes(m.modname)).length, c:"#0891b2"},
                      {icon:"📝",label:tx.quizzes,   val:allMods.filter(m=>m.modname==="quiz").length,  c:"#7c3aed"},
                      {icon:"📋",label:tx.assignments,val:allMods.filter(m=>m.modname==="assign").length,c:"#d97706"},
                      {icon:"🗂️",label:tx.sections,  val:sections.filter(s=>s.modules?.length>0).length,c:color},
                    ].map((s,i)=>(
                      <Card key={i} style={{ padding:"14px",textAlign:"center" }}>
                        <div style={{ fontSize:20,marginBottom:4 }}>{s.icon}</div>
                        <div style={{ fontSize:22,fontWeight:900,color:s.c }}>{s.val}</div>
                        <div style={{ fontSize:10,color:"#64748b" }}>{s.label}</div>
                      </Card>
                    ))}
                  </div>
                );
              })()}

              {/* Sections */}
              {(courseContent||[]).filter(s=>s.modules?.length>0).map((section,si)=>(
                <Card key={section.id} style={{ marginBottom:12,padding:0,overflow:"hidden" }}>
                  <div style={{ padding:"11px 16px",background:"#f8fafc",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:26,height:26,borderRadius:7,background:"#dbeafe",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,color:C.blue,fontWeight:700,flexShrink:0,border:"1px solid #bfdbfe" }}>{si+1}</div>
                    <div style={{ fontWeight:700,fontSize:13,color:"#0f172a",flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{section.name||(isRtl?`الوحدة ${si+1}`:`Section ${si+1}`)}</div>
                    <span style={{ fontSize:10,color:"#94a3b8",flexShrink:0 }}>{section.modules.length} {isRtl?"عنصر":"items"}</span>
                  </div>
                  {section.modules.map((mod,mi)=>{
                    const isQuiz=mod.modname==="quiz", isAssign=mod.modname==="assign";
                    const mc=isQuiz?"#7c3aed":isAssign?"#d97706":"#0891b2";
                    return (
                      <div key={mod.id} style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 16px",borderBottom:mi<section.modules.length-1?"1px solid #f8fafc":"none",transition:"background 0.15s" }}
                        onMouseEnter={e=>e.currentTarget.style.background="#f8fafc"}
                        onMouseLeave={e=>e.currentTarget.style.background=""}>
                        <div style={{ width:30,height:30,borderRadius:8,background:mc+"12",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0,border:`1px solid ${mc}20` }}>{modIcon(mod.modname)}</div>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontSize:13,fontWeight:600,color:"#0f172a",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{mod.name}</div>
                          <div style={{ fontSize:10,color:"#94a3b8",marginTop:1 }}>
                            <span style={{ textTransform:"capitalize" }}>{mod.modname}</span>
                            {(isQuiz||isAssign)&&mod.dates?.find(d=>d.label==="Due")&&(
                              <span> · {tx.dueDate}: {fmtDate(mod.dates.find(d=>d.label==="Due").timestamp)}</span>
                            )}
                          </div>
                        </div>
                        <span style={{ background:mc+"12",color:mc,fontSize:9,fontWeight:700,padding:"2px 8px",borderRadius:20,border:`1px solid ${mc}25`,flexShrink:0,textTransform:"capitalize" }}>{mod.modname}</span>
                      </div>
                    );
                  })}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* QUIZZES */}
      {activeTab === "quizzes" && (
        <QuizzesTab
          course={course}
          user={user}
          moodle={moodle}
          lang={lang}
          isRtl={isRtl}
          tx={tx}
        />
      )}

      {/* EXAMS — coming soon */}
      {activeTab === "exams" && (
        <ExamsTab
          course={course}
          user={user}
          moodle={moodle}
          lang={lang}
          isRtl={isRtl}
          tx={tx}
          onExamIdsLoaded={onExamIdsLoaded}
        />
      )}

      {/* ASSIGNMENTS */}
      {activeTab === "assignments" && (
        <AssignmentsTab
          course={course}
          user={user}
          moodle={moodle}
          lang={lang}
          isRtl={isRtl}
        />
      )}

      {/* CHAT */}
      {activeTab === "chat" && (
        <ChatTab
          course={course}
          user={user}
          moodle={moodle}
          lang={lang}
          isRtl={isRtl}
        />
      )}

      <style>{`
        @keyframes spin    { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
}
