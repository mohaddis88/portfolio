"use client";
// components/ContactForm.tsx
// Wired to /api/contact. All 5 UI states handled.
// Usage in page.tsx: import { ContactForm } from "@/components/ContactForm"

import { useState } from "react";

interface Theme {
  accent: string; accentLabel: string; text: string;
  textSecondary: string; textMuted: string;
  glassBorder: string; glassRaised: string; cardBg: string;
  isDark: boolean; bg: string;
}

type FormState = { name: string; email: string; subject: string; message: string; };
type Status    = "idle" | "loading" | "success" | "error";
type FieldErr  = Partial<Record<keyof FormState, string>>;

const R = { full: 9999, lg: 16, md: 12, sm: 8 };

function validate(f: FormState): FieldErr {
  const e: FieldErr = {};
  if (!f.name.trim() || f.name.trim().length < 2)      e.name    = "Name must be at least 2 characters";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))     e.email   = "Please enter a valid email address";
  if (!f.subject.trim() || f.subject.trim().length < 3) e.subject = "Subject must be at least 3 characters";
  if (!f.message.trim() || f.message.trim().length < 10) e.message = "Message too short - tell me more!";
  return e;
}

export function ContactForm({ T }: { T: Theme }) {
  const [form,     setForm]     = useState<FormState>({ name:"", email:"", subject:"", message:"" });
  const [errors,   setErrors]   = useState<FieldErr>({});
  const [status,   setStatus]   = useState<Status>("idle");
  const [apiError, setApiError] = useState("");

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    setForm(prev => ({...prev, [field]: e.target.value}));
    if (errors[field]) setErrors(prev => ({...prev, [field]: undefined}));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const clientErrors = validate(form);
    if (Object.keys(clientErrors).length > 0) { setErrors(clientErrors); return; }
    setStatus("loading"); setApiError("");
    try {
      const res  = await fetch("/api/contact", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) {
        if (data.field) { setErrors({ [data.field]: data.error }); setStatus("idle"); return; }
        throw new Error(data.error || "Something went wrong.");
      }
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setApiError(err instanceof Error ? err.message : "Failed to send. Please try again.");
    }
  };

  const base: React.CSSProperties = {
    width:"100%", padding:"12px 16px", borderRadius:R.md, fontSize:14,
    fontFamily:"inherit", outline:"none", boxSizing:"border-box",
    background: T.isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
    color: T.text, transition:"border-color 0.2s, box-shadow 0.2s",
  };
  const normal: React.CSSProperties = { ...base, border:"1px solid "+T.glassBorder };
  const errStyle: React.CSSProperties = { ...base, border:"1px solid rgba(239,68,68,0.45)" };

  const onFocus = (e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = T.accent+"60";
    e.currentTarget.style.boxShadow   = "0 0 0 3px "+T.accent+"18";
  };
  const onBlur = (hasErr: boolean) => (e: React.FocusEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = hasErr ? "rgba(239,68,68,0.45)" : T.glassBorder;
    e.currentTarget.style.boxShadow   = "none";
  };

  const Err = ({ msg }: { msg?: string }) => msg
    ? <p style={{fontSize:12,color:"rgba(248,113,113,1)",marginTop:5,display:"flex",alignItems:"center",gap:4}}><span>⚠</span>{msg}</p>
    : null;

  const Label = ({ children }: { children: React.ReactNode }) =>
    <label style={{fontSize:11,fontWeight:600,color:T.textMuted,display:"block",marginBottom:6,letterSpacing:"0.06em"}}>{children}</label>;

  // State 5 - Success
  if (status === "success") {
    return (
      <div style={{textAlign:"center",padding:"40px 24px"}}>
        <div style={{width:64,height:64,borderRadius:"50%",background:T.isDark?"rgba(110,231,183,0.12)":"rgba(16,185,129,0.10)",border:"2px solid rgba(110,231,183,0.30)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 20px"}}>✓</div>
        <h3 style={{fontSize:20,fontWeight:800,color:T.text,marginBottom:10,fontFamily:"'Bricolage Grotesque',sans-serif"}}>Message sent!</h3>
        <p style={{fontSize:14,color:T.textSecondary,lineHeight:1.7,marginBottom:24}}>Thanks for reaching out. I'll reply within 24–48 hours.<br/>Check your inbox for a confirmation.</p>
        <button onClick={()=>{ setStatus("idle"); setForm({name:"",email:"",subject:"",message:""}); }}
          style={{fontSize:13,fontWeight:600,color:T.accent,background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate style={{display:"flex",flexDirection:"column",gap:16}}>

      {/* State 4 - API error banner */}
      {status==="error" && apiError && (
        <div style={{padding:"12px 16px",borderRadius:R.md,background:"rgba(239,68,68,0.10)",border:"1px solid rgba(239,68,68,0.25)",color:"rgba(248,113,113,1)",fontSize:13,display:"flex",alignItems:"center",gap:8}}>
          <span>⚠</span>{apiError}
          <button type="button" onClick={()=>{setStatus("idle");setApiError("");}} style={{background:"none",border:"none",color:"inherit",cursor:"pointer",marginLeft:"auto",fontSize:16}}>×</button>
        </div>
      )}

      {/* Name + Email */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div>
          <Label>NAME</Label>
          <input type="text" value={form.name} onChange={set("name")} placeholder="Your name" disabled={status==="loading"} style={errors.name?errStyle:normal} onFocus={onFocus} onBlur={onBlur(!!errors.name)} />
          <Err msg={errors.name}/>
        </div>
        <div>
          <Label>EMAIL</Label>
          <input type="email" value={form.email} onChange={set("email")} placeholder="you@email.com" disabled={status==="loading"} style={errors.email?errStyle:normal} onFocus={onFocus} onBlur={onBlur(!!errors.email)} />
          <Err msg={errors.email}/>
        </div>
      </div>

      {/* Subject */}
      <div>
        <Label>SUBJECT</Label>
        <input type="text" value={form.subject} onChange={set("subject")} placeholder="What's this about?" disabled={status==="loading"} style={errors.subject?errStyle:normal} onFocus={onFocus} onBlur={onBlur(!!errors.subject)} />
        <Err msg={errors.subject}/>
      </div>

      {/* Message */}
      <div>
        <Label>MESSAGE</Label>
        <textarea value={form.message} onChange={set("message")} placeholder="Tell me about your project, internship opportunity, or just say hi..." rows={5} disabled={status==="loading"}
          style={{...(errors.message?errStyle:normal), resize:"vertical", minHeight:120}} onFocus={onFocus} onBlur={onBlur(!!errors.message)} />
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <Err msg={errors.message}/>
          <span style={{fontSize:11,color:T.textMuted,marginTop:5,marginLeft:"auto"}}>{form.message.length}/5000</span>
        </div>
      </div>

      {/* State 2 - Loading / State 1 - Default */}
      <button type="submit" disabled={status==="loading"}
        style={{padding:"14px 28px",borderRadius:R.full,border:"none",cursor:status==="loading"?"not-allowed":"pointer",background:status==="loading"?T.accent+"70":T.accent,color:T.accentLabel,fontSize:14,fontWeight:700,fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"opacity 0.2s,background 0.2s",alignSelf:"flex-start"}}>
        {status==="loading"
          ? <><span style={{width:16,height:16,border:"2px solid "+T.accentLabel+"40",borderTopColor:T.accentLabel,borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>Sending...</>
          : "Send Message →"}
      </button>

      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      <p style={{fontSize:11,color:T.textMuted,margin:0}}>No spam. I reply personally within 48 hours.</p>
    </form>
  );
}