"use client";
import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

// Import your split components
import { DashboardSection } from "./components/DashboardSection";
import { ProjectsSection } from "./components/ProjectsSection";
import { ExperienceSection } from "./components/ExperienceSection";
import { SettingsSection } from "./components/SettingsSection";
import { RecognitionSection } from "./components/RecognitionSection";
import { MessagesSection } from "./components/MessagesSection";

const T = { bg: "#1A1614", glass: "rgba(15,11,9,0.64)", border: "rgba(255,255,255,0.09)", accent: "#D4B896", text: "#F5F0EA", textSub: "#A89F91" };

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "◈" },
  { id: "settings", label: "Settings", icon: "⚙" },
  { id: "projects", label: "Projects", icon: "◫" },
  { id: "experience", label: "Experience", icon: "◎" },
  { id: "recognition", label: "Awards", icon: "◆" },
  { id: "messages", label: "Messages", icon: "◉" }
];

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [page, setPage] = useState("dashboard");

  const toast = useCallback((msg: string) => alert(msg), []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <div style={{ minHeight: "100vh", background: T.bg, display: "flex", color: T.text, fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: T.glass, borderRight: `1px solid ${T.border}`, padding: 24, display: "flex", flexDirection: "column", gap: 8 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, color: T.text }}>AMH Admin</h1>
        {NAV.map(n => (
          <button key={n.id} onClick={() => setPage(n.id)} style={{ padding: "12px", textAlign: "left", background: page === n.id ? "rgba(212,184,150,0.15)" : "transparent", color: page === n.id ? T.accent : T.textSub, border: "none", borderRadius: 8, cursor: "pointer", fontWeight: page === n.id ? 600 : 400 }}>
            {n.icon} {n.label}
          </button>
        ))}
        <div style={{ marginTop: "auto", paddingTop: 16, borderTop: `1px solid ${T.border}` }}>
          <a href="/" target="_blank" style={{ display: "block", fontSize: 12, color: T.textSub, textDecoration: "none", marginBottom: 16 }}>View Portfolio ↗</a>
          <button onClick={signOut} style={{ width: "100%", padding: "8px", background: "transparent", border: `1px solid ${T.border}`, color: T.textSub, borderRadius: 6, cursor: "pointer", fontSize: 12 }}>← Sign Out</button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: 40, maxWidth: 900 }}>
        {page === "dashboard" && <DashboardSection supabase={supabase} setPage={setPage} />}
        {page === "settings" && <SettingsSection supabase={supabase} toast={toast} />}
        {page === "projects" && <ProjectsSection supabase={supabase} toast={toast} />}
        {page === "experience" && <ExperienceSection supabase={supabase} toast={toast} />}
        {page === "recognition" && <RecognitionSection supabase={supabase} toast={toast} />}
        {page === "messages" && <MessagesSection supabase={supabase} toast={toast} />}
      </main>
    </div>
  );
}