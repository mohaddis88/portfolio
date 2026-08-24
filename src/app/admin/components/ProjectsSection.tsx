"use client";
import { useEffect, useState } from "react";

const T = { bgSurface: "#211C19", glassRaised: "rgba(22,17,14,0.80)", border: "rgba(255,255,255,0.09)", accent: "#D4B896", accentLabel: "#1A1614", text: "#F5F0EA", textSub: "#A89F91", error: "#FCA5A5" };

export function ProjectsSection({ supabase, toast }: any) {
  const [projects, setProjects] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);

  const fetchProjects = async () => {
    const { data } = await supabase.from('projects').select('*').order('sort_order', { ascending: true });
    if (data) setProjects(data);
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleSave = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const techStack = formData.get("tech_stack")?.toString().split(",").map((s) => s.trim()) || [];
    
    const payload = {
      title: formData.get("title"),
      description: formData.get("description"),
      category: formData.get("category"),
      tech_stack: techStack,
      demo_url: formData.get("demo_url"),
      repo_url: formData.get("repo_url"),
      visible: formData.get("visible") === "on",
    };

    if (editing?.id) {
      await supabase.from('projects').update(payload).eq('id', editing.id);
      toast("Project updated successfully!");
    } else {
      await supabase.from('projects').insert([payload]);
      toast("Project added successfully!");
    }
    setEditing(null);
    fetchProjects();
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Are you sure you want to delete this?")) return;
    await supabase.from('projects').delete().eq('id', id);
    toast("Project deleted.");
    fetchProjects();
  };

  const inputStyle = { width: "100%", padding: "10px 14px", background: T.bgSurface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 8, marginBottom: 12 };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: T.text }}>Manage Projects</h2>
        <button onClick={() => setEditing({})} style={{ padding: "8px 16px", background: T.accent, color: T.accentLabel, borderRadius: 8, border: "none", fontWeight: 600, cursor: "pointer" }}>+ New Project</button>
      </div>

      {editing !== null ? (
        <form onSubmit={handleSave} style={{ background: T.glassRaised, padding: 24, borderRadius: 16, border: `1px solid ${T.border}` }}>
          <h3 style={{ marginBottom: 16, color: T.text }}>{editing.id ? "Edit Project" : "New Project"}</h3>
          <input name="title" defaultValue={editing.title} placeholder="Project Title" required style={inputStyle} />
          <input name="category" defaultValue={editing.category || "Full-Stack"} placeholder="Category (e.g. Full-Stack)" required style={inputStyle} />
          <textarea name="description" defaultValue={editing.description} placeholder="Description" rows={3} required style={inputStyle} />
          <input name="tech_stack" defaultValue={editing.tech_stack?.join(", ")} placeholder="Tech Stack (comma separated, e.g. React, Supabase)" style={inputStyle} />
          <input name="demo_url" defaultValue={editing.demo_url} placeholder="Demo URL" style={inputStyle} />
          <input name="repo_url" defaultValue={editing.repo_url} placeholder="GitHub Repo URL" style={inputStyle} />
          
          <label style={{ display: "flex", alignItems: "center", gap: 8, color: T.textSub, marginBottom: 24 }}>
            <input type="checkbox" name="visible" defaultChecked={editing.id ? editing.visible : true} />
            Visible to Public
          </label>

          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" style={{ padding: "10px 20px", background: T.accent, color: T.accentLabel, borderRadius: 8, border: "none", fontWeight: 600, cursor: "pointer" }}>Save Project</button>
            <button type="button" onClick={() => setEditing(null)} style={{ padding: "10px 20px", background: "transparent", color: T.textSub, borderRadius: 8, border: `1px solid ${T.border}`, cursor: "pointer" }}>Cancel</button>
          </div>
        </form>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {projects.map(p => (
            <div key={p.id} style={{ padding: 16, background: T.glassRaised, border: `1px solid ${T.border}`, borderRadius: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, color: T.text }}>{p.title} {!p.visible && <span style={{fontSize: 10, background: T.error, color: "#000", padding: "2px 6px", borderRadius: 4}}>Hidden</span>}</div>
                <div style={{ fontSize: 13, color: T.textSub, marginTop: 4 }}>{p.category} • {p.tech_stack?.join(", ")}</div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setEditing(p)} style={{ padding: "6px 12px", background: T.bgSurface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 6, cursor: "pointer" }}>Edit</button>
                <button onClick={() => handleDelete(p.id)} style={{ padding: "6px 12px", background: "transparent", border: `1px solid ${T.error}`, color: T.error, borderRadius: 6, cursor: "pointer" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}