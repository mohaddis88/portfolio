"use client";
import { useEffect, useState } from "react";

const T = { bgSurface: "#211C19", glassRaised: "rgba(22,17,14,0.80)", border: "rgba(255,255,255,0.09)", accent: "#D4B896", accentLabel: "#1A1614", text: "#F5F0EA", textSub: "#A89F91", error: "#FCA5A5" };

export function ExperienceSection({ supabase, toast }: any) {
  const [experience, setExperience] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);

  const fetchExperience = async () => {
    const { data } = await supabase.from('experience').select('*').order('sort_order', { ascending: true });
    if (data) setExperience(data);
  };

  useEffect(() => { fetchExperience(); }, []);

  const handleSave = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      role: formData.get("role"),
      org: formData.get("org"),
      period: formData.get("period"),
      description: formData.get("description"),
      visible: formData.get("visible") === "on",
    };

    if (editing?.id) {
      await supabase.from('experience').update(payload).eq('id', editing.id);
      toast("Experience updated!");
    } else {
      await supabase.from('experience').insert([payload]);
      toast("Experience added!");
    }
    setEditing(null);
    fetchExperience();
  };

  const inputStyle = { width: "100%", padding: "10px 14px", background: T.bgSurface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 8, marginBottom: 12 };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: T.text }}>Experience & Education</h2>
        <button onClick={() => setEditing({})} style={{ padding: "8px 16px", background: T.accent, color: T.accentLabel, borderRadius: 8, border: "none", fontWeight: 600, cursor: "pointer" }}>+ New Entry</button>
      </div>

      {editing !== null ? (
        <form onSubmit={handleSave} style={{ background: T.glassRaised, padding: 24, borderRadius: 16, border: `1px solid ${T.border}` }}>
          <input name="role" defaultValue={editing.role} placeholder="Role / Degree (e.g. Frontend Developer)" required style={inputStyle} />
          <input name="org" defaultValue={editing.org} placeholder="Organization / University" required style={inputStyle} />
          <input name="period" defaultValue={editing.period} placeholder="Period (e.g. Jan 2024 - Present)" required style={inputStyle} />
          <textarea name="description" defaultValue={editing.description} placeholder="Description / Achievements" rows={4} style={inputStyle} />
          
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
          {experience.map(exp => (
            <div key={exp.id} style={{ padding: 16, background: T.glassRaised, border: `1px solid ${T.border}`, borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>{exp.role} @ {exp.org}</div>
                <div style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>{exp.period}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setEditing(exp)} style={{ padding: "6px 12px", background: T.bgSurface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 6, cursor: "pointer" }}>Edit</button>
                <button onClick={async () => { await supabase.from('experience').delete().eq('id', exp.id); fetchExperience(); }} style={{ padding: "6px 12px", background: "transparent", border: `1px solid ${T.error}`, color: T.error, borderRadius: 6, cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}