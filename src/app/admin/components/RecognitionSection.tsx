"use client";
import { useEffect, useState } from "react";

const T = { bgSurface: "#211C19", glassRaised: "rgba(22,17,14,0.80)", border: "rgba(255,255,255,0.09)", accent: "#D4B896", accentLabel: "#1A1614", text: "#F5F0EA", textSub: "#A89F91", error: "#FCA5A5" };

export function RecognitionSection({ supabase, toast }: any) {
  const [awards, setAwards] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);

  const fetchAwards = async () => {
    const { data } = await supabase.from('awards').select('*').order('sort_order', { ascending: true });
    if (data) setAwards(data);
  };

  useEffect(() => { fetchAwards(); }, []);

  const handleSave = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      title: formData.get("title"),
      issuer: formData.get("issuer"),
      year: formData.get("year"),
      gpa: formData.get("gpa"),
      category: formData.get("category"),
      pdf_url: formData.get("pdf_url"),
      visible: formData.get("visible") === "on",
    };

    if (editing?.id) {
      await supabase.from('awards').update(payload).eq('id', editing.id);
      toast("Award updated!");
    } else {
      await supabase.from('awards').insert([payload]);
      toast("Award added!");
    }
    setEditing(null);
    fetchAwards();
  };

  const inputStyle = { width: "100%", padding: "10px 14px", background: T.bgSurface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 8, marginBottom: 12 };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: T.text }}>Awards & Certificates</h2>
        <button onClick={() => setEditing({})} style={{ padding: "8px 16px", background: T.accent, color: T.accentLabel, borderRadius: 8, border: "none", fontWeight: 600, cursor: "pointer" }}>+ New Award</button>
      </div>

      {editing !== null ? (
        <form onSubmit={handleSave} style={{ background: T.glassRaised, padding: 24, borderRadius: 16, border: `1px solid ${T.border}` }}>
          <input name="title" defaultValue={editing.title} placeholder="Title (e.g. Meta Front-End Developer)" required style={inputStyle} />
          <input name="issuer" defaultValue={editing.issuer} placeholder="Issuer (e.g. Coursera)" required style={inputStyle} />
          
          <select name="category" defaultValue={editing.category || "certifications"} required style={{...inputStyle, WebkitAppearance: "none"}}>
            <option value="academic">Academic (Dean's List / GPA)</option>
            <option value="certifications">Certifications</option>
            <option value="volunteering">Volunteering</option>
          </select>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <input name="year" defaultValue={editing.year} placeholder="Year or Semester" style={inputStyle} />
            <input name="gpa" defaultValue={editing.gpa} placeholder="GPA (if Academic)" style={inputStyle} />
          </div>
          
          <input name="pdf_url" defaultValue={editing.pdf_url} placeholder="PDF Link (Optional)" style={inputStyle} />
          
          <label style={{ display: "flex", alignItems: "center", gap: 8, color: T.textSub, marginBottom: 24 }}>
            <input type="checkbox" name="visible" defaultChecked={editing.id ? editing.visible : true} />
            Visible to Public
          </label>

          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" style={{ padding: "10px 20px", background: T.accent, color: T.accentLabel, borderRadius: 8, border: "none", fontWeight: 600, cursor: "pointer" }}>Save</button>
            <button type="button" onClick={() => setEditing(null)} style={{ padding: "10px 20px", background: "transparent", color: T.textSub, borderRadius: 8, border: `1px solid ${T.border}`, cursor: "pointer" }}>Cancel</button>
          </div>
        </form>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {awards.map(awd => (
            <div key={awd.id} style={{ padding: 16, background: T.glassRaised, border: `1px solid ${T.border}`, borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>{awd.title}</div>
                <div style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>{awd.issuer} • {awd.year} {awd.gpa && `• GPA: ${awd.gpa}`}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setEditing(awd)} style={{ padding: "6px 12px", background: T.bgSurface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 6, cursor: "pointer" }}>Edit</button>
                <button onClick={async () => { await supabase.from('awards').delete().eq('id', awd.id); fetchAwards(); }} style={{ padding: "6px 12px", background: "transparent", border: `1px solid ${T.error}`, color: T.error, borderRadius: 6, cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}