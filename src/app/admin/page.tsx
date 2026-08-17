"use client";
// app/admin/page.tsx
// Full admin dashboard - all sections in one file.
// On theme: dark glass panels, champagne gold accent.
// Sections: Dashboard, Projects, Recognition, Writing, Experience, Photos, Messages, Settings

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// ── Design tokens ─────────────────────────────────────────────
const T = {
  bg:          "#1A1614",
  bgSurface:   "#211C19",
  glass:       "rgba(15,11,9,0.64)",
  glassRaised: "rgba(22,17,14,0.80)",
  border:      "rgba(255,255,255,0.09)",
  borderStrong:"rgba(212,184,150,0.25)",
  accent:      "#D4B896",
  accentDim:   "rgba(212,184,150,0.15)",
  accentLabel: "#1A1614",
  text:        "#F5F0EA",
  textSub:     "#A89F91",
  textMuted:   "#6B6158",
  error:       "#FCA5A5",
  errorBg:     "rgba(239,68,68,0.10)",
  success:     "#6EE7B7",
  successBg:   "rgba(110,231,183,0.10)",
};

const R = { xl: 20, lg: 14, md: 10, sm: 6, full: 9999 };

// ── Glass panel style ─────────────────────────────────────────
const glass = (elevated = false): React.CSSProperties => ({
  background: T.glass,
  backdropFilter: "blur(20px) saturate(200%) brightness(1.10)",
  WebkitBackdropFilter: "blur(20px) saturate(200%) brightness(1.10)",
  border: "1px solid " + T.border,
  borderRadius: R.xl,
  boxShadow: elevated
    ? ["0 0 0 0.5px rgba(255,255,255,0.06)", "0 20px 60px rgba(0,0,0,0.55)", "0 8px 24px rgba(0,0,0,0.35)", "inset 0 1.5px 0 rgba(255,255,255,0.18)"].join(", ")
    : ["0 0 0 0.5px rgba(255,255,255,0.05)", "0 8px 32px rgba(0,0,0,0.45)", "inset 0 1px 0 rgba(255,255,255,0.10)"].join(", "),
});

// ── Shared input style ────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px",
  borderRadius: R.md,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.10)",
  color: T.text, fontSize: 14,
  fontFamily: "inherit", outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s",
};

// ── Navigation items ──────────────────────────────────────────
const NAV = [
  { id: "dashboard",   label: "Dashboard",   icon: "◈" },
  { id: "projects",    label: "Projects",    icon: "◫" },
  { id: "recognition", label: "Recognition", icon: "◆" },
  { id: "writing",     label: "Writing",     icon: "✦" },
  { id: "experience",  label: "Experience",  icon: "◎" },
  { id: "photos",      label: "Photos",      icon: "⬡" },
  { id: "messages",    label: "Messages",    icon: "◉" },
  { id: "settings",    label: "Settings",    icon: "⚙" },
];

// ── Types ─────────────────────────────────────────────────────
type Project    = { id:string; title:string; tagline:string; description:string; image_url:string; demo_url:string; repo_url:string; tech_stack:string[]; category:string; featured:boolean; visible:boolean; sort_order:number; };
type Award      = { id:string; title:string; issuer:string; year:string; gpa:string; category:string; pdf_url:string; visible:boolean; sort_order:number; };
type Article    = { id:string; title:string; publication:string; article_url:string; published_at:string; excerpt:string; cover_url:string; visible:boolean; sort_order:number; };
type Experience = { id:string; role:string; org:string; period:string; description:string; type:string; visible:boolean; sort_order:number; };
type Photo      = { id:string; url:string; caption:string; sort_order:number; };
type Message    = { id:string; name:string; email:string; subject:string; message:string; read:boolean; created_at:string; };
type Setting    = { key:string; value:string; };

// ── Toast ─────────────────────────────────────────────────────
function Toast({ msg, type, onClose }: { msg:string; type:"success"|"error"; onClose:()=>void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <div style={{
      position: "fixed", top: 24, right: 24, zIndex: 999,
      padding: "12px 18px", borderRadius: R.lg,
      background: type === "success" ? T.successBg : T.errorBg,
      border: "1px solid " + (type === "success" ? "rgba(110,231,183,0.30)" : "rgba(239,68,68,0.30)"),
      color: type === "success" ? T.success : T.error,
      fontSize: 13, fontWeight: 600,
      display: "flex", alignItems: "center", gap: 8,
      boxShadow: "0 8px 32px rgba(0,0,0,0.40)",
      backdropFilter: "blur(12px)",
    }}>
      <span>{type === "success" ? "✓" : "⚠"}</span>
      {msg}
    </div>
  );
}

// ── Confirm dialog ────────────────────────────────────────────
function ConfirmDialog({ msg, onConfirm, onCancel }: { msg:string; onConfirm:()=>void; onCancel:()=>void }) {
  return (
    <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.70)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ ...glass(true), padding:28, maxWidth:360, width:"100%", margin:24 }}>
        <p style={{ color:T.text, fontSize:15, marginBottom:24, lineHeight:1.6 }}>{msg}</p>
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end" }}>
          <button onClick={onCancel} style={{ padding:"9px 18px", borderRadius:R.md, border:"1px solid "+T.border, background:"transparent", color:T.textSub, cursor:"pointer", fontSize:13 }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding:"9px 18px", borderRadius:R.md, border:"none", background:T.error+"30", color:T.error, cursor:"pointer", fontSize:13, fontWeight:600 }}>Delete</button>
        </div>
      </div>
    </div>
  );
}

// ── Label + input wrapper ─────────────────────────────────────
function Field({ label, children }: { label:string; children:React.ReactNode }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <label style={{ fontSize:11, fontWeight:600, color:T.textMuted, letterSpacing:"0.08em" }}>{label.toUpperCase()}</label>
      {children}
    </div>
  );
}

// ── File Upload Button ────────────────────────────────────────
function UploadBtn({ label, accept, bucket, onUploaded }: { label:string; accept:string; bucket:string; onUploaded:(url:string)=>void }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true);
    const ext  = file.name.split(".").pop();
    const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
    if (error) { setUploading(false); return; }
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    onUploaded(data.publicUrl);
    setUploading(false);
  };

  return (
    <>
      <input ref={inputRef} type="file" accept={accept} onChange={handleUpload} style={{ display:"none" }} />
      <button type="button" onClick={() => inputRef.current?.click()}
        style={{ padding:"9px 16px", borderRadius:R.md, border:"1px solid "+T.borderStrong, background:T.accentDim, color:T.accent, cursor:"pointer", fontSize:12, fontWeight:600, fontFamily:"inherit", transition:"background 0.2s" }}>
        {uploading ? "Uploading..." : label}
      </button>
    </>
  );
}

// ═════════════════════════════════════════════════════════════
// SECTION: DASHBOARD
// ═════════════════════════════════════════════════════════════
function DashboardSection({ supabase, setPage }: { supabase:ReturnType<typeof createClient>; setPage:(p:string)=>void }) {
  const [stats, setStats] = useState({ projects:0, awards:0, writing:0, messages:0, unread:0 });

  useEffect(() => {
    Promise.all([
      supabase.from("projects").select("id", { count:"exact" }),
      supabase.from("awards").select("id", { count:"exact" }),
      supabase.from("writing").select("id", { count:"exact" }),
      supabase.from("messages").select("id", { count:"exact" }),
      supabase.from("messages").select("id", { count:"exact" }).eq("read", false),
    ]).then(([p, a, w, m, u]) => {
      setStats({ projects: p.count??0, awards: a.count??0, writing: w.count??0, messages: m.count??0, unread: u.count??0 });
    });
  }, [supabase]);

  const statCards = [
    { label:"Projects",   value:stats.projects, page:"projects",    icon:"◫" },
    { label:"Awards",     value:stats.awards,   page:"recognition", icon:"◆" },
    { label:"Articles",   value:stats.writing,  page:"writing",     icon:"✦" },
    { label:"Messages",   value:stats.messages, page:"messages",    icon:"◉", badge:stats.unread },
  ];

  return (
    <div>
      <h2 style={{ fontSize:22, fontWeight:800, color:T.text, marginBottom:8, fontFamily:"'Bricolage Grotesque',sans-serif" }}>Dashboard</h2>
      <p style={{ color:T.textMuted, fontSize:14, marginBottom:28 }}>Your portfolio at a glance.</p>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:14, marginBottom:32 }}>
        {statCards.map(s => (
          <button key={s.page} onClick={() => setPage(s.page)}
            style={{ ...glass(), padding:"22px 20px", cursor:"pointer", textAlign:"left", border:"1px solid "+T.border, transition:"border-color 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = T.borderStrong)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:12 }}>
              <span style={{ fontSize:18, color:T.accent }}>{s.icon}</span>
              {s.badge ? <span style={{ fontSize:11, fontWeight:700, padding:"2px 8px", borderRadius:R.full, background:T.accentDim, color:T.accent }}>{s.badge} new</span> : null}
            </div>
            <div style={{ fontSize:32, fontWeight:800, color:T.text, fontFamily:"'Bricolage Grotesque',sans-serif" }}>{s.value}</div>
            <div style={{ fontSize:12, color:T.textMuted, marginTop:4 }}>{s.label}</div>
          </button>
        ))}
      </div>

      <div style={{ ...glass(), padding:"20px 24px" }}>
        <p style={{ fontSize:13, color:T.textMuted, lineHeight:1.8 }}>
          <strong style={{ color:T.textSub }}>Quick tips:</strong><br/>
          • Add your real email, GitHub and LinkedIn in <button onClick={() => setPage("settings")} style={{ background:"none", border:"none", color:T.accent, cursor:"pointer", fontSize:13, padding:0, textDecoration:"underline" }}>Settings</button> first.<br/>
          • Toggle section visibility in Settings - sections with no content can be hidden.<br/>
          • Upload PDFs for your certificates in <button onClick={() => setPage("recognition")} style={{ background:"none", border:"none", color:T.accent, cursor:"pointer", fontSize:13, padding:0, textDecoration:"underline" }}>Recognition</button>.<br/>
          • Upload up to 4 photos for the About section in <button onClick={() => setPage("photos")} style={{ background:"none", border:"none", color:T.accent, cursor:"pointer", fontSize:13, padding:0, textDecoration:"underline" }}>Photos</button>.
        </p>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SECTION: PROJECTS
// ═════════════════════════════════════════════════════════════
function ProjectsSection({ supabase, toast }: { supabase:ReturnType<typeof createClient>; toast:(m:string,t:"success"|"error")=>void }) {
  const [items,     setItems]     = useState<Project[]>([]);
  const [editing,   setEditing]   = useState<Project|null>(null);
  const [isNew,     setIsNew]     = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [confirm,   setConfirm]   = useState<string|null>(null);

  const blank: Omit<Project,"id"> = { title:"", tagline:"", description:"", image_url:"", demo_url:"", repo_url:"", tech_stack:[], category:"Full-Stack", featured:false, visible:true, sort_order:0 };

  const load = useCallback(async () => {
    const { data } = await supabase.from("projects").select("*").order("sort_order");
    setItems(data ?? []);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const { id, ...rest } = editing;
    const op = isNew
      ? supabase.from("projects").insert(rest)
      : supabase.from("projects").update(rest).eq("id", id);
    const { error } = await op;
    setSaving(false);
    if (error) { toast("Save failed: " + error.message, "error"); return; }
    toast(isNew ? "Project added!" : "Project saved!", "success");
    setEditing(null); setIsNew(false); load();
  };

  const del = async (id: string) => {
    await supabase.from("projects").delete().eq("id", id);
    toast("Project deleted.", "success"); setConfirm(null); load();
  };

  const toggleVisible = async (item: Project) => {
    await supabase.from("projects").update({ visible: !item.visible }).eq("id", item.id);
    load();
  };

  if (editing) {
    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
          <button onClick={() => { setEditing(null); setIsNew(false); }} style={{ background:"none", border:"none", color:T.textSub, cursor:"pointer", fontSize:22, lineHeight:1 }}>←</button>
          <h2 style={{ fontSize:20, fontWeight:800, color:T.text, fontFamily:"'Bricolage Grotesque',sans-serif" }}>{isNew ? "Add Project" : "Edit Project"}</h2>
        </div>

        <div style={{ ...glass(), padding:28, display:"flex", flexDirection:"column", gap:18 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Title"><input style={inputStyle} value={editing.title} onChange={e => setEditing({...editing,title:e.target.value})} placeholder="StudySync" /></Field>
            <Field label="Category"><select style={inputStyle} value={editing.category} onChange={e => setEditing({...editing,category:e.target.value})}>
              {["Full-Stack","Frontend","Backend","Mobile","AI/ML","Design","Other"].map(c=><option key={c} value={c}>{c}</option>)}
            </select></Field>
          </div>
          <Field label="Tagline (short)"><input style={inputStyle} value={editing.tagline} onChange={e => setEditing({...editing,tagline:e.target.value})} placeholder="Real-time collaborative study platform" /></Field>
          <Field label="Description"><textarea style={{...inputStyle,minHeight:100,resize:"vertical"}} value={editing.description} onChange={e => setEditing({...editing,description:e.target.value})} placeholder="Describe the project, what problem it solves, what you learned..." /></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Demo URL"><input style={inputStyle} value={editing.demo_url} onChange={e => setEditing({...editing,demo_url:e.target.value})} placeholder="https://..." /></Field>
            <Field label="GitHub URL"><input style={inputStyle} value={editing.repo_url} onChange={e => setEditing({...editing,repo_url:e.target.value})} placeholder="https://github.com/..." /></Field>
          </div>
          <Field label="Tech Stack (comma separated)">
            <input style={inputStyle} value={editing.tech_stack.join(", ")} onChange={e => setEditing({...editing,tech_stack:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)})} placeholder="React, Next.js, Supabase, TypeScript" />
          </Field>
          <Field label="Cover Image">
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <input style={{...inputStyle,flex:1}} value={editing.image_url} onChange={e => setEditing({...editing,image_url:e.target.value})} placeholder="Paste URL or upload →" />
              <UploadBtn label="Upload Image" accept="image/*" bucket="portfolio-images" onUploaded={url => setEditing({...editing,image_url:url})} />
            </div>
            {editing.image_url && <img src={editing.image_url} alt="" style={{ width:120, height:80, objectFit:"cover", borderRadius:8, marginTop:8, border:"1px solid "+T.border }} />}
          </Field>
          <div style={{ display:"flex", gap:20 }}>
            <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:14, color:T.textSub }}>
              <input type="checkbox" checked={editing.featured} onChange={e => setEditing({...editing,featured:e.target.checked})} />
              Featured project
            </label>
            <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:14, color:T.textSub }}>
              <input type="checkbox" checked={editing.visible} onChange={e => setEditing({...editing,visible:e.target.checked})} />
              Visible on portfolio
            </label>
          </div>
          <div style={{ display:"flex", gap:10, paddingTop:8 }}>
            <button onClick={save} disabled={saving || !editing.title.trim()} style={{ flex:1, padding:"13px", borderRadius:R.md, border:"none", background:T.accent, color:T.accentLabel, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>
              {saving ? "Saving..." : "Save Project"}
            </button>
            <button onClick={() => { setEditing(null); setIsNew(false); }} style={{ padding:"13px 20px", borderRadius:R.md, border:"1px solid "+T.border, background:"transparent", color:T.textSub, cursor:"pointer", fontSize:14 }}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:T.text, fontFamily:"'Bricolage Grotesque',sans-serif" }}>Projects</h2>
        <button onClick={() => { setEditing({id:"",  ...blank}); setIsNew(true); }}
          style={{ padding:"10px 18px", borderRadius:R.full, border:"none", background:T.accent, color:T.accentLabel, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
          + Add Project
        </button>
      </div>

      {items.length === 0 && (
        <div style={{ ...glass(), padding:40, textAlign:"center" }}>
          <p style={{ color:T.textMuted, fontSize:14 }}>No projects yet. Add your first one above.</p>
        </div>
      )}

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {items.map(p => (
          <div key={p.id} style={{ ...glass(), padding:"18px 22px", display:"flex", alignItems:"center", gap:16 }}>
            {p.image_url && <img src={p.image_url} alt="" style={{ width:56, height:40, objectFit:"cover", borderRadius:8, flexShrink:0, border:"1px solid "+T.border }} />}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                <span style={{ fontSize:15, fontWeight:700, color:T.text }}>{p.title}</span>
                <span style={{ fontSize:10, padding:"2px 8px", borderRadius:R.full, background:T.accentDim, color:T.accent }}>{p.category}</span>
                {p.featured && <span style={{ fontSize:10, padding:"2px 8px", borderRadius:R.full, background:"rgba(251,191,36,0.15)", color:"#FCD34D" }}>★ Featured</span>}
                {!p.visible && <span style={{ fontSize:10, padding:"2px 8px", borderRadius:R.full, background:"rgba(255,255,255,0.05)", color:T.textMuted }}>Hidden</span>}
              </div>
              <p style={{ fontSize:12, color:T.textMuted, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.tagline || p.description}</p>
            </div>
            <div style={{ display:"flex", gap:8, flexShrink:0 }}>
              <button onClick={() => toggleVisible(p)} style={{ padding:"7px 12px", borderRadius:R.sm, border:"1px solid "+T.border, background:"transparent", color:p.visible?T.success:T.textMuted, cursor:"pointer", fontSize:11, fontWeight:600 }}>{p.visible?"Visible":"Hidden"}</button>
              <button onClick={() => setEditing(p)} style={{ padding:"7px 12px", borderRadius:R.sm, border:"1px solid "+T.border, background:"transparent", color:T.textSub, cursor:"pointer", fontSize:11 }}>Edit</button>
              <button onClick={() => setConfirm(p.id)} style={{ padding:"7px 12px", borderRadius:R.sm, border:"1px solid rgba(239,68,68,0.20)", background:"transparent", color:T.error, cursor:"pointer", fontSize:11 }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      {confirm && <ConfirmDialog msg="Delete this project? This can't be undone." onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SECTION: RECOGNITION (awards, certs, volunteering, personal)
// ═════════════════════════════════════════════════════════════
function RecognitionSection({ supabase, toast }: { supabase:ReturnType<typeof createClient>; toast:(m:string,t:"success"|"error")=>void }) {
  const [items,   setItems]   = useState<Award[]>([]);
  const [editing, setEditing] = useState<Award|null>(null);
  const [isNew,   setIsNew]   = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [confirm, setConfirm] = useState<string|null>(null);
  const [tab,     setTab]     = useState("academic");

  const cats = ["academic","certifications","volunteering","personal"];
  const blank: Omit<Award,"id"> = { title:"", issuer:"", year:"", gpa:"", category:tab, pdf_url:"", visible:true, sort_order:0 };

  const load = useCallback(async () => {
    const { data } = await supabase.from("awards").select("*").order("sort_order");
    setItems(data ?? []);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const { id, ...rest } = editing;
    const op = isNew ? supabase.from("awards").insert(rest) : supabase.from("awards").update(rest).eq("id", id);
    const { error } = await op;
    setSaving(false);
    if (error) { toast("Save failed: " + error.message, "error"); return; }
    toast(isNew ? "Award added!" : "Award saved!", "success");
    setEditing(null); setIsNew(false); load();
  };

  const del = async (id:string) => {
    await supabase.from("awards").delete().eq("id", id);
    toast("Deleted.", "success"); setConfirm(null); load();
  };

  const filtered = items.filter(i => i.category === tab);

  if (editing) {
    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
          <button onClick={() => { setEditing(null); setIsNew(false); }} style={{ background:"none", border:"none", color:T.textSub, cursor:"pointer", fontSize:22 }}>←</button>
          <h2 style={{ fontSize:20, fontWeight:800, color:T.text, fontFamily:"'Bricolage Grotesque',sans-serif" }}>{isNew ? "Add Award / Certificate" : "Edit Award"}</h2>
        </div>
        <div style={{ ...glass(), padding:28, display:"flex", flexDirection:"column", gap:18 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Title"><input style={inputStyle} value={editing.title} onChange={e => setEditing({...editing,title:e.target.value})} placeholder="Meta Front-End Developer" /></Field>
            <Field label="Category">
              <select style={inputStyle} value={editing.category} onChange={e => setEditing({...editing,category:e.target.value})}>
                {cats.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </Field>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Issuer / Organisation"><input style={inputStyle} value={editing.issuer} onChange={e => setEditing({...editing,issuer:e.target.value})} placeholder="Meta / Coursera" /></Field>
            <Field label="Year"><input style={inputStyle} value={editing.year} onChange={e => setEditing({...editing,year:e.target.value})} placeholder="2024" /></Field>
          </div>
          {editing.category === "academic" && (
            <Field label="GPA (optional)"><input style={inputStyle} value={editing.gpa} onChange={e => setEditing({...editing,gpa:e.target.value})} placeholder="3.88" /></Field>
          )}
          <Field label="Certificate PDF">
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <input style={{...inputStyle,flex:1}} value={editing.pdf_url} onChange={e => setEditing({...editing,pdf_url:e.target.value})} placeholder="Paste URL or upload PDF →" />
              <UploadBtn label="Upload PDF" accept=".pdf,application/pdf" bucket="portfolio-pdfs" onUploaded={url => setEditing({...editing,pdf_url:url})} />
            </div>
            {editing.pdf_url && <a href={editing.pdf_url} target="_blank" rel="noopener noreferrer" style={{ fontSize:12, color:T.accent, marginTop:4, display:"block" }}>Preview PDF ↗</a>}
          </Field>
          <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:14, color:T.textSub }}>
            <input type="checkbox" checked={editing.visible} onChange={e => setEditing({...editing,visible:e.target.checked})} />
            Visible on portfolio
          </label>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={save} disabled={saving || !editing.title.trim()} style={{ flex:1, padding:"13px", borderRadius:R.md, border:"none", background:T.accent, color:T.accentLabel, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>{saving ? "Saving..." : "Save"}</button>
            <button onClick={() => { setEditing(null); setIsNew(false); }} style={{ padding:"13px 20px", borderRadius:R.md, border:"1px solid "+T.border, background:"transparent", color:T.textSub, cursor:"pointer", fontSize:14 }}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:T.text, fontFamily:"'Bricolage Grotesque',sans-serif" }}>Recognition</h2>
        <button onClick={() => { setEditing({id:"", ...blank, category:tab}); setIsNew(true); }}
          style={{ padding:"10px 18px", borderRadius:R.full, border:"none", background:T.accent, color:T.accentLabel, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>+ Add</button>
      </div>
      <div style={{ display:"flex", gap:6, marginBottom:20 }}>
        {cats.map(c => (
          <button key={c} onClick={() => setTab(c)} style={{
            padding:"7px 16px", borderRadius:R.full, border:"none", cursor:"pointer", fontSize:12, fontWeight:600,
            background: tab===c ? T.accent : "rgba(255,255,255,0.05)",
            color: tab===c ? T.accentLabel : T.textSub,
            fontFamily:"inherit", transition:"all 0.18s",
          }}>{c.charAt(0).toUpperCase()+c.slice(1)}</button>
        ))}
      </div>
      {filtered.length === 0 && <div style={{ ...glass(), padding:32, textAlign:"center" }}><p style={{ color:T.textMuted, fontSize:14 }}>No items in this category yet.</p></div>}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {filtered.map(a => (
          <div key={a.id} style={{ ...glass(), padding:"16px 20px", display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:3 }}>
                <span style={{ fontSize:14, fontWeight:700, color:T.text }}>{a.title}</span>
                {!a.visible && <span style={{ fontSize:10, padding:"2px 8px", borderRadius:R.full, background:"rgba(255,255,255,0.05)", color:T.textMuted }}>Hidden</span>}
              </div>
              <span style={{ fontSize:12, color:T.textMuted }}>{a.issuer}</span>
              {a.gpa && <span style={{ fontSize:12, color:T.accent, marginLeft:10 }}>GPA: {a.gpa}</span>}
            </div>
            <span style={{ fontSize:12, color:T.textMuted, flexShrink:0 }}>{a.year}</span>
            {a.pdf_url && <a href={a.pdf_url} target="_blank" rel="noopener noreferrer" style={{ fontSize:11, color:T.accent, textDecoration:"none", flexShrink:0 }}>PDF ↗</a>}
            <div style={{ display:"flex", gap:8, flexShrink:0 }}>
              <button onClick={() => setEditing(a)} style={{ padding:"6px 11px", borderRadius:R.sm, border:"1px solid "+T.border, background:"transparent", color:T.textSub, cursor:"pointer", fontSize:11 }}>Edit</button>
              <button onClick={() => setConfirm(a.id)} style={{ padding:"6px 11px", borderRadius:R.sm, border:"1px solid rgba(239,68,68,0.20)", background:"transparent", color:T.error, cursor:"pointer", fontSize:11 }}>Del</button>
            </div>
          </div>
        ))}
      </div>
      {confirm && <ConfirmDialog msg="Delete this award?" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SECTION: WRITING
// ═════════════════════════════════════════════════════════════
function WritingSection({ supabase, toast }: { supabase:ReturnType<typeof createClient>; toast:(m:string,t:"success"|"error")=>void }) {
  const [items,   setItems]   = useState<Article[]>([]);
  const [editing, setEditing] = useState<Article|null>(null);
  const [isNew,   setIsNew]   = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [confirm, setConfirm] = useState<string|null>(null);

  const blank: Omit<Article,"id"> = { title:"", publication:"", article_url:"", published_at:"", excerpt:"", cover_url:"", visible:true, sort_order:0 };

  const load = useCallback(async () => {
    const { data } = await supabase.from("writing").select("*").order("sort_order");
    setItems(data ?? []);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const { id, ...rest } = editing;
    const op = isNew ? supabase.from("writing").insert(rest) : supabase.from("writing").update(rest).eq("id", id);
    const { error } = await op;
    setSaving(false);
    if (error) { toast("Failed: " + error.message, "error"); return; }
    toast(isNew ? "Article added!" : "Article saved!", "success");
    setEditing(null); setIsNew(false); load();
  };

  const del = async (id:string) => {
    await supabase.from("writing").delete().eq("id", id);
    toast("Deleted.", "success"); setConfirm(null); load();
  };

  if (editing) {
    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
          <button onClick={() => { setEditing(null); setIsNew(false); }} style={{ background:"none", border:"none", color:T.textSub, cursor:"pointer", fontSize:22 }}>←</button>
          <h2 style={{ fontSize:20, fontWeight:800, color:T.text, fontFamily:"'Bricolage Grotesque',sans-serif" }}>{isNew ? "Add Article" : "Edit Article"}</h2>
        </div>
        <div style={{ ...glass(), padding:28, display:"flex", flexDirection:"column", gap:18 }}>
          <Field label="Article Title"><input style={inputStyle} value={editing.title} onChange={e => setEditing({...editing,title:e.target.value})} placeholder="How I Built a Real-Time Study App" /></Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Publication"><input style={inputStyle} value={editing.publication} onChange={e => setEditing({...editing,publication:e.target.value})} placeholder="Medium, Dev.to, Hashnode..." /></Field>
            <Field label="Published Date"><input type="date" style={inputStyle} value={editing.published_at} onChange={e => setEditing({...editing,published_at:e.target.value})} /></Field>
          </div>
          <Field label="Article URL"><input style={inputStyle} value={editing.article_url} onChange={e => setEditing({...editing,article_url:e.target.value})} placeholder="https://medium.com/..." /></Field>
          <Field label="Short Excerpt"><textarea style={{...inputStyle,minHeight:80,resize:"vertical"}} value={editing.excerpt} onChange={e => setEditing({...editing,excerpt:e.target.value})} placeholder="A brief summary shown on your portfolio..." /></Field>
          <Field label="Cover Image">
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <input style={{...inputStyle,flex:1}} value={editing.cover_url} onChange={e => setEditing({...editing,cover_url:e.target.value})} placeholder="Paste URL or upload →" />
              <UploadBtn label="Upload" accept="image/*" bucket="portfolio-images" onUploaded={url => setEditing({...editing,cover_url:url})} />
            </div>
          </Field>
          <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:14, color:T.textSub }}>
            <input type="checkbox" checked={editing.visible} onChange={e => setEditing({...editing,visible:e.target.checked})} />
            Visible on portfolio
          </label>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={save} disabled={saving || !editing.title.trim()} style={{ flex:1, padding:"13px", borderRadius:R.md, border:"none", background:T.accent, color:T.accentLabel, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>{saving ? "Saving..." : "Save Article"}</button>
            <button onClick={() => { setEditing(null); setIsNew(false); }} style={{ padding:"13px 20px", borderRadius:R.md, border:"1px solid "+T.border, background:"transparent", color:T.textSub, cursor:"pointer", fontSize:14 }}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:T.text, fontFamily:"'Bricolage Grotesque',sans-serif" }}>Writing</h2>
        <button onClick={() => { setEditing({id:"", ...blank}); setIsNew(true); }}
          style={{ padding:"10px 18px", borderRadius:R.full, border:"none", background:T.accent, color:T.accentLabel, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>+ Add Article</button>
      </div>
      {items.length === 0 && <div style={{ ...glass(), padding:40, textAlign:"center" }}><p style={{ color:T.textMuted, fontSize:14 }}>No articles yet. Add your first published piece above.</p></div>}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {items.map(a => (
          <div key={a.id} style={{ ...glass(), padding:"16px 20px", display:"flex", alignItems:"center", gap:14 }}>
            {a.cover_url && <img src={a.cover_url} alt="" style={{ width:52, height:40, objectFit:"cover", borderRadius:8, flexShrink:0, border:"1px solid "+T.border }} />}
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:3, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{a.title}</div>
              <span style={{ fontSize:12, color:T.textMuted }}>{a.publication}</span>
              {a.published_at && <span style={{ fontSize:12, color:T.textMuted, marginLeft:8 }}>· {a.published_at}</span>}
            </div>
            {!a.visible && <span style={{ fontSize:10, padding:"2px 8px", borderRadius:R.full, background:"rgba(255,255,255,0.05)", color:T.textMuted, flexShrink:0 }}>Hidden</span>}
            <div style={{ display:"flex", gap:8, flexShrink:0 }}>
              <button onClick={() => setEditing(a)} style={{ padding:"6px 11px", borderRadius:R.sm, border:"1px solid "+T.border, background:"transparent", color:T.textSub, cursor:"pointer", fontSize:11 }}>Edit</button>
              <button onClick={() => setConfirm(a.id)} style={{ padding:"6px 11px", borderRadius:R.sm, border:"1px solid rgba(239,68,68,0.20)", background:"transparent", color:T.error, cursor:"pointer", fontSize:11 }}>Del</button>
            </div>
          </div>
        ))}
      </div>
      {confirm && <ConfirmDialog msg="Delete this article?" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SECTION: EXPERIENCE
// ═════════════════════════════════════════════════════════════
function ExperienceSection({ supabase, toast }: { supabase:ReturnType<typeof createClient>; toast:(m:string,t:"success"|"error")=>void }) {
  const [items,   setItems]   = useState<Experience[]>([]);
  const [editing, setEditing] = useState<Experience|null>(null);
  const [isNew,   setIsNew]   = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [confirm, setConfirm] = useState<string|null>(null);

  const blank: Omit<Experience,"id"> = { role:"", org:"", period:"", description:"", type:"work", visible:true, sort_order:0 };

  const load = useCallback(async () => {
    const { data } = await supabase.from("experience").select("*").order("sort_order");
    setItems(data ?? []);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const { id, ...rest } = editing;
    const op = isNew ? supabase.from("experience").insert(rest) : supabase.from("experience").update(rest).eq("id", id);
    const { error } = await op;
    setSaving(false);
    if (error) { toast("Failed: " + error.message, "error"); return; }
    toast("Saved!", "success");
    setEditing(null); setIsNew(false); load();
  };

  const del = async (id:string) => {
    await supabase.from("experience").delete().eq("id", id);
    toast("Deleted.", "success"); setConfirm(null); load();
  };

  if (editing) {
    return (
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
          <button onClick={() => { setEditing(null); setIsNew(false); }} style={{ background:"none", border:"none", color:T.textSub, cursor:"pointer", fontSize:22 }}>←</button>
          <h2 style={{ fontSize:20, fontWeight:800, color:T.text, fontFamily:"'Bricolage Grotesque',sans-serif" }}>{isNew ? "Add Entry" : "Edit Entry"}</h2>
        </div>
        <div style={{ ...glass(), padding:28, display:"flex", flexDirection:"column", gap:18 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Role / Degree"><input style={inputStyle} value={editing.role} onChange={e => setEditing({...editing,role:e.target.value})} placeholder="Frontend Developer" /></Field>
            <Field label="Type">
              <select style={inputStyle} value={editing.type} onChange={e => setEditing({...editing,type:e.target.value})}>
                <option value="work">Work</option>
                <option value="education">Education</option>
              </select>
            </Field>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
            <Field label="Organisation / University"><input style={inputStyle} value={editing.org} onChange={e => setEditing({...editing,org:e.target.value})} placeholder="Company or University name" /></Field>
            <Field label="Period"><input style={inputStyle} value={editing.period} onChange={e => setEditing({...editing,period:e.target.value})} placeholder="Jan 2024 – Present" /></Field>
          </div>
          <Field label="Description"><textarea style={{...inputStyle,minHeight:90,resize:"vertical"}} value={editing.description} onChange={e => setEditing({...editing,description:e.target.value})} placeholder="Key responsibilities, achievements, what you learned..." /></Field>
          <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", fontSize:14, color:T.textSub }}>
            <input type="checkbox" checked={editing.visible} onChange={e => setEditing({...editing,visible:e.target.checked})} />
            Visible on portfolio
          </label>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={save} disabled={saving || !editing.role.trim()} style={{ flex:1, padding:"13px", borderRadius:R.md, border:"none", background:T.accent, color:T.accentLabel, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit" }}>{saving ? "Saving..." : "Save"}</button>
            <button onClick={() => { setEditing(null); setIsNew(false); }} style={{ padding:"13px 20px", borderRadius:R.md, border:"1px solid "+T.border, background:"transparent", color:T.textSub, cursor:"pointer", fontSize:14 }}>Cancel</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:T.text, fontFamily:"'Bricolage Grotesque',sans-serif" }}>Experience</h2>
        <button onClick={() => { setEditing({id:"", ...blank}); setIsNew(true); }}
          style={{ padding:"10px 18px", borderRadius:R.full, border:"none", background:T.accent, color:T.accentLabel, fontWeight:700, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>+ Add Entry</button>
      </div>
      {items.length === 0 && <div style={{ ...glass(), padding:40, textAlign:"center" }}><p style={{ color:T.textMuted, fontSize:14 }}>No entries yet. Add work experience or education above.</p></div>}
      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
        {items.map(e => (
          <div key={e.id} style={{ ...glass(), padding:"16px 20px", display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background: e.type==="work" ? T.accent : "#60A5FA", flexShrink:0 }} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:14, fontWeight:700, color:T.text, marginBottom:2 }}>{e.role}</div>
              <div style={{ fontSize:12, color:T.textMuted }}>{e.org} · {e.period}</div>
            </div>
            <span style={{ fontSize:11, padding:"2px 8px", borderRadius:R.full, background:"rgba(255,255,255,0.05)", color:T.textSub, flexShrink:0 }}>{e.type}</span>
            {!e.visible && <span style={{ fontSize:10, padding:"2px 8px", borderRadius:R.full, background:"rgba(255,255,255,0.05)", color:T.textMuted }}>Hidden</span>}
            <div style={{ display:"flex", gap:8, flexShrink:0 }}>
              <button onClick={() => setEditing(e)} style={{ padding:"6px 11px", borderRadius:R.sm, border:"1px solid "+T.border, background:"transparent", color:T.textSub, cursor:"pointer", fontSize:11 }}>Edit</button>
              <button onClick={() => setConfirm(e.id)} style={{ padding:"6px 11px", borderRadius:R.sm, border:"1px solid rgba(239,68,68,0.20)", background:"transparent", color:T.error, cursor:"pointer", fontSize:11 }}>Del</button>
            </div>
          </div>
        ))}
      </div>
      {confirm && <ConfirmDialog msg="Delete this entry?" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SECTION: PHOTOS (about section stack, max 4)
// ═════════════════════════════════════════════════════════════
function PhotosSection({ supabase, toast }: { supabase:ReturnType<typeof createClient>; toast:(m:string,t:"success"|"error")=>void }) {
  const [photos,  setPhotos]  = useState<Photo[]>([]);
  const [caption, setCaption] = useState("");
  const [confirm, setConfirm] = useState<string|null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("photos").select("*").order("sort_order");
    setPhotos(data ?? []);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const handleUpload = async (url: string) => {
    if (photos.length >= 4) { toast("Max 4 photos allowed.", "error"); return; }
    await supabase.from("photos").insert({ url, caption, sort_order: photos.length });
    setCaption("");
    toast("Photo added!", "success"); load();
  };

  const del = async (id:string) => {
    await supabase.from("photos").delete().eq("id", id);
    toast("Photo removed.", "success"); setConfirm(null); load();
  };

  return (
    <div>
      <h2 style={{ fontSize:22, fontWeight:800, color:T.text, marginBottom:8, fontFamily:"'Bricolage Grotesque',sans-serif" }}>About Photos</h2>
      <p style={{ color:T.textMuted, fontSize:13, marginBottom:24 }}>Up to 4 photos shown as a stacked fan on your home page About section. Upload personality shots, campus life, workspace - anything that shows who you are.</p>

      {photos.length < 4 && (
        <div style={{ ...glass(), padding:24, marginBottom:20 }}>
          <Field label="Caption (optional)">
            <input style={{...inputStyle, marginBottom:12}} value={caption} onChange={e => setCaption(e.target.value)} placeholder="At SEGi hackathon 2024" />
          </Field>
          <UploadBtn label="📷 Upload Photo" accept="image/*" bucket="portfolio-images" onUploaded={handleUpload} />
          <p style={{ fontSize:11, color:T.textMuted, marginTop:8 }}>{4 - photos.length} slot{4 - photos.length !== 1 ? "s" : ""} remaining</p>
        </div>
      )}
      {photos.length >= 4 && (
        <div style={{ ...glass(), padding:16, marginBottom:20, border:"1px solid "+T.borderStrong }}>
          <p style={{ fontSize:13, color:T.accent, margin:0 }}>Maximum 4 photos reached. Delete one to upload a new photo.</p>
        </div>
      )}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:14 }}>
        {photos.map((p, i) => (
          <div key={p.id} style={{ position:"relative" }}>
            <img src={p.url} alt={p.caption||""} style={{ width:"100%", aspectRatio:"1", objectFit:"cover", borderRadius:R.lg, border:"1px solid "+T.border, display:"block" }} />
            <div style={{ position:"absolute", top:8, left:8, background:"rgba(0,0,0,0.60)", borderRadius:R.sm, padding:"2px 8px", fontSize:11, color:"#fff" }}>
              #{i + 1}
            </div>
            {p.caption && <p style={{ fontSize:11, color:T.textMuted, marginTop:6, textAlign:"center" }}>{p.caption}</p>}
            <button onClick={() => setConfirm(p.id)} style={{ position:"absolute", top:8, right:8, width:28, height:28, borderRadius:"50%", border:"none", background:"rgba(239,68,68,0.80)", color:"#fff", cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
          </div>
        ))}
      </div>
      {confirm && <ConfirmDialog msg="Remove this photo?" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SECTION: MESSAGES
// ═════════════════════════════════════════════════════════════
function MessagesSection({ supabase, toast }: { supabase:ReturnType<typeof createClient>; toast:(m:string,t:"success"|"error")=>void }) {
  const [msgs,    setMsgs]    = useState<Message[]>([]);
  const [open,    setOpen]    = useState<Message|null>(null);
  const [confirm, setConfirm] = useState<string|null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("messages").select("*").order("created_at", { ascending:false });
    setMsgs(data ?? []);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (id:string) => {
    await supabase.from("messages").update({ read:true }).eq("id", id);
    load();
  };

  const del = async (id:string) => {
    await supabase.from("messages").delete().eq("id", id);
    toast("Message deleted.", "success"); setConfirm(null); setOpen(null); load();
  };

  const unread = msgs.filter(m => !m.read).length;

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:24 }}>
        <h2 style={{ fontSize:22, fontWeight:800, color:T.text, fontFamily:"'Bricolage Grotesque',sans-serif" }}>Messages</h2>
        {unread > 0 && <span style={{ fontSize:12, fontWeight:700, padding:"3px 10px", borderRadius:R.full, background:T.accentDim, color:T.accent }}>{unread} unread</span>}
      </div>

      {open && (
        <div style={{ ...glass(true), padding:28, marginBottom:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
            <div>
              <h3 style={{ fontSize:17, fontWeight:700, color:T.text, margin:"0 0 4px" }}>{open.subject || "(no subject)"}</h3>
              <p style={{ fontSize:13, color:T.textMuted, margin:0 }}>
                From: <strong style={{ color:T.textSub }}>{open.name}</strong> · <a href={"mailto:"+open.email} style={{ color:T.accent }}>{open.email}</a>
              </p>
              <p style={{ fontSize:11, color:T.textMuted, marginTop:4 }}>{new Date(open.created_at).toLocaleString()}</p>
            </div>
            <button onClick={() => setOpen(null)} style={{ background:"none", border:"none", color:T.textMuted, cursor:"pointer", fontSize:22 }}>×</button>
          </div>
          <p style={{ fontSize:14, color:T.text, lineHeight:1.8, whiteSpace:"pre-wrap", padding:"16px 20px", background:"rgba(255,255,255,0.03)", borderRadius:R.md, border:"1px solid "+T.border }}>{open.message}</p>
          <div style={{ display:"flex", gap:10, marginTop:16 }}>
            <a href={"mailto:"+open.email+"?subject=Re: "+encodeURIComponent(open.subject||"")}
              style={{ padding:"10px 18px", borderRadius:R.md, background:T.accent, color:T.accentLabel, fontWeight:700, fontSize:13, textDecoration:"none", display:"inline-block" }}>
              Reply via Email →
            </a>
            <button onClick={() => setConfirm(open.id)} style={{ padding:"10px 18px", borderRadius:R.md, border:"1px solid rgba(239,68,68,0.25)", background:"transparent", color:T.error, cursor:"pointer", fontSize:13 }}>Delete</button>
          </div>
        </div>
      )}

      {msgs.length === 0 && <div style={{ ...glass(), padding:40, textAlign:"center" }}><p style={{ color:T.textMuted, fontSize:14 }}>No messages yet. Your contact form will send messages here.</p></div>}

      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {msgs.map(m => (
          <div key={m.id} onClick={() => { setOpen(m); if(!m.read) markRead(m.id); }}
            style={{ ...glass(), padding:"14px 20px", cursor:"pointer", display:"flex", alignItems:"center", gap:14, borderLeft: !m.read ? "3px solid "+T.accent : "3px solid transparent", transition:"border-color 0.2s" }}>
            <div style={{ width:8, height:8, borderRadius:"50%", background:m.read?"transparent":T.accent, border: m.read?"1px solid "+T.border:"none", flexShrink:0 }} />
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ display:"flex", gap:8, marginBottom:3, alignItems:"center" }}>
                <span style={{ fontSize:14, fontWeight: m.read?500:700, color:T.text }}>{m.name}</span>
                <span style={{ fontSize:12, color:T.textMuted, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.subject || "(no subject)"}</span>
              </div>
              <p style={{ fontSize:12, color:T.textMuted, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{m.message}</p>
            </div>
            <span style={{ fontSize:11, color:T.textMuted, flexShrink:0 }}>{new Date(m.created_at).toLocaleDateString()}</span>
          </div>
        ))}
      </div>
      {confirm && <ConfirmDialog msg="Delete this message permanently?" onConfirm={() => del(confirm)} onCancel={() => setConfirm(null)} />}
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// SECTION: SETTINGS
// ═════════════════════════════════════════════════════════════
function SettingsSection({ supabase, toast }: { supabase:ReturnType<typeof createClient>; toast:(m:string,t:"success"|"error")=>void }) {
  const [settings, setSettings] = useState<Record<string,string>>({});
  const [saving,   setSaving]   = useState(false);
  const [newEmail,    setNewEmail]    = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [authSaving,  setAuthSaving]  = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("site_settings").select("*");
    if (data) setSettings(Object.fromEntries(data.map((r:Setting) => [r.key, r.value])));
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  const set = (key:string, value:string) => setSettings(s => ({...s, [key]:value}));

  const saveSettings = async () => {
    setSaving(true);
    const rows = Object.entries(settings).map(([key,value]) => ({ key, value, updated_at: new Date().toISOString() }));
    const { error } = await supabase.from("site_settings").upsert(rows, { onConflict:"key" });
    setSaving(false);
    if (error) { toast("Save failed: " + error.message, "error"); return; }
    toast("Settings saved! Refresh your portfolio to see changes.", "success");
  };

  const saveAuth = async () => {
    setAuthSaving(true);
    const updates: Record<string,string> = {};
    if (newEmail.trim())    updates.email    = newEmail.trim();
    if (newPassword.trim()) updates.password = newPassword.trim();
    if (Object.keys(updates).length === 0) { setAuthSaving(false); return; }
    const { error } = await supabase.auth.updateUser(updates);
    setAuthSaving(false);
    if (error) { toast("Auth update failed: " + error.message, "error"); return; }
    toast("Login credentials updated!", "success");
    setNewEmail(""); setNewPassword("");
  };

  const toggles = [
    { key:"section_skills_visible",      label:"Skills section" },
    { key:"section_projects_visible",    label:"Projects section" },
    { key:"section_recognition_visible", label:"Recognition section" },
    { key:"section_experience_visible",  label:"Experience section" },
    { key:"section_writing_visible",     label:"Writing section" },
    { key:"section_photos_visible",      label:"Photo stack (About)" },
    { key:"available_for_internship",    label:"Available for internship badge" },
  ];

  const SectionTitle = ({ children }: { children:React.ReactNode }) => (
    <h3 style={{ fontSize:14, fontWeight:700, color:T.textSub, letterSpacing:"0.08em", margin:"28px 0 14px", textTransform:"uppercase" as const }}>{children}</h3>
  );

  return (
    <div>
      <h2 style={{ fontSize:22, fontWeight:800, color:T.text, marginBottom:24, fontFamily:"'Bricolage Grotesque',sans-serif" }}>Settings</h2>

      <div style={{ ...glass(), padding:28, display:"flex", flexDirection:"column", gap:18 }}>

        <SectionTitle>Personal Info</SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Field label="Your Name"><input style={inputStyle} value={settings.owner_name||""} onChange={e => set("owner_name",e.target.value)} /></Field>
          <Field label="Role Title"><input style={inputStyle} value={settings.owner_role||""} onChange={e => set("owner_role",e.target.value)} /></Field>
          <Field label="University"><input style={inputStyle} value={settings.owner_uni||""} onChange={e => set("owner_uni",e.target.value)} /></Field>
          <Field label="Year / Programme"><input style={inputStyle} value={settings.owner_year||""} onChange={e => set("owner_year",e.target.value)} /></Field>
          <Field label="CGPA"><input style={inputStyle} value={settings.owner_cgpa||""} onChange={e => set("owner_cgpa",e.target.value)} /></Field>
          <Field label="Dean's List Count"><input style={inputStyle} value={settings.owner_dean_list||""} onChange={e => set("owner_dean_list",e.target.value)} /></Field>
        </div>
        <Field label="Bio (shown in About)"><textarea style={{...inputStyle,minHeight:90,resize:"vertical"}} value={settings.owner_bio||""} onChange={e => set("owner_bio",e.target.value)} /></Field>
        <Field label="Available Badge Text"><input style={inputStyle} value={settings.available_text||""} onChange={e => set("available_text",e.target.value)} /></Field>
        <Field label="Mino Greeting Message"><textarea style={{...inputStyle,minHeight:70,resize:"vertical"}} value={settings.mino_greeting||""} onChange={e => set("mino_greeting",e.target.value)} /></Field>

        <SectionTitle>Social Links</SectionTitle>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
          <Field label="Email"><input style={inputStyle} type="email" value={settings.social_email||""} onChange={e => set("social_email",e.target.value)} placeholder="you@email.com" /></Field>
          <Field label="GitHub URL"><input style={inputStyle} value={settings.social_github||""} onChange={e => set("social_github",e.target.value)} placeholder="github.com/username" /></Field>
          <Field label="LinkedIn URL"><input style={inputStyle} value={settings.social_linkedin||""} onChange={e => set("social_linkedin",e.target.value)} placeholder="linkedin.com/in/username" /></Field>
          <Field label="Twitter / X (optional)"><input style={inputStyle} value={settings.social_twitter||""} onChange={e => set("social_twitter",e.target.value)} placeholder="twitter.com/username" /></Field>
        </div>

        <SectionTitle>Section Visibility</SectionTitle>
        <p style={{ fontSize:12, color:T.textMuted, marginTop:-10 }}>Toggle which sections appear on your portfolio. Hidden sections can be turned on anytime.</p>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {toggles.map(t => (
            <label key={t.key} style={{ display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", padding:"12px 16px", borderRadius:R.md, background:"rgba(255,255,255,0.03)", border:"1px solid "+T.border }}>
              <span style={{ fontSize:14, color:T.textSub }}>{t.label}</span>
              <div style={{ position:"relative", width:44, height:24 }}>
                <input type="checkbox" checked={settings[t.key]==="true"} onChange={e => set(t.key, e.target.checked?"true":"false")} style={{ opacity:0, width:0, height:0 }} />
                <div style={{
                  position:"absolute", inset:0, borderRadius:R.full,
                  background: settings[t.key]==="true" ? T.accent : "rgba(255,255,255,0.10)",
                  transition:"background 0.2s",
                  cursor:"pointer",
                  display:"flex", alignItems:"center",
                  padding:"0 3px",
                  justifyContent: settings[t.key]==="true" ? "flex-end" : "flex-start",
                }}>
                  <div style={{ width:18, height:18, borderRadius:"50%", background:"#fff", boxShadow:"0 1px 4px rgba(0,0,0,0.3)" }} />
                </div>
              </div>
            </label>
          ))}
        </div>

        <button onClick={saveSettings} disabled={saving}
          style={{ marginTop:8, padding:"14px", borderRadius:R.md, border:"none", background:T.accent, color:T.accentLabel, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit", transition:"opacity 0.2s", opacity:saving?0.7:1 }}>
          {saving ? "Saving..." : "Save All Settings"}
        </button>
      </div>

      {/* Auth credentials - separate section */}
      <div style={{ ...glass(), padding:28, marginTop:20 }}>
        <h3 style={{ fontSize:16, fontWeight:700, color:T.text, marginBottom:6, fontFamily:"'Bricolage Grotesque',sans-serif" }}>Login Credentials</h3>
        <p style={{ fontSize:13, color:T.textMuted, marginBottom:20 }}>Change your admin email or password. Leave blank to keep current.</p>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <Field label="New Email Address"><input type="email" style={inputStyle} value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="Leave blank to keep current" /></Field>
          <Field label="New Password"><input type="password" style={inputStyle} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Leave blank to keep current" /></Field>
          <button onClick={saveAuth} disabled={authSaving || (!newEmail.trim() && !newPassword.trim())}
            style={{ padding:"12px", borderRadius:R.md, border:"1px solid "+T.borderStrong, background:T.accentDim, color:T.accent, fontWeight:700, fontSize:14, cursor:"pointer", fontFamily:"inherit", opacity:authSaving?0.7:1 }}>
            {authSaving ? "Updating..." : "Update Credentials"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════
// ROOT ADMIN COMPONENT
// ═════════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const router   = useRouter();
  const supabase = createClient();

  const [page,    setPage]    = useState("dashboard");
  const [toastMsg, setToastMsg] = useState<{msg:string;type:"success"|"error"}|null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const showToast = useCallback((msg:string, type:"success"|"error") => setToastMsg({msg,type}), []);

  const signOut = async () => {
    setSigningOut(true);
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const activeNav = NAV.find(n => n.id === page);

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      display: "flex",
      color: T.text,
      fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        select option { background: #211C19; color: #F5F0EA; }
        input[type=checkbox] { accent-color: #D4B896; width:16px; height:16px; cursor:pointer; }
        input::placeholder, textarea::placeholder { color: #6B6158; }
        input:focus, textarea:focus, select:focus { border-color: rgba(212,184,150,0.50) !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-thumb { background: rgba(212,184,150,0.20); border-radius: 2px; }
      `}</style>

      {/* Background */}
      <div style={{ position:"fixed", inset:0, zIndex:0, background:"radial-gradient(ellipse 60% 50% at 50% 0%,rgba(212,184,150,0.05) 0%,transparent 60%)", pointerEvents:"none" }} />

      {/* Sidebar */}
      <aside style={{
        position:"fixed", left:20, top:20, bottom:20,
        width:220, zIndex:10, ...glass(true),
        display:"flex", flexDirection:"column", padding:"24px 14px",
      }}>
        {/* Logo */}
        <div style={{ paddingBottom:20, marginBottom:4, borderBottom:"1px solid "+T.border }}>
          <div style={{ fontSize:18, fontWeight:800, color:T.text, letterSpacing:"-0.02em", fontFamily:"'Bricolage Grotesque',sans-serif" }}>
            AMH<span style={{ color:T.accent }}>.</span>
          </div>
          <div style={{ fontSize:11, color:T.textMuted, marginTop:2 }}>Admin Dashboard</div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, display:"flex", flexDirection:"column", gap:2, marginTop:16 }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setPage(n.id)}
              style={{
                display:"flex", alignItems:"center", gap:10,
                padding:"9px 12px", borderRadius:R.md,
                border:"none", cursor:"pointer", textAlign:"left",
                background: page===n.id ? T.accentDim : "transparent",
                color: page===n.id ? T.accent : T.textSub,
                fontSize:13, fontWeight: page===n.id ? 600 : 400,
                fontFamily:"inherit", transition:"all 0.18s",
                borderLeft: page===n.id ? "2px solid "+T.accent : "2px solid transparent",
              }}>
              <span style={{ fontSize:14 }}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ paddingTop:16, borderTop:"1px solid "+T.border }}>
          <a href="/" target="_blank" rel="noopener noreferrer"
            style={{ display:"block", fontSize:12, color:T.textMuted, textDecoration:"none", marginBottom:10, padding:"8px 12px" }}>
            View Portfolio ↗
          </a>
          <button onClick={signOut} disabled={signingOut}
            style={{ width:"100%", padding:"9px 12px", borderRadius:R.md, border:"1px solid "+T.border, background:"transparent", color:T.textMuted, cursor:"pointer", fontSize:12, fontFamily:"inherit", textAlign:"left" as const }}>
            {signingOut ? "Signing out..." : "← Sign Out"}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft:260, flex:1, padding:"40px 40px 40px 0", position:"relative", zIndex:1, minHeight:"100vh" }}>
        <div style={{ maxWidth:820 }}>

          {/* Breadcrumb */}
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:32, fontSize:12, color:T.textMuted }}>
            <span>Admin</span>
            <span>›</span>
            <span style={{ color:T.textSub }}>{activeNav?.label}</span>
          </div>

          {/* Section content */}
          {page === "dashboard"   && <DashboardSection  supabase={supabase} setPage={setPage} />}
          {page === "projects"    && <ProjectsSection   supabase={supabase} toast={showToast} />}
          {page === "recognition" && <RecognitionSection supabase={supabase} toast={showToast} />}
          {page === "writing"     && <WritingSection    supabase={supabase} toast={showToast} />}
          {page === "experience"  && <ExperienceSection  supabase={supabase} toast={showToast} />}
          {page === "photos"      && <PhotosSection     supabase={supabase} toast={showToast} />}
          {page === "messages"    && <MessagesSection   supabase={supabase} toast={showToast} />}
          {page === "settings"    && <SettingsSection   supabase={supabase} toast={showToast} />}
        </div>
      </main>

      {/* Toast */}
      {toastMsg && <Toast msg={toastMsg.msg} type={toastMsg.type} onClose={() => setToastMsg(null)} />}
    </div>
  );
}