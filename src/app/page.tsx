"use client";

// --------------------------------─
// portfolio-v8-final.tsx
// Drop into: app/page.tsx
// --------------------------------─

import {
  useState, useEffect, useRef, useCallback,
} from "react";
import {
  motion, AnimatePresence, useSpring, useReducedMotion,
} from "framer-motion";
import { ContactForm } from "@/components/ContactForm";
import { createClient } from "@/lib/supabase/client";

// --------------------------------─
// SHADERS (Uncomment once: npm install shaders)
// --------------------------------─
import { Shader, Swirl, ChromaFlow, FlutedGlass, FilmGrain } from "shaders/react";

function HeroShaderLayer() {
  return (
    <Shader style={{ position:"absolute", inset:0, zIndex:0, width:"100%", height:"100%", pointerEvents:"none" }}>
      <Swirl colorA="#FDFBF7" colorB="#F0E8DC" detail={1.4} />
      <ChromaFlow baseColor="#FDFBF7" downColor="#C19A6B22" leftColor="#C19A6B11"
                  rightColor="#C19A6B22" upColor="#C19A6B11" momentum={9} radius={3} />
      <FlutedGlass aberration={0.5} angle={31} frequency={7} highlight={0.13}
                   highlightSoftness={0} lightAngle={-90} refraction={3.5}
                   shape="rounded" softness={1} speed={0.12} />
      <FilmGrain strength={0.035} />
    </Shader>
  );
}

function HeroShaderLayerDark() {
  return (
    <Shader style={{ position:"absolute", inset:0, zIndex:0, width:"100%", height:"100%", pointerEvents:"none" }}>
      <Swirl colorA="#1A1614" colorB="#2A2018" detail={1.4} />
      <ChromaFlow baseColor="#1A1614" downColor="#D4B89622" leftColor="#D4B89611"
                  rightColor="#D4B89622" upColor="#D4B89611" momentum={9} radius={3} />
      <FlutedGlass aberration={0.5} angle={31} frequency={7} highlight={0.08}
                   highlightSoftness={0} lightAngle={-90} refraction={3.5}
                   shape="rounded" softness={1} speed={0.12} />
      <FilmGrain strength={0.04} />
    </Shader>
  );
}

// --------------------------------─
// DESIGN TOKENS
// --------------------------------─
const LIGHT = {
  bg:            "#FDFBF7",
  glassBg:       "rgba(245,238,225,0.15)",
  glassRaised:  "rgba(255,255,255,0.55)",
  glassBorder:  "rgba(210,180,140,0.25)",
  textPrimary:  "#2C241B",
  textSecondary:"#7A6548",
  textMuted:    "#A89070",
  accent:       "#C19A6B",
  accentLabel:  "#2C241B",
  cardBg:       "rgba(255,255,255,0.92)",
  blob1: "#D4A373", blob2: "#93C5FD", blob3: "#14B8A6",
  isDark: false,
};

const DARK = {
  bg:            "#1A1614",
  glassBg:       "rgba(18,14,12,0.52)",
  glassRaised:  "rgba(28,22,18,0.72)",
  glassBorder:  "rgba(212,184,150,0.16)",
  textPrimary:  "#F5F0EA",
  textSecondary:"#A89F91",
  textMuted:    "#6B6158",
  accent:       "#D4B896",
  accentLabel:  "#1A1614",
  cardBg:       "rgba(28,23,20,0.92)",
  blob1: "#C4860A", blob2: "#2563EB", blob3: "#0F766E",
  isDark: true,
};

export type Theme = typeof LIGHT;
const R = { full: 9999, xl: 24, lg: 16, md: 12, sm: 8, xs: 4 };

function glassStyle(T: Theme, blur = 20, elevated = false): React.CSSProperties {
  return {
    background: T.glassBg,
    backdropFilter: `blur(${blur}px) saturate(190%) brightness(${T.isDark ? "1.08" : "1.03"})`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(190%) brightness(${T.isDark ? "1.08" : "1.03"})`,
    border: `1px solid ${T.isDark ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.70)"}`,
    boxShadow: elevated
      ? `0 0 0 0.5px ${T.glassBorder}, 0 20px 60px rgba(0,0,0,${T.isDark ? "0.50" : "0.12"}), 0 4px 12px rgba(0,0,0,${T.isDark ? "0.30" : "0.06"}), inset 0 1px 0 rgba(255,255,255,${T.isDark ? "0.14" : "0.80"}), inset 0 -1px 0 rgba(0,0,0,${T.isDark ? "0.12" : "0.04"})`
      : `0 0 0 0.5px ${T.glassBorder}, 0 8px 32px rgba(0,0,0,${T.isDark ? "0.40" : "0.08"}), 0 2px 6px rgba(0,0,0,${T.isDark ? "0.20" : "0.04"}), inset 0 1px 0 rgba(255,255,255,${T.isDark ? "0.12" : "0.70"})`,
  };
}

// --------------------------------─
// DEFAULT DATA STRUCTURE (Fallback)
// --------------------------------─
const DEFAULT_OWNER = {
  name:      "Alamin Mohaddis Hasan",
  first:     "MOHADDIS HASAN",
  last:      "ALAMIN",
  initials:  "MHA",
  role:      "Full-Stack Web Developer",
  bio:       "I build full-stack web apps - the kind that look good, load fast, and don't break when someone clicks the wrong button.",
  uni:       "SEGi University",
  year:      "3rd Year · BIT",
  location:  "Malaysia",
  cgpa:      "3.78",
  deansList: 4,
  email:     "hasanmohaddis@gmail.com",
  github:    "https://github.com/mohaddis88",
  linkedin:  "www.linkedin.com/in/mohaddis-hasan",
  skills: {
    Frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    Backend:  ["Node.js", "Supabase", "PostgreSQL", "REST APIs", "Express"],
    Tools:    ["Git", "Figma", "Vercel", "Docker", "VS Code"],
  },
  projects: [
    { title:"StudySync",   tag:"Full-Stack", desc:"Real-time collaborative study platform - live cursors, shared notes, Pomodoro timer.", tech:["Next.js","Supabase","TypeScript"], demo:"#", repo:"#", emoji:"📚" },
  ],
  experience: [
    { role:"Frontend Developer", org:"Freelance",  period:"Jan 2024 – Present", desc:"Client projects - landing pages, dashboards." },
  ],
  awards: {
    academic:       [{ title:"Dean's List", issuer:"SEGi University", year:"2023/24", gpa:"3.92", hasPdf:true }],
    certifications: [{ title:"Meta Front-End", issuer:"Coursera",   year:"2024", hasPdf:true }],
    volunteering:   [],
    personal:       [],
  },
  deanSemesters: [{ sem:"Sem 2 2023/24", gpa:"3.92" }],
  certs: [{ title:"Meta Front-End", issuer:"Coursera", year:"2024" }],
  bgMusic: "https://cdn.pixabay.com/audio/2024/11/13/audio_ac22a60be9.mp3",
};

export type OwnerData = typeof DEFAULT_OWNER;

// --------------------------------─
// GEMINI & CHIPS
// --------------------------------─
const GEMINI_KEY = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_GEMINI_KEY) ?? "YOUR_GEMINI_API_KEY";

const getChips = (name: string) => ({
  default:    ["Show me his projects", "What's his tech stack?", "4× Dean's List - really?", `Contact ${name}`],
  about:      ["What's his stack?", "Show his projects", "His Dean's List"],
  skills:     ["See his projects", "His experience", `How to contact ${name}?`],
  projects:   ["More about his work", "His experience", `Contact ${name}`],
  experience: ["Show certifications", "What's his stack?", `Contact ${name}`],
  certs:      ["Show projects", "His stack", "How to reach him?"],
  contact:    ["Show projects", "His tech stack", `About ${name}`],
});

async function callGemini(msg: string, hist: {role:string;text:string}[], owner: OwnerData) {
  const SYSTEM_PROMPT = `You are "Mino", the AI embedded in ${owner.name}'s portfolio.
Represent ${owner.first} accurately and warmly to recruiters and developers.

RULES:
1. Only state facts from the data below. Never invent credentials or skills.
2. If asked about something not in the data, acknowledge it and redirect: "I don't see that in ${owner.first}'s profile yet - his focus is Full-Stack web. What he does have is [X]. Want to see?"
3. Keep replies SHORT - 2-4 sentences, then offer more. Chat, not essay.
4. Tone: warm, confident, slightly informal. Like a colleague vouching for him.
5. When showing data, include ONE tag so the UI renders rich cards:
   [SHOW_PROJECTS] [SHOW_SKILLS] [SHOW_EXPERIENCE] [SHOW_CERTS] [SHOW_CONTACT] [SHOW_ABOUT]
6. Internship: always confirm YES, ${owner.location}, open to hybrid/on-site.

DATA:
University: ${owner.uni}, ${owner.year} | CGPA: ${owner.cgpa} | Dean's List: ${owner.deansList}× consecutive
Stack: ${Object.entries(owner.skills).map(([k,v])=>k+": "+v.join(", ")).join(" | ")}
Projects: ${owner.projects.map(p=>p.title+" ("+p.tag+") - "+p.desc).join(" | ")}
Experience: ${owner.experience.map(e=>e.role+" at "+e.org+" ("+e.period+")").join(" | ")}
Certs: ${owner.certs.map(c=>c.title+" by "+c.issuer+" ("+c.year+")").join(" | ")}`;

  const ep = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + GEMINI_KEY;
  const contents = [
    { role:"user",  parts:[{text:SYSTEM_PROMPT}] },
    { role:"model", parts:[{text:`I'm Mino, ready to represent ${owner.first}.`}] },
    ...hist.map(m=>({ role:m.role==="ai"?"model":"user", parts:[{text:m.text}] })),
    { role:"user", parts:[{text:msg}] },
  ];
  const res = await fetch(ep,{ method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({ contents, generationConfig:{maxOutputTokens:280,temperature:0.72} }) });
  if(!res.ok) throw new Error("Gemini "+res.status);
  const data = await res.json();
  const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const tag = (raw.match(/\[(SHOW_\w+)\]/)||[])[1] ?? null;
  const text = raw.replace(/\[SHOW_\w+\]/g,"").trim();
  const sm: Record<string,string> = {SHOW_ABOUT:"about",SHOW_SKILLS:"skills",SHOW_PROJECTS:"projects",SHOW_EXPERIENCE:"experience",SHOW_CERTS:"certs",SHOW_CONTACT:"contact"};
  return { text, richType:tag, section:tag?sm[tag]:null };
}

function getFallback(p:string, owner: OwnerData){
  const t=p.toLowerCase();
  if(/about|who/.test(t))         return {text:`${owner.name} - ${owner.year} at ${owner.uni}, CGPA ${owner.cgpa}. Full-Stack dev open for internship.`,richType:"SHOW_ABOUT",section:"about"};
  if(/skill|stack|tech/.test(t))  return {text:`Here's ${owner.first}'s full toolkit:`,richType:"SHOW_SKILLS",section:"skills"};
  if(/project|built/.test(t))     return {text:`Here are ${owner.first}'s featured projects:`,richType:"SHOW_PROJECTS",section:"projects"};
  if(/experience|edu/.test(t))    return {text:"Where he's been:",richType:"SHOW_EXPERIENCE",section:"experience"};
  if(/cert|award|dean|gpa/.test(t)) return {text:`${owner.deansList}× Dean's List - consistency, not luck:`,richType:"SHOW_CERTS",section:"certs"};
  if(/contact|reach|hire/.test(t)) return {text:`Best ways to reach ${owner.first}:`,richType:"SHOW_CONTACT",section:"contact"};
  if(/avail|intern/.test(t))       return {text:`Yes - actively looking for Full-Stack internship 2026. ${owner.location}-based, open to hybrid or on-site.`,richType:null,section:null};
  return {text:`Try asking about his projects, stack, Dean's List, experience, or how to contact him.`,richType:null,section:null};
}

// --------------------------------─
// PIXEL AVATAR
// --------------------------------─
function PixelAvatar({ T }: { T: Theme }) {
  const [frame, setFrame] = useState(0);
  const letters = {
    'M': [1,0,0,0,1, 1,1,0,1,1, 1,0,1,0,1, 1,0,0,0,1, 1,0,0,0,1],
    'I': [0,1,1,1,0, 0,0,1,0,0, 0,0,1,0,0, 0,0,1,0,0, 0,1,1,1,0],
    'N': [1,0,0,0,1, 1,1,0,0,1, 1,0,1,0,1, 1,0,0,1,1, 1,0,0,0,1],
    'O': [0,1,1,1,0, 1,0,0,0,1, 1,0,0,0,1, 1,0,0,0,1, 0,1,1,1,0]
  };
  const sequence = ['M', 'I', 'N', 'O'] as const;

  useEffect(() => {
    const interval = setInterval(() => setFrame((p) => (p + 1) % sequence.length), 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      width: "100%", height: "100%", background: T.cardBg,
      borderRadius: "16px", border: `1px solid ${T.glassBorder}`,
      boxShadow: "0 8px 24px rgba(0,0,0,0.05)", padding: "12%",
      display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
      gridTemplateRows: "repeat(5, 1fr)", gap: "4%"
    }}>
      {letters[sequence[frame]].map((isActive, i) => (
        <motion.div key={i} initial={false}
          animate={{
            backgroundColor: isActive ? T.accent : T.glassRaised,
            opacity: isActive ? 1 : 0.2,
            scale: isActive ? 1.05 : 1
          }}
          transition={{ duration: 0.3 }}
          style={{ width: "100%", height: "100%", borderRadius: "2px" }}
        />
      ))}
    </div>
  );
}

// --------------------------------─
// LIQUID BACKGROUND
// --------------------------------─
function LiquidBg({ T }: { T: Theme }) {
  const prefersReduced = useReducedMotion();
  const iw = typeof window !== "undefined" ? window.innerWidth / 2  : 500;
  const ih = typeof window !== "undefined" ? window.innerHeight / 2 : 400;
  const x1 = useSpring(iw, { damping: 25, stiffness: 120, mass: 1.5 });
  const y1 = useSpring(ih, { damping: 25, stiffness: 120, mass: 1.5 });
  const x2 = useSpring(iw, { damping: 38, stiffness: 75,  mass: 3.0 });
  const y2 = useSpring(ih, { damping: 38, stiffness: 75,  mass: 3.0 });

  useEffect(() => {
    if (prefersReduced) return;
    const move = (e: MouseEvent) => {
      x1.set(e.clientX - 200); y1.set(e.clientY - 200);
      x2.set(e.clientX - 300); y2.set(e.clientY - 300);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x1, y1, x2, y2, prefersReduced]);

  return (
    <div style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none", overflow:"hidden", filter:"blur(80px)" }}>
      <motion.div
        animate={prefersReduced ? {} : { rotate:[0,360] }}
        transition={{ duration:22, repeat:Infinity, ease:"linear" }}
        style={{ position:"absolute", top:"18%", left:"28%", width:520, height:520, background:T.blob1, borderRadius:"42% 58% 68% 32% / 38% 52% 48% 62%", opacity:0.35 }}
      />
      <motion.div style={{ position:"absolute", top:0, left:0, width:420, height:420, background:T.blob2, borderRadius:"50%", opacity:0.40, x:x1, y:y1 }} />
      <motion.div style={{ position:"absolute", top:0, left:0, width:640, height:640, background:T.blob3, borderRadius:"60% 40% 30% 70% / 60% 30% 70% 40%", opacity:0.30, x:x2, y:y2 }} />
    </div>
  );
}

// --------------------------------─
// AUDIO
// --------------------------------─
function AudioCtrl({ T, musicUrl }: { T: Theme, musicUrl: string }) {
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(musicUrl);
    audio.loop = true; audio.volume = 0;
    audioRef.current = audio;
    const start = () => {
      audio.play().then(() => {
        setPlaying(true);
        let v = 0;
        const fade = setInterval(() => { v = Math.min(v + 0.03, 0.28); audio.volume = v; if(v>=0.28) clearInterval(fade); }, 100);
      }).catch(()=>{});
      document.removeEventListener("click", start);
    };
    document.addEventListener("click", start);
    return () => { audio.pause(); document.removeEventListener("click", start); };
  }, [musicUrl]);

  const toggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    const a = audioRef.current; if(!a) return;
    if(playing){ a.pause(); setPlaying(false); } else { a.play(); setPlaying(true); }
  };

  return (
    <button onClick={toggle} title={playing?"Mute":"Play lo-fi"}
      style={{ width:44, height:44, borderRadius:"50%", border:"none", cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center", gap:2,
        ...glassStyle(T,12) }}>
      {playing
        ? <div style={{display:"flex",alignItems:"flex-end",gap:2,height:14}}>
            {[0.4,0.9,0.6,1.0].map((h,i)=>(
              <motion.div key={i} animate={{scaleY:[h,h*0.35,h,h*0.65,h]}}
                transition={{duration:0.85,repeat:Infinity,delay:i*0.15,ease:"easeInOut"}}
                style={{width:3,height:14,borderRadius:2,background:T.accent,transformOrigin:"bottom"}}/>
            ))}
          </div>
        : <span style={{fontSize:16,color:T.textSecondary,textDecoration:"line-through"}}>♪</span>}
    </button>
  );
}

// --------------------------------─
// RICH CARDS
// --------------------------------─
function RichCard({ type, T, owner }: { type:string; T:Theme, owner: OwnerData }) {
  const chip: React.CSSProperties = {
    display:"inline-flex", alignItems:"center",
    padding:"3px 11px", borderRadius:R.full, fontSize:11, fontWeight:600,
    background:T.accent+"18", border:"1px solid "+T.accent+"30", color:T.accent, whiteSpace:"nowrap",
  };
  const card: React.CSSProperties = {
    padding:"12px 14px", borderRadius:R.lg,
    background:T.cardBg, border:"1px solid "+T.glassBorder, marginTop:6,
  };

  if(type==="SHOW_ABOUT") {
    return(
      <div style={{marginTop:12,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[{l:"University",v:owner.uni},{l:"Year",v:owner.year},{l:"Dean's List",v:`${owner.deansList}×`},{l:"Status",v:"Open to Internship"}]
          .map((s,i)=>(
            <motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}} style={card}>
              <div style={{fontSize:10,color:T.textMuted,marginBottom:3}}>{s.l}</div>
              <div style={{fontSize:13,fontWeight:700,color:T.textPrimary}}>{s.v}</div>
            </motion.div>
          ))}
      </div>
    );
  }

  if(type==="SHOW_SKILLS") {
    return(
      <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:10}}>
        {Object.entries(owner.skills).map(([cat,skills],i)=>(
          <motion.div key={cat} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.1}}>
            <div style={{fontSize:10,color:T.textMuted,letterSpacing:"0.12em",marginBottom:6}}>{cat.toUpperCase()}</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
              {skills.map((s,j)=><span key={j} style={chip}>{s}</span>)}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if(type==="SHOW_PROJECTS") {
    return(
      <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
        {owner.projects.map((p,i)=>(
          <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}}
            whileHover={{y:-2}} style={{...card,cursor:"pointer"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:5}}>
              <span style={{fontSize:14,fontWeight:700,color:T.textPrimary}}>{p.emoji} {p.title}</span>
              <span style={chip}>{p.tag}</span>
            </div>
            <p style={{fontSize:12,color:T.textSecondary,lineHeight:1.6,marginBottom:8}}>{p.desc}</p>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {p.tech.map((t,j)=><span key={j} style={chip}>{t}</span>)}
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if(type==="SHOW_EXPERIENCE") {
    return(
      <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8,paddingLeft:16,position:"relative"}}>
        <div style={{position:"absolute",left:0,top:8,bottom:8,width:1.5,background:T.accent+"40",borderRadius:2}}/>
        {owner.experience.map((e,i)=>(
          <motion.div key={i} initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.1}} style={{position:"relative"}}>
            <div style={{position:"absolute",left:-20,top:14,width:8,height:8,borderRadius:"50%",background:T.accent,border:"2px solid "+T.bg}}/>
            <div style={card}>
              <div style={{fontSize:13,fontWeight:700,color:T.textPrimary,marginBottom:2}}>{e.role}</div>
              <div style={{fontSize:11,color:T.accent,marginBottom:3}}>{e.org}</div>
              <div style={{fontSize:11,color:T.textMuted,marginBottom:6}}>{e.period}</div>
              <p style={{fontSize:12,color:T.textSecondary,lineHeight:1.6}}>{e.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if(type==="SHOW_CERTS") {
    return(
      <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:8}}>
        <motion.div initial={{opacity:0,scale:0.97}} animate={{opacity:1,scale:1}}
          style={{...card,background:T.accent+"0D",border:"1px solid "+T.accent+"30"}}>
          <div style={{fontSize:12,color:T.accent,fontWeight:700,marginBottom:10}}>◆ {owner.deansList}× Dean&apos;s List · {owner.uni}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(2,1fr)",gap:6}}>
            {owner.deanSemesters.map((d,i)=>(
              <motion.div key={i} initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.1+i*0.06}}
                style={{padding:"8px 10px",borderRadius:R.sm,textAlign:"center",background:T.accent+"0A",border:"1px solid "+T.accent+"20"}}>
                <div style={{fontSize:16,fontWeight:800,color:T.accent}}>{d.gpa}</div>
                <div style={{fontSize:10,color:T.textMuted,marginTop:2}}>{d.sem}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        {owner.certs.map((c,i)=>(
          <motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.35+i*0.08}}
            style={{...card,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div>
              <div style={{fontSize:12,fontWeight:700,color:T.textPrimary,marginBottom:2}}>{c.title}</div>
              <div style={{fontSize:11,color:T.textSecondary}}>{c.issuer}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
              <span style={chip}>{c.year}</span>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if(type==="SHOW_CONTACT") {
    const links=[
      {icon:"✉",l:"Email",v:owner.email,href:"mailto:"+owner.email},
      {icon:"⬡",l:"GitHub",v:owner.github,href:owner.github},
      {icon:"◈",l:"LinkedIn",v:owner.linkedin,href:owner.linkedin},
    ];
    return(
      <div style={{marginTop:12,display:"flex",flexDirection:"column",gap:7}}>
        {links.map((s,i)=>(
          <motion.a key={i} href={s.href}
            initial={{opacity:0,x:-8}} animate={{opacity:1,x:0}} transition={{delay:i*0.1}}
            style={{...card,display:"flex",alignItems:"center",gap:12,textDecoration:"none"}}
            whileHover={{x:2}}>
            <span style={{fontSize:18,color:T.accent}}>{s.icon}</span>
            <div>
              <div style={{fontSize:10,color:T.textMuted}}>{s.l}</div>
              <div style={{fontSize:12,fontWeight:600,color:T.textPrimary}}>{s.v}</div>
            </div>
          </motion.a>
        ))}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.4}}
          style={{...card,background:T.accent+"0D",border:"1px solid "+T.accent+"30",fontSize:12,color:T.accent,display:"flex",alignItems:"center",gap:8}}>
          <span style={{position:"relative",display:"inline-flex",width:8,height:8}}>
            <motion.span animate={{scale:[1,2.2,1],opacity:[0.7,0,0.7]}} transition={{duration:2,repeat:Infinity}}
              style={{position:"absolute",inset:0,borderRadius:"50%",background:T.accent}}/>
            <span style={{width:8,height:8,borderRadius:"50%",background:T.accent,display:"block"}}/>
          </span>
          Available for Full-Stack internship · 2026
        </motion.div>
      </div>
    );
  }
  return null;
}

// --------------------------------─
// AWARDS CONTENT
// --------------------------------─
type TabId = "academic"|"certifications"|"volunteering"|"personal";

function AwardsContent({ T, owner }: { T:Theme, owner: OwnerData }) {
  const [activeTab, setActiveTab] = useState<TabId>("academic");
  const categories: {id:TabId;label:string;icon:string;count:number}[] = [
    {id:"academic",       label:"Academic",     icon:"◆", count:owner.awards.academic.length},
    {id:"certifications", label:"Courses",      icon:"◎", count:owner.awards.certifications.length},
    {id:"volunteering",   label:"Volunteering", icon:"◈", count:owner.awards.volunteering.length},
    {id:"personal",       label:"Personal",     icon:"⬡", count:owner.awards.personal.length},
  ];
  const items = owner.awards[activeTab] || [];

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
        {categories.map(cat=>{
          const active=activeTab===cat.id;
          return(
            <button key={cat.id} onClick={()=>setActiveTab(cat.id)} style={{
              display:"flex",alignItems:"center",gap:6,padding:"7px 14px",borderRadius:R.full,
              border:active?"none":"1px solid "+T.glassBorder,cursor:"pointer",fontSize:12,fontWeight:600,
              background:active?T.accent:T.glassRaised, color:active?T.accentLabel:T.textSecondary,
              transition:"all 0.18s ease",
            }}>
              <span>{cat.icon}</span>{cat.label}
              <span style={{padding:"1px 6px",borderRadius:R.full,fontSize:10,background:active?"rgba(0,0,0,0.15)":T.accent+"20",color:active?T.accentLabel:T.accent}}>{cat.count}</span>
            </button>
          );
        })}
      </div>

      {activeTab==="academic" && owner.deanSemesters.length > 0 && (
        <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
          style={{padding:16,borderRadius:R.xl,background:T.accent+"0D",border:"1px solid "+T.accent+"30"}}>
          <div style={{fontSize:11,color:T.accent,fontWeight:700,marginBottom:12,letterSpacing:"0.06em"}}>GPA BREAKDOWN - {owner.deansList}× CONSECUTIVE</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
            {owner.deanSemesters.map((d,i)=>(
              <motion.div key={i} initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{delay:i*0.07}}
                style={{padding:"10px 6px",borderRadius:R.md,textAlign:"center",background:T.accent+"0A",border:"1px solid "+T.accent+"20"}}>
                <div style={{fontSize:17,fontWeight:800,color:T.accent}}>{d.gpa}</div>
                <div style={{fontSize:9,color:T.textMuted,marginTop:2,lineHeight:1.3}}>{d.sem}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}} transition={{duration:0.22}}
          style={{display:"flex",flexDirection:"column",gap:8}}>
          {items.map((item: any,i: number)=>(
            <motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.07}}
              style={{display:"flex",alignItems:"center",gap:14,padding:"14px 18px",borderRadius:R.lg,background:T.cardBg,border:"1px solid "+T.glassBorder}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:T.accent,flexShrink:0}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:13,fontWeight:700,color:T.textPrimary,marginBottom:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{item.title}</div>
                <div style={{fontSize:11,color:T.textSecondary}}>{item.issuer}</div>
              </div>
              <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4,flexShrink:0}}>
                <span style={{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:R.full,background:T.accent+"18",color:T.accent,border:"1px solid "+T.accent+"28"}}>{item.year}</span>
                {item.hasPdf&&<a href="#" target="_blank" rel="noopener noreferrer" style={{fontSize:10,color:T.accent,textDecoration:"none",fontWeight:600}}>PDF ↗</a>}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --------------------------------─
// CONTENT PANEL
// --------------------------------─
type SectionId = "about"|"skills"|"projects"|"experience"|"certs"|"contact";

function ContentPanel({ T, activeNav, onClose, owner }: { T:Theme; activeNav:SectionId; onClose:()=>void, owner: OwnerData }) {
  const panelStyle: React.CSSProperties = {
    position:"absolute", left:220, top:20, bottom:20,
    width:480, zIndex:40, borderRadius:R.xl, padding:28,
    display:"flex", flexDirection:"column",
    ...glassStyle(T, 22, true),
    overflow:"hidden",
  };

  const sections: Record<SectionId,{title:string;content:React.ReactNode}> = {
    about:{
      title:"About Me",
      content:(
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
            {[{l:"University",v:owner.uni},{l:"Year",v:owner.year},{l:"CGPA",v:owner.cgpa},{l:"Dean's List",v:`${owner.deansList}× Consecutive`},{l:"Location",v:owner.location},{l:"Status",v:"Open to Internship"}]
              .map((s,i)=>(
                <motion.div key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
                  style={{padding:"14px 16px",borderRadius:R.lg,background:T.cardBg,border:"1px solid "+T.glassBorder}}>
                  <div style={{fontSize:10,color:T.textMuted,marginBottom:4}}>{s.l.toUpperCase()}</div>
                  <div style={{fontSize:14,fontWeight:700,color:T.textPrimary}}>{s.v}</div>
                </motion.div>
              ))}
          </div>
          <div style={{padding:20,borderRadius:R.lg,background:T.cardBg,border:"1px solid "+T.glassBorder}}>
            <p style={{fontSize:14,lineHeight:1.85,color:T.textSecondary}}>{owner.bio}</p>
          </div>
        </div>
      ),
    },
    skills:{
      title:"Tech Stack",
      content:(
        <div style={{display:"flex",flexDirection:"column",gap:20}}>
          {Object.entries(owner.skills).map(([cat,skills],i)=>(
            <motion.div key={cat} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:i*0.1}}>
              <div style={{fontSize:11,color:T.textMuted,letterSpacing:"0.14em",marginBottom:10}}>{cat.toUpperCase()}</div>
              <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
                {skills.map((s,j)=>(
                  <motion.span key={j} whileHover={{y:-2,scale:1.04}}
                    style={{padding:"8px 16px",borderRadius:R.full,fontSize:13,fontWeight:600,background:T.cardBg,border:"1px solid "+T.glassBorder,color:T.textSecondary,cursor:"default"}}>
                    {s}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      ),
    },
    projects:{
      title:"Projects",
      content:(
        <div style={{position:"relative"}}>
          <div style={{position:"absolute",left:0,top:0,bottom:8,width:28,zIndex:2,pointerEvents:"none",background:"linear-gradient(to right,"+T.bg+"CC,transparent)"}}/>
          <div style={{position:"absolute",right:0,top:0,bottom:8,width:28,zIndex:2,pointerEvents:"none",background:"linear-gradient(to left,"+T.bg+"CC,transparent)"}}/>
          <div style={{display:"flex",gap:16,overflowX:"auto",paddingBottom:8,scrollbarWidth:"none"}}>
            {owner.projects.map((p,i)=>(
              <motion.div key={i} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.12}}
                whileHover={{y:-6}} style={{minWidth:260,borderRadius:R.xl,background:T.cardBg,border:"1px solid "+T.glassBorder,padding:24,display:"flex",flexDirection:"column",cursor:"pointer"}}>
                <div style={{fontSize:40,marginBottom:16}}>{p.emoji}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                  <h3 style={{fontSize:17,fontWeight:700,color:T.textPrimary,margin:0}}>{p.title}</h3>
                  <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:R.full,background:T.accent+"18",color:T.accent,border:"1px solid "+T.accent+"30"}}>{p.tag}</span>
                </div>
                <p style={{fontSize:13,color:T.textSecondary,lineHeight:1.65,marginBottom:16,flex:1}}>{p.desc}</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:16}}>
                  {p.tech.map((t,j)=><span key={j} style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:R.full,background:T.accent+"12",color:T.accent,border:"1px solid "+T.accent+"25"}}>{t}</span>)}
                </div>
                <div style={{display:"flex",gap:12}}>
                  <a href={p.demo} style={{fontSize:12,fontWeight:600,color:T.accent,textDecoration:"none"}}>Live ↗</a>
                  <a href={p.repo} style={{fontSize:12,fontWeight:600,color:T.textSecondary,textDecoration:"none"}}>GitHub →</a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ),
    },
    experience:{
      title:"Experience & Education",
      content:(
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {owner.experience.map((e,i)=>(
            <motion.div key={i} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}}
              style={{padding:"20px 24px",borderRadius:R.xl,background:T.cardBg,border:"1px solid "+T.glassBorder,borderLeft:"3px solid "+T.accent}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,flexWrap:"wrap",gap:8}}>
                <div>
                  <div style={{fontSize:15,fontWeight:700,color:T.textPrimary}}>{e.role}</div>
                  <div style={{fontSize:12,color:T.accent,marginTop:2}}>{e.org}</div>
                </div>
                <span style={{fontSize:11,color:T.textMuted,padding:"4px 12px",borderRadius:R.full,background:T.glassRaised,border:"1px solid "+T.glassBorder,whiteSpace:"nowrap"}}>{e.period}</span>
              </div>
              <p style={{fontSize:13,color:T.textSecondary,lineHeight:1.65}}>{e.desc}</p>
            </motion.div>
          ))}
        </div>
      ),
    },
    certs:{ title:"Awards & Credentials", content:<AwardsContent T={T} owner={owner}/> },
    contact: {
  title: "Get In Touch",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ padding: 20, borderRadius: R.xl, background: T.accent + "0D", border: "1px solid " + T.accent + "30", marginBottom: 4 }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ position: "relative", display: "inline-flex", width: 10, height: 10 }}>
                <motion.span
                  animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ position: "absolute", inset: 0, borderRadius: "50%", background: T.accent }}
                />
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: T.accent, display: "block" }} />
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: T.accent }}>Available for Internship · 2026</span>
            </div>
            <p style={{ fontSize: 13, color: T.textSecondary, lineHeight: 1.6 }}>Full-Stack Web Development · Malaysia · Open to hybrid or on-site</p>
          </motion.div>

          <ContactForm T={T} />

          {[
            { icon: "✉", l: "Email", v: owner.email, href: "mailto:" + owner.email },
            { icon: "⬡", l: "GitHub", v: "mohaddis88", href: owner.github },
            { icon: "◈", l: "LinkedIn", v: "mohaddis-hasan", href: owner.linkedin },
          ].map((s, i) => (
            <motion.a key={i} href={s.href}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderRadius: R.lg, background: T.cardBg, border: "1px solid " + T.glassBorder, textDecoration: "none" }}
              whileHover={{ x: 4 }}>
              <div style={{ width: 40, height: 40, borderRadius: R.md, background: T.accent + "18", border: "1px solid " + T.accent + "30", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: T.accent }}>
                {s.icon}
              </div>
              <div>
                <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 2 }}>{s.l}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>{s.v}</div>
              </div>
              <span style={{ marginLeft: "auto", color: T.accent, fontSize: 16 }}>→</span>
            </motion.a>
          ))}
        </div>
      ),
    },
  };

  const sec = sections[activeNav];
  if(!sec) return null;

  return(
    <motion.div key={activeNav} initial={{x:-60,opacity:0}} animate={{x:0,opacity:1}} exit={{x:-60,opacity:0}}
      transition={{type:"spring",stiffness:280,damping:28}} style={panelStyle}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24,flexShrink:0}}>
        <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:800,fontSize:26,color:T.textPrimary,margin:0}}>{sec.title}</h2>
        <button onClick={onClose} style={{width:32,height:32,borderRadius:R.full,border:"1px solid "+T.glassBorder,background:T.glassRaised,cursor:"pointer",color:T.textSecondary,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
      </div>
      <div style={{overflowY:"auto",flex:1,paddingRight:4,scrollbarWidth:"none"}}>{sec.content}</div>
    </motion.div>
  );
}

// --------------------------------─
// SIDEBAR 
// --------------------------------─
const NAV: {id:SectionId;label:string}[] = [
  {id:"about",      label:"About"},
  {id:"skills",     label:"Skills"},
  {id:"projects",   label:"Projects"},
  {id:"experience", label:"Experience"},
  {id:"certs",      label:"Awards"},
  {id:"contact",    label:"Contact"},
];

function Sidebar({ T, activeNav, onNav, owner }: { T:Theme; activeNav:SectionId|null; onNav:(id:SectionId)=>void; owner: OwnerData }) {
  const expanded = activeNav !== null;

  return(
    <motion.nav
      animate={{ width: expanded ? 200 : 80 }}
      transition={{ duration:0.5, ease:[0.19,1,0.22,1] }}
      style={{
        position:"relative", zIndex:50, flexShrink:0,
        height:"calc(100vh - 40px)", margin:"20px 0 20px 20px",
        borderRadius:R.xl, display:"flex", flexDirection:"column",
        alignItems:"center", padding:"24px 10px",
        ...glassStyle(T, 26, true),
        overflow:"hidden",
      }}
    >
      <div style={{fontSize:9,color:T.textMuted,letterSpacing:"0.16em",marginBottom:12,fontWeight:600,alignSelf:"center"}}>
        {expanded ? "NAVIGATE" : "NAV"}
      </div>

      <div style={{
        display:"flex", flexDirection:"column", gap:4,
        padding:"14px 8px", borderRadius:R.lg, width:"100%",
        background: T.isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.60)",
        border:"1px solid "+(T.isDark?"rgba(255,255,255,0.07)":"rgba(255,255,255,0.80)"),
        boxShadow: T.isDark ? "inset 0 1px 0 rgba(255,255,255,0.08)" : "inset 0 1px 0 rgba(255,255,255,0.90), 0 2px 8px rgba(0,0,0,0.04)",
      }}>
        {NAV.map(item=>{
          const active = activeNav===item.id;
          return(
            <motion.button key={item.id} onClick={()=>onNav(item.id)}
              whileHover={{scale:1.02}} whileTap={{scale:0.97}}
              style={{
                height: expanded ? 44 : 80, width:"100%",
                borderRadius:R.md, border:"none", fontSize:13,
                fontWeight: active ? 700 : 400, cursor:"pointer",
                color: active ? T.accentLabel : T.textSecondary,
                background: active ? T.accent : "transparent",
                display:"flex", alignItems:"center", justifyContent:"center",
                overflow:"hidden", transition:"background 0.2s,color 0.2s,height 0.5s",
              }}>
              <motion.span
                animate={{ rotate: expanded ? 0 : -90 }}
                transition={{ duration:0.5, ease:[0.19,1,0.22,1] }}
                style={{ whiteSpace:"nowrap", fontSize: expanded ? 13 : 11 }}
              >
                {item.label}
              </motion.span>
            </motion.button>
          );
        })}
      </div>

      <div style={{marginTop:"auto",display:"flex",flexDirection:"column",alignItems:"center",gap:6}}>
        <span style={{position:"relative",display:"inline-flex",width:10,height:10}}>
          <motion.span animate={{scale:[1,2.4,1],opacity:[0.6,0,0.6]}} transition={{duration:2.2,repeat:Infinity}}
            style={{position:"absolute",inset:0,borderRadius:"50%",background:T.accent}}/>
          <span style={{width:10,height:10,borderRadius:"50%",background:T.accent,display:"block"}}/>
        </span>
        <AnimatePresence>
          {expanded&&(
            <motion.span initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
              style={{fontSize:10,color:T.textSecondary,textAlign:"center",lineHeight:1.3}}>
              Open to<br/>Internship
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}

// --------------------------------─
// HOME VIEW
// --------------------------------─
function useInViewRef(): [React.RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return [ref, inView];
}

function HomeProjectCard({ p, i, T }: { p:OwnerData['projects'][0]; i:number; T:Theme }) {
  const [ref, inView] = useInViewRef();
  return(
    <motion.div ref={ref} initial={{ opacity:0, y:40 }} animate={inView ? { opacity:1, y:0 } : { opacity:0, y:40 }}
      transition={{ duration:0.65, delay:i*0.12, ease:[0.22,1,0.36,1] }}
      whileHover={{ y:-10, boxShadow:"0 24px 48px rgba(0,0,0,"+(T.isDark?"0.35":"0.12")+")" }}
      style={{ borderRadius:R.xl, padding:28, display:"flex", flexDirection:"column", cursor:"pointer", ...glassStyle(T, 12, false), transition:"box-shadow 0.3s" }}>
      <div style={{fontSize:44,marginBottom:18}}>{p.emoji}</div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <h3 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:18,fontWeight:700,color:T.textPrimary,margin:0}}>{p.title}</h3>
        <span style={{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:R.full,background:T.accent+"18",color:T.accent,border:"1px solid "+T.accent+"30"}}>{p.tag}</span>
      </div>
      <p style={{fontSize:13,color:T.textSecondary,lineHeight:1.7,marginBottom:16,flex:1}}>{p.desc}</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:16}}>
        {p.tech.map((t,j)=><span key={j} style={{fontSize:11,fontWeight:600,padding:"4px 11px",borderRadius:R.full,background:T.accent+"12",color:T.accent,border:"1px solid "+T.accent+"25"}}>{t}</span>)}
      </div>
      <div style={{display:"flex",gap:14}}>
        <a href={p.demo} style={{fontSize:12,fontWeight:700,color:T.accent,textDecoration:"none"}}>Live Demo ↗</a>
        <a href={p.repo} style={{fontSize:12,fontWeight:600,color:T.textSecondary,textDecoration:"none"}}>GitHub →</a>
      </div>
    </motion.div>
  );
}

function HomeExpCard({ e, i, T }: { e:OwnerData['experience'][0]; i:number; T:Theme }) {
  const [ref, inView] = useInViewRef();
  return(
    <motion.div ref={ref} initial={{opacity:0,y:30}} animate={inView?{opacity:1,y:0}:{opacity:0,y:30}}
      transition={{duration:0.6,delay:i*0.12,ease:[0.22,1,0.36,1]}}
      style={{padding:"20px 24px",borderRadius:R.xl,background:T.cardBg,border:"1px solid "+T.glassBorder,borderLeft:"3px solid "+T.accent}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6,flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.textPrimary}}>{e.role}</div>
          <div style={{fontSize:12,color:T.accent,marginTop:2}}>{e.org}</div>
        </div>
        <span style={{fontSize:11,color:T.textMuted,padding:"4px 12px",borderRadius:R.full,background:T.glassRaised,border:"1px solid "+T.glassBorder,whiteSpace:"nowrap"}}>{e.period}</span>
      </div>
      <p style={{fontSize:13,color:T.textSecondary,lineHeight:1.65}}>{e.desc}</p>
    </motion.div>
  );
}

function HomeView({ T, owner }: { T:Theme; owner: OwnerData }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPct, setScrollPct] = useState(0);
  const [projRef, projInView]   = useInViewRef();
  const [expRef,  expInView]    = useInViewRef();
  const [awardRef, awardInView] = useInViewRef();

  useEffect(()=>{
    const el=containerRef.current; if(!el) return;
    const onScroll=()=>{ setScrollPct(el.scrollTop/Math.max(1,el.scrollHeight-el.clientHeight)); };
    el.addEventListener("scroll",onScroll,{passive:true});
    return()=>el.removeEventListener("scroll",onScroll);
  },[]);

  const heroY   = Math.min(scrollPct*3,1)*-60;
  const heroOpa = Math.max(1-scrollPct*4,0);
  const allSkills = Object.values(owner.skills).flat();
  const marquee   = [...allSkills,...allSkills];

  return(
    <div ref={containerRef} style={{height:"100%",overflowY:"auto",position:"relative",scrollbarWidth:"none"}}>
      <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",justifyContent:"center",padding:"120px 8% 80px",position:"relative",overflow:"hidden"}}>
        
        {T.isDark ? <HeroShaderLayerDark /> : <HeroShaderLayer />}

        <div style={{transform:`translateY(${heroY}px)`,opacity:heroOpa,transition:"transform 0.1s,opacity 0.1s",position:"relative",zIndex:1}}>
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.1}}>
            <div style={{display:"inline-flex",alignItems:"center",gap:8,padding:"6px 14px",borderRadius:R.full,background:T.accent+"18",border:"1px solid "+T.accent+"35",marginBottom:28}}>
              <span style={{position:"relative",display:"inline-flex",width:7,height:7}}>
                <motion.span animate={{scale:[1,2.2,1],opacity:[0.7,0,0.7]}} transition={{duration:2,repeat:Infinity}} style={{position:"absolute",inset:0,borderRadius:"50%",background:T.accent}}/>
                <span style={{width:7,height:7,borderRadius:"50%",background:T.accent,display:"block"}}/>
              </span>
              <span style={{fontSize:12,fontWeight:600,color:T.accent}}>Available for Internship · 2026</span>
            </div>
          </motion.div>

          <motion.h1 initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.15,ease:[0.22,1,0.36,1]}}
            style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"clamp(3.2rem,8vw,6.5rem)",fontWeight:800,margin:"0 0 6px 0",lineHeight:1.0,letterSpacing:"-0.035em",color:T.textPrimary}}>
            {owner.last.toUpperCase()}
          </motion.h1>
          <motion.h1 initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{duration:0.8,delay:0.22,ease:[0.22,1,0.36,1]}}
            style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"clamp(3.2rem,8vw,6.5rem)",fontWeight:800,margin:"0 0 28px 0",lineHeight:1.0,letterSpacing:"-0.035em",color:T.accent}}>
            {owner.first.toUpperCase()}
          </motion.h1>

          <motion.p initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.4}}
            style={{fontSize:"1.2rem",color:T.textSecondary,maxWidth:520,lineHeight:1.7,marginBottom:40}}>
            {owner.role}. Building fast, beautiful, and memorable digital experiences from {owner.location}.
          </motion.p>

          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:0.55}} style={{display:"flex",gap:0,flexWrap:"wrap",marginBottom:48}}>
            {[{v:`${owner.deansList}×`,l:"Dean's List"},{v:owner.cgpa,l:"CGPA"},{v:"3rd",l:"Year"},{v:owner.location,l:"Location"}].map((s,i)=>(
              <div key={i} style={{padding:"14px 24px",borderRight:i<3?"1px solid "+T.glassBorder:"none"}}>
                <div style={{fontSize:22,fontWeight:800,color:T.textPrimary,fontFamily:"'Bricolage Grotesque',sans-serif"}}>{s.v}</div>
                <div style={{fontSize:11,color:T.textMuted,marginTop:2,letterSpacing:"0.06em"}}>{s.l.toUpperCase()}</div>
              </div>
            ))}
          </motion.div>

          <motion.div initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:0.65}} style={{display:"flex",gap:12,flexWrap:"wrap"}}>
            <button style={{padding:"13px 28px",borderRadius:R.full,border:"none",cursor:"pointer",background:T.accent,color:T.accentLabel,fontSize:14,fontWeight:700,boxShadow:"0 4px 20px "+T.accent+"40"}}>
              View Projects ↓
            </button>
          </motion.div>
        </div>

        <motion.div animate={{y:[0,10,0]}} transition={{duration:2,repeat:Infinity,ease:"easeInOut"}}
          style={{position:"absolute",bottom:40,left:"8%",display:"flex",alignItems:"center",gap:8,zIndex:1}}>
          <span style={{fontSize:11,color:T.textMuted,letterSpacing:"0.1em"}}>SCROLL</span>
          <span style={{fontSize:16,color:T.textMuted}}>↓</span>
        </motion.div>
      </section>

      {/* SKILLS MARQUEE */}
      <section style={{padding:"60px 0",borderTop:"1px solid "+T.glassBorder,borderBottom:"1px solid "+T.glassBorder,overflow:"hidden",background:T.isDark?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.60)"}}>
        <motion.div animate={{x:["0%","-50%"]}} transition={{duration:28,ease:"linear",repeat:Infinity}}
          style={{display:"flex",gap:20,width:"max-content",alignItems:"center"}}>
          {marquee.map((s,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 18px",borderRadius:R.full,background:T.cardBg,border:"1px solid "+T.glassBorder,fontSize:13,fontWeight:600,color:T.textSecondary,whiteSpace:"nowrap"}}>
              <span style={{fontSize:14,color:T.accent}}>◆</span>{s}
            </div>
          ))}
        </motion.div>
      </section>

      {/* PROJECTS */}
      <section style={{padding:"100px 8%"}}>
        <motion.div ref={projRef} initial={{opacity:0,y:30}} animate={projInView?{opacity:1,y:0}:{opacity:0,y:30}} transition={{duration:0.65,ease:[0.22,1,0.36,1]}}>
          <p style={{fontFamily:"monospace",fontSize:11,color:T.accent,letterSpacing:"0.18em",marginBottom:10}}>// featured_work</p>
          <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"clamp(1.8rem,4vw,2.8rem)",fontWeight:800,color:T.textPrimary,marginBottom:8,letterSpacing:"-0.02em"}}>Things I&apos;ve Built</h2>
          <p style={{color:T.textSecondary,marginBottom:48,fontSize:15}}>Real projects, real problems, real code.</p>
        </motion.div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",gap:20}}>
          {owner.projects.map((p,i)=><HomeProjectCard key={i} p={p} i={i} T={T}/>)}
        </div>
      </section>

      {/* EXPERIENCE */}
      <section style={{padding:"80px 8%",background:T.isDark?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.50)"}}>
        <motion.div ref={expRef} initial={{opacity:0,y:30}} animate={expInView?{opacity:1,y:0}:{opacity:0,y:30}} transition={{duration:0.65,ease:[0.22,1,0.36,1]}}>
          <p style={{fontFamily:"monospace",fontSize:11,color:T.accent,letterSpacing:"0.18em",marginBottom:10}}>// journey</p>
          <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"clamp(1.8rem,4vw,2.8rem)",fontWeight:800,color:T.textPrimary,marginBottom:48,letterSpacing:"-0.02em"}}>Experience & Education</h2>
        </motion.div>
        <div style={{maxWidth:640,display:"flex",flexDirection:"column",gap:16}}>
          {owner.experience.map((e,i)=><HomeExpCard key={i} e={e} i={i} T={T}/>)}
        </div>
      </section>

      {/* AWARDS */}
      <section style={{padding:"80px 8%",background:T.isDark?"rgba(255,255,255,0.02)":"rgba(255,255,255,0.50)"}}>
        <motion.div ref={awardRef} initial={{opacity:0,y:30}} animate={awardInView?{opacity:1,y:0}:{opacity:0,y:30}} transition={{duration:0.65,ease:[0.22,1,0.36,1]}}>
          <p style={{fontFamily:"monospace",fontSize:11,color:T.accent,letterSpacing:"0.18em",marginBottom:10}}>// recognition</p>
          <h2 style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"clamp(1.8rem,4vw,2.8rem)",fontWeight:800,color:T.textPrimary,marginBottom:36,letterSpacing:"-0.02em"}}>Academic Awards</h2>
        </motion.div>
        <div style={{padding:28,borderRadius:R.xl,maxWidth:640,...glassStyle(T,12,false)}}>
          <div style={{fontSize:14,color:T.accent,fontWeight:700,marginBottom:20}}>◆ {owner.deansList}× Consecutive Dean&apos;s List · {owner.uni}</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {owner.deanSemesters.map((d,i)=>(
              <motion.div key={i} initial={{opacity:0,y:10}} animate={awardInView?{opacity:1,y:0}:{opacity:0,y:10}} transition={{delay:i*0.08}}
                style={{padding:"14px 10px",borderRadius:R.lg,textAlign:"center",background:T.accent+"0D",border:"1px solid "+T.accent+"25"}}>
                <div style={{fontSize:20,fontWeight:800,color:T.accent,fontFamily:"'Bricolage Grotesque',sans-serif"}}>{d.gpa}</div>
                <div style={{fontSize:10,color:T.textMuted,marginTop:3}}>{d.sem}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{padding:"32px 8%",borderTop:"1px solid "+T.glassBorder,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
        <span style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:800,fontSize:15,color:T.textPrimary}}>
          {owner.initials}<span style={{color:T.accent}}>.</span>
        </span>
        <span style={{fontSize:12,color:T.textMuted}}>© 2026 {owner.name} · Built with Next.js + Supabase</span>
        <div style={{display:"flex",gap:16}}>
          {[{l:"GitHub",u:owner.github},{l:"LinkedIn",u:owner.linkedin},{l:"Email",u:"mailto:"+owner.email}].map((s,i)=>(
            <a key={i} href={s.u} style={{fontSize:12,fontWeight:600,color:T.textSecondary,textDecoration:"none"}}>{s.l} ↗</a>
          ))}
        </div>
      </footer>

      {/* Watermark */}
      <div style={{position:"sticky",bottom:0,left:0,right:0,zIndex:0,pointerEvents:"none",overflow:"hidden",display:"flex",justifyContent:"center",marginTop:-70}}>
        <div style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:"clamp(5rem,13vw,10rem)",fontWeight:800,color:"transparent",letterSpacing:"-0.04em",lineHeight:1,WebkitTextStroke:"1px "+T.accent+"10",userSelect:"none",whiteSpace:"nowrap"}}>
          {owner.name.toUpperCase()}
        </div>
      </div>
    </div>
  );
}

// --------------------------------─
// CHAT VIEW
// --------------------------------─
interface Msg { id:number; role:"ai"|"user"; text:string; richType:string|null; chips:string[]; }

function ChatView({ T, owner }: { T:Theme, owner: OwnerData }) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLInputElement>(null);
  const prefersReduced = useReducedMotion();
  const [chatActive, setChatActive] = useState(false);
  const [inputVal,   setInputVal]   = useState("");
  const [isTyping,   setIsTyping]   = useState(false);
  
  const CHIPS = getChips(owner.first);
  const [messages, setMessages] = useState<Msg[]>([]);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:prefersReduced?"auto":"smooth"}); },[messages,isTyping,prefersReduced]);

  const send = useCallback(async(prompt:string)=>{
    if(!prompt.trim()||isTyping) return;
    setChatActive(true);
    setMessages(p=>[...p,{id:Date.now(),role:"user",text:prompt,richType:null,chips:[]}]);
    setInputVal(""); setIsTyping(true);
    try {
      let result;
      if(GEMINI_KEY!=="YOUR_GEMINI_API_KEY"){
        const hist = messages.map(m=>({role:m.role,text:m.text}));
        result = await callGemini(prompt,hist,owner);
      } else {
        await new Promise(r=>setTimeout(r,650+Math.random()*350));
        result = getFallback(prompt,owner);
      }
      setIsTyping(false);
      setMessages(p=>[...p,{id:Date.now()+1,role:"ai",text:result.text,richType:result.richType??null,chips:CHIPS[result.section as keyof typeof CHIPS]??CHIPS.default}]);
    } catch {
      setIsTyping(false);
      setMessages(p=>[...p,{id:Date.now()+1,role:"ai",text:"Something went wrong - try again in a moment.",richType:null,chips:CHIPS.default}]);
    }
  },[messages,isTyping,owner,CHIPS]);

  const handleKey=(e:React.KeyboardEvent)=>{ if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send(inputVal);} };
  const resetChat=()=>{ setMessages([{id:0,role:"ai",text:"Welcome back! Start a new question anytime.",richType:null,chips:CHIPS.default}]); setChatActive(false); };

  return(
    <motion.div key="chat" initial={{opacity:0,scale:0.98}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.98}}
      style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:chatActive?"space-between":"center",padding:"40px 8%"}}>

      <motion.div layout style={{display:"flex",flexDirection:chatActive?"row":"column",alignItems:"center",gap:chatActive?24:32,alignSelf:chatActive?"flex-start":"center"}}>
        <motion.div layout style={{width:chatActive?64:120,height:chatActive?64:120,flexShrink:0}}>
          <PixelAvatar T={T} />
        </motion.div>
        <motion.div layout style={{textAlign:chatActive?"left":"center"}}>
          <motion.h1 layout style={{margin:0,fontFamily:"'Bricolage Grotesque',sans-serif",fontSize:chatActive?"28px":"48px",fontWeight:800,letterSpacing:"-0.02em",color:T.textPrimary}}>
            Hi! I'm Mino.
          </motion.h1>
          <motion.p layout style={{margin:0,fontSize:chatActive?"14px":"18px",color:T.textSecondary,fontWeight:500,maxWidth:"400px",lineHeight:1.5}}>
            {owner.first}'s digital assistant. I'm here to help you explore his work, skills, and experience.
          </motion.p>
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {chatActive&&(
          <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}}
            style={{flex:1,width:"100%",overflowY:"auto",padding:"28px 0",display:"flex",flexDirection:"column",gap:0,scrollbarWidth:"none"}}>
            {messages.map((msg,idx)=>(
              <div key={msg.id}>
                <motion.div initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} transition={{duration:0.38,ease:[0.22,1,0.36,1]}}
                  style={{display:"flex",justifyContent:msg.role==="ai"?"flex-start":"flex-end",marginBottom:12}}>
                  {msg.role==="ai"&&(
                    <div style={{width:30,height:30,flexShrink:0,marginRight:9,marginTop:3}}>
                      <PixelAvatar T={T} />
                    </div>
                  )}
                  <div style={{maxWidth:"76%",padding:"11px 16px",
                    borderRadius:msg.role==="ai"?"6px 16px 16px 16px":"16px 6px 16px 16px",
                    background:msg.role==="ai"?T.glassRaised:T.accent+"22",
                    border:"1px solid "+(msg.role==="ai"?T.glassBorder:T.accent+"35"),
                    backdropFilter:"blur(8px)"}}>
                    <p style={{fontSize:13,lineHeight:1.75,color:T.textPrimary,margin:0,whiteSpace:"pre-wrap"}}>{msg.text}</p>
                    {msg.richType&&<RichCard type={msg.richType} T={T} owner={owner}/>}
                  </div>
                </motion.div>
                {msg.role==="ai"&&msg.chips.length>0&&idx===messages.length-1&&!isTyping&&(
                  <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:0.3}}
                    style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:16,paddingLeft:39}}>
                    {msg.chips.map((c,i)=>(
                      <motion.button key={i} onClick={()=>send(c)} whileHover={{scale:1.03}}
                        style={{padding:"5px 13px",borderRadius:R.full,fontSize:11,fontWeight:500,border:"1px solid "+T.glassBorder,background:T.glassRaised,color:T.accent,cursor:"pointer"}}>
                        {c}
                      </motion.button>
                    ))}
                  </motion.div>
                )}
              </div>
            ))}
            {isTyping&&(
              <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0}}
                style={{display:"flex",alignItems:"flex-start",gap:9,marginBottom:12}}>
                <div style={{width:30,height:30,flexShrink:0}}>
                  <PixelAvatar T={T} />
                </div>
                <div style={{padding:"12px 16px",borderRadius:"6px 16px 16px 16px",background:T.glassRaised,border:"1px solid "+T.glassBorder,display:"flex",gap:5,alignItems:"center"}}>
                  {[0,1,2].map(i=>(
                    <motion.div key={i} animate={{y:[0,-5,0],opacity:[0.4,1,0.4]}} transition={{duration:0.9,repeat:Infinity,delay:i*0.18}}
                      style={{width:6,height:6,borderRadius:"50%",background:T.accent}}/>
                  ))}
                </div>
              </motion.div>
            )}
            <div ref={bottomRef} style={{height:1}}/>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div layout style={{width:"100%",marginTop:chatActive?0:36}}>
        <div style={{display:"flex",alignItems:"center",padding:"6px",borderRadius:R.full,...glassStyle(T,12,true)}}>
          <AnimatePresence>
            {chatActive&&(
              <motion.button initial={{opacity:0,width:0}} animate={{opacity:1,width:"auto"}} exit={{opacity:0,width:0}}
                onClick={resetChat}
                style={{height:34,padding:"0 12px",borderRadius:R.full,border:"1px solid "+T.glassBorder,background:"transparent",color:T.textSecondary,fontSize:12,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,marginRight:6}}>
                + New
              </motion.button>
            )}
          </AnimatePresence>
          <input ref={inputRef} value={inputVal} onChange={e=>setInputVal(e.target.value)} onKeyDown={handleKey} disabled={isTyping}
            placeholder="Ask Mino anything..."
            style={{flex:1,background:"transparent",border:"none",outline:"none",padding:"10px 12px",fontSize:15,color:T.textPrimary,fontFamily:"inherit",minWidth:0}}/>
          <motion.button onClick={()=>send(inputVal)} disabled={!inputVal.trim()||isTyping}
            whileHover={inputVal.trim()&&!isTyping?{scale:1.04}:{}} whileTap={inputVal.trim()&&!isTyping?{scale:0.93}:{}}
            style={{width:40,height:40,borderRadius:R.md,border:"none",flexShrink:0,
              background:inputVal.trim()&&!isTyping?T.accent:T.accent+"18",
              color:inputVal.trim()&&!isTyping?T.accentLabel:T.textMuted,
              cursor:inputVal.trim()&&!isTyping?"pointer":"not-allowed",
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,fontWeight:900,lineHeight:1,
              transition:"background 0.2s,color 0.2s"}}>
            ↑
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --------------------------------─
// ROOT - FETCHES SUPABASE DB DATA
// --------------------------------─
export default function Portfolio() {
  const [isDark,    setIsDark]    = useState(false);
  const [viewMode,  setViewMode]  = useState<"chat"|"home">("chat");
  const [activeNav, setActiveNav] = useState<SectionId|null>(null);
  
  const [owner, setOwner] = useState<OwnerData>(DEFAULT_OWNER);
  const [loading, setLoading] = useState(true);

  const T = isDark ? DARK : LIGHT;

  useEffect(() => {
    async function fetchDb() {
      try {
        const supabase = createClient();
        const [ {data: set}, {data: proj}, {data: exp}, {data: awd} ] = await Promise.all([
          supabase.from('site_settings').select('*'),
          supabase.from('projects').select('*').eq('visible', true).order('sort_order'),
          supabase.from('experience').select('*').eq('visible', true).order('sort_order'),
          supabase.from('awards').select('*').eq('visible', true).order('sort_order')
        ]);

        const sMap: Record<string, string> = {};
        set?.forEach(row => sMap[row.key] = row.value);

        const liveOwner: OwnerData = JSON.parse(JSON.stringify(DEFAULT_OWNER));

        if (sMap['owner_name']) {
            liveOwner.name = sMap['owner_name'];
            const parts = sMap['owner_name'].split(' ');
            liveOwner.first = parts[0];
            liveOwner.last = parts.slice(1).join(' ');
            liveOwner.initials = parts.map(n => n[0]).join('').toUpperCase();
        }
        if (sMap['owner_role']) liveOwner.role = sMap['owner_role'];
        if (sMap['owner_bio']) liveOwner.bio = sMap['owner_bio'];
        if (sMap['owner_uni']) liveOwner.uni = sMap['owner_uni'];
        if (sMap['owner_year']) liveOwner.year = sMap['owner_year'];
        if (sMap['owner_location']) liveOwner.location = sMap['owner_location'];
        if (sMap['owner_cgpa']) liveOwner.cgpa = sMap['owner_cgpa'];
        if (sMap['owner_dean_list']) liveOwner.deansList = parseInt(sMap['owner_dean_list']) || 0;
        if (sMap['social_email']) liveOwner.email = sMap['social_email'];
        if (sMap['social_github']) liveOwner.github = sMap['social_github'];
        if (sMap['social_linkedin']) liveOwner.linkedin = sMap['social_linkedin'];
        if (sMap['bg_music_url']) liveOwner.bgMusic = sMap['bg_music_url'];

        if (proj && proj.length > 0) {
            liveOwner.projects = proj.map(p => ({
                title: p.title,
                tag: p.category || "Project",
                desc: p.description || "",
                tech: p.tech_stack || [],
                demo: p.demo_url || "#",
                repo: p.repo_url || "#",
                emoji: "🚀"
            }));
        }

        if (exp && exp.length > 0) {
            liveOwner.experience = exp.map(e => ({
                role: e.role,
                org: e.org,
                period: e.period,
                desc: e.description || ""
            }));
        }

        if (awd && awd.length > 0) {
            const academic = awd.filter(a => a.category === 'academic');
            const certs = awd.filter(a => a.category === 'certifications');

            if (academic.length > 0) {
               liveOwner.awards.academic = academic.map(a => ({ title: a.title, issuer: a.issuer, year: a.year || "", gpa: a.gpa || "", hasPdf: !!a.pdf_url }));
               liveOwner.deanSemesters = academic.map(a => ({ sem: a.year || "", gpa: a.gpa || "" }));
            }
            if (certs.length > 0) {
               liveOwner.awards.certifications = certs.map(a => ({ title: a.title, issuer: a.issuer, year: a.year || "", hasPdf: !!a.pdf_url }));
               liveOwner.certs = certs.map(a => ({ title: a.title, issuer: a.issuer, year: a.year || "" }));
            }
        }
        
        setOwner(liveOwner);
      } catch (e) {
        console.error("DB Fetch Error", e);
      } finally {
        setLoading(false);
      }
    }
    fetchDb();
  }, []);

  const handleNav = useCallback((id:SectionId)=>setActiveNav(p=>p===id?null:id),[]);
  const closeNav  = useCallback(()=>setActiveNav(null),[]);

  if (loading) {
    return (
      <div style={{ width: "100vw", height: "100vh", backgroundColor: T.bg, display: "flex", justifyContent: "center", alignItems: "center" }}>
         <div style={{ width: 80, height: 80 }}><PixelAvatar T={T} /></div>
      </div>
    );
  }

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800&family=Inter:wght@400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        html,body{width:100%;height:100%;}
        input,button{font-family:inherit;}
      `}</style>

      <div style={{width:"100vw",height:"100vh",overflow:"hidden",backgroundColor:T.bg,position:"relative",color:T.textPrimary,transition:"background-color 0.4s",display:"flex",fontFamily:"'Inter',-apple-system,system-ui,sans-serif"}}>
        <LiquidBg T={T}/>
        <div style={{position:"fixed",inset:0,zIndex:1,pointerEvents:"none",opacity:isDark?0.04:0.025,backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"}}/>

        <div style={{position:"fixed",top:24,right:28,zIndex:50,display:"flex",gap:10}}>
          <motion.button whileHover={{scale:1.04}} whileTap={{scale:0.97}}
            onClick={()=>setViewMode(v=>v==="home"?"chat":"home")}
            style={{padding:"0 22px",height:44,borderRadius:R.full,border:"none",cursor:"pointer",background:T.accent,color:T.accentLabel,fontWeight:700,fontSize:13,boxShadow:"0 6px 20px "+T.accent+"35"}}>
            {viewMode==="home"?"Ask Mino":"Home"}
          </motion.button>
          <button onClick={()=>setIsDark(d=>!d)}
            style={{width:44,height:44,borderRadius:"50%",border:"none",cursor:"pointer",...glassStyle(T,12),fontSize:18}}>
            {isDark?"☀️":"🌙"}
          </button>
          <AudioCtrl T={T} musicUrl={owner.bgMusic} />
        </div>

        <Sidebar T={T} activeNav={activeNav} onNav={handleNav} owner={owner}/>

        <AnimatePresence>
          {activeNav&&(
            <div onClick={e=>e.stopPropagation()}>
              <ContentPanel T={T} activeNav={activeNav} onClose={closeNav} owner={owner}/>
            </div>
          )}
        </AnimatePresence>

        <div style={{flex:1,position:"relative",zIndex:20,overflow:"hidden"}} onClick={closeNav}>
          <AnimatePresence mode="wait">
            {viewMode==="chat"
              ? <ChatView key="chat" T={T} owner={owner}/>
              : <HomeView key="home" T={T} owner={owner}/>
            }
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}