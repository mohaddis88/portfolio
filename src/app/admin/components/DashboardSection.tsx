"use client";
import { useEffect, useState } from "react";

const T = { accent: "#D4B896", text: "#F5F0EA", textSub: "#A89F91", glassRaised: "rgba(22,17,14,0.80)", border: "rgba(255,255,255,0.09)" };

export function DashboardSection({ supabase, setPage }: any) {
  const [stats, setStats] = useState({ projects: 0, messages: 0, experiences: 0 });

  useEffect(() => {
    async function loadStats() {
      const [proj, msg, exp] = await Promise.all([
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }).eq('read', false),
        supabase.from('experience').select('*', { count: 'exact', head: true })
      ]);
      setStats({ projects: proj.count || 0, messages: msg.count || 0, experiences: exp.count || 0 });
    }
    loadStats();
  }, [supabase]);

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: T.text, marginBottom: 24 }}>Dashboard Overview</h2>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
        {/* Stat Cards */}
        <div style={{ padding: 24, borderRadius: 16, background: T.glassRaised, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 13, color: T.textSub, marginBottom: 8 }}>Total Projects</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: T.accent }}>{stats.projects}</div>
          <button onClick={() => setPage("projects")} style={{ marginTop: 16, fontSize: 12, color: T.accent, background: "transparent", border: "none", cursor: "pointer" }}>Manage Projects →</button>
        </div>

        <div style={{ padding: 24, borderRadius: 16, background: T.glassRaised, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 13, color: T.textSub, marginBottom: 8 }}>Unread Messages</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: T.accent }}>{stats.messages}</div>
          <button onClick={() => setPage("messages")} style={{ marginTop: 16, fontSize: 12, color: T.accent, background: "transparent", border: "none", cursor: "pointer" }}>View Inbox →</button>
        </div>

        <div style={{ padding: 24, borderRadius: 16, background: T.glassRaised, border: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 13, color: T.textSub, marginBottom: 8 }}>Experience Entries</div>
          <div style={{ fontSize: 32, fontWeight: 800, color: T.accent }}>{stats.experiences}</div>
          <button onClick={() => setPage("experience")} style={{ marginTop: 16, fontSize: 12, color: T.accent, background: "transparent", border: "none", cursor: "pointer" }}>Update Timeline →</button>
        </div>
      </div>
    </div>
  );
}