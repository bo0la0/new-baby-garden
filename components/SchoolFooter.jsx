"use client";

/* ═══════════════════════════════════════════════════════════
   SCHOOL FOOTER — shared between LoginPage and StudentDashboard
   Usage: <SchoolFooter lang={lang} isRtl={isRtl} />
═══════════════════════════════════════════════════════════ */

export const SCHOOL = {
  nameEn:    "New Baby Garden",
  nameAr:    "روضة النجم الجديد",
  tagEn:     "Nurturing Tomorrow's Leaders",
  tagAr:     "نرعى قادة الغد",
  color:     "#1d6fd8",
  dark:      "#0f4fa3",
  light:     "#e8f1fd",
  bg:        "#f4f7fb",
  phone:     "+20 100 000 0000",
  email:     "info@newbabygarden.edu.eg",
  address:   "Cairo, Egypt",
  addressAr: "القاهرة، مصر",
  facebook:  "https://facebook.com/newbabygarden",
  whatsapp:  "https://wa.me/201000000000",
  youtube:   "https://youtube.com/@newbabygarden",
  mapsEmbed: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3453.0!2d31.2357!3d30.0444!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDAyJzM5LjkiTiAzMcKwMTQnMDguNiJF!5e0!3m2!1sen!2seg!4v1",
};

/* ── Real SVG social icons ── */
function FacebookIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function YouTubeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="#fff">
      <path d="M23.495 6.205a3.007 3.007 0 00-2.088-2.088c-1.87-.501-9.396-.501-9.396-.501s-7.507-.01-9.396.501A3.007 3.007 0 00.527 6.205a31.247 31.247 0 00-.522 5.805 31.247 31.247 0 00.522 5.783 3.007 3.007 0 002.088 2.088c1.868.502 9.396.502 9.396.502s7.506 0 9.396-.502a3.007 3.007 0 002.088-2.088 31.247 31.247 0 00.5-5.783 31.247 31.247 0 00-.5-5.805zM9.609 15.601V8.408l6.264 3.602z"/>
    </svg>
  );
}

const SOCIALS = [
  { href: "facebook", Icon: FacebookIcon, label: "Facebook", bg: "#1877f2" },
  { href: "whatsapp", Icon: WhatsAppIcon, label: "WhatsApp", bg: "#25d366" },
  { href: "youtube",  Icon: YouTubeIcon,  label: "YouTube",  bg: "#ff0000" },
];

export default function SchoolFooter({ lang, isRtl, compact = false }) {
  return (
    <footer style={{
      background: "linear-gradient(135deg,#0f4fa3 0%,#0a2d6b 100%)",
      color: "#fff",
      direction: isRtl ? "rtl" : "ltr",
    }}>
      {/* Main grid */}
      <div style={{
        maxWidth: compact ? "100%" : 1180,
        margin: "0 auto",
        padding: compact ? "36px 28px 20px" : "48px 24px 28px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
        gap: compact ? 28 : 36,
      }}>

        {/* ── About + Socials ── */}
        <div>
          <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:14 }}>
            <div style={{ width:42,height:42,borderRadius:11,overflow:"hidden",border:"2px solid rgba(255,255,255,0.25)",flexShrink:0,boxShadow:"0 4px 12px rgba(0,0,0,0.2)" }}>
              <img src="/logo.png" alt="logo"
                style={{ width:"100%",height:"100%",objectFit:"cover" }}
                onError={e=>e.currentTarget.style.display="none"}/>
            </div>
            <div>
              <div style={{ fontWeight:800,fontSize:14,lineHeight:1.2,color:"#fff" }}>
                {isRtl ? SCHOOL.nameAr : SCHOOL.nameEn}
              </div>
              <div style={{ fontSize:10,color:"rgba(255,255,255,0.5)",marginTop:2 }}>
                {isRtl ? SCHOOL.tagAr : SCHOOL.tagEn}
              </div>
            </div>
          </div>

          <p style={{ fontSize:12,color:"rgba(255,255,255,0.55)",lineHeight:1.8,margin:"0 0 18px" }}>
            {isRtl
              ? "روضة النجم الجديد تقدم بيئة تعليمية متميزة تجمع بين الأصالة والحداثة في منظومة تعليمية متكاملة."
              : "New Baby Garden provides an outstanding learning environment blending tradition and innovation in a comprehensive educational system."
            }
          </p>

          {/* Social icons with real SVGs and brand colors */}
          <div style={{ display:"flex",gap:10,flexWrap:"wrap" }}>
            {SOCIALS.map(({ href, Icon, label, bg }) => (
              <a key={label}
                href={SCHOOL[href]}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                style={{
                  width:38, height:38, borderRadius:"50%",
                  background: bg,
                  display:"flex", alignItems:"center", justifyContent:"center",
                  textDecoration:"none", flexShrink:0,
                  transition:"all 0.22s cubic-bezier(0.16,1,0.3,1)",
                  boxShadow:`0 4px 12px ${bg}55`,
                }}
                onMouseEnter={e=>{
                  e.currentTarget.style.transform="translateY(-3px) scale(1.1)";
                  e.currentTarget.style.boxShadow=`0 8px 20px ${bg}77`;
                }}
                onMouseLeave={e=>{
                  e.currentTarget.style.transform="";
                  e.currentTarget.style.boxShadow=`0 4px 12px ${bg}55`;
                }}>
                <Icon/>
              </a>
            ))}
          </div>
        </div>

        {/* ── Contact Info ── */}
        <div>
          <h4 style={{ fontSize:11,fontWeight:800,color:"#fff",margin:"0 0 16px",letterSpacing:"0.08em",textTransform:"uppercase",paddingBottom:10,borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
            {isRtl ? "تواصل معنا" : "Contact Us"}
          </h4>
          <div style={{ display:"flex",flexDirection:"column",gap:12 }}>
            {[
              { icon:"📞", en:SCHOOL.phone,    ar:SCHOOL.phone,     href:`tel:${SCHOOL.phone}` },
              { icon:"✉️", en:SCHOOL.email,    ar:SCHOOL.email,     href:`mailto:${SCHOOL.email}` },
              { icon:"📍", en:SCHOOL.address,  ar:SCHOOL.addressAr, href:"#" },
            ].map((item,i)=>(
              <a key={i} href={item.href}
                style={{ display:"flex",alignItems:"flex-start",gap:10,fontSize:12,color:"rgba(255,255,255,0.6)",textDecoration:"none",lineHeight:1.5,transition:"color 0.2s" }}
                onMouseEnter={e=>e.currentTarget.style.color="#fff"}
                onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.6)"}>
                <span style={{ fontSize:15,flexShrink:0,marginTop:1 }}>{item.icon}</span>
                <span>{isRtl ? item.ar : item.en}</span>
              </a>
            ))}
          </div>
        </div>

        {/* ── Map ── */}
        <div>
          <h4 style={{ fontSize:11,fontWeight:800,color:"#fff",margin:"0 0 16px",letterSpacing:"0.08em",textTransform:"uppercase",paddingBottom:10,borderBottom:"1px solid rgba(255,255,255,0.1)" }}>
            {isRtl ? "موقعنا" : "Our Location"}
          </h4>
          <div style={{ borderRadius:14,overflow:"hidden",border:"2px solid rgba(255,255,255,0.12)",height:150,position:"relative",background:"rgba(255,255,255,0.05)" }}>
            <iframe
              src={SCHOOL.mapsEmbed}
              width="100%" height="150"
              style={{ border:0,display:"block" }}
              allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="School Location"
            />
            {/* Fallback overlay */}
            <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:6,pointerEvents:"none",background:"rgba(15,79,163,0.35)" }}>
              <span style={{ fontSize:28 }}>📍</span>
              <span style={{ fontSize:12,color:"#fff",fontWeight:600 }}>
                {isRtl ? SCHOOL.addressAr : SCHOOL.address}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div style={{ borderTop:"1px solid rgba(255,255,255,0.09)",padding:"14px 24px",maxWidth:compact?"100%":1180,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10 }}>
        <div style={{ fontSize:11,color:"rgba(255,255,255,0.35)" }}>
          © {new Date().getFullYear()} {isRtl ? SCHOOL.nameAr : SCHOOL.nameEn}.{" "}
          {isRtl ? "جميع الحقوق محفوظة" : "All rights reserved."}
        </div>
        <div style={{ display:"flex",gap:16 }}>
          {[
            { en:"Privacy Policy", ar:"سياسة الخصوصية" },
            { en:"Terms of Use",   ar:"شروط الاستخدام" },
          ].map((l,i)=>(
            <a key={i} href="#"
              style={{ fontSize:11,color:"rgba(255,255,255,0.35)",textDecoration:"none",transition:"color 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.color="#fff"}
              onMouseLeave={e=>e.currentTarget.style.color="rgba(255,255,255,0.35)"}>
              {isRtl ? l.ar : l.en}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
