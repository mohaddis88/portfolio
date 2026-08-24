"use client";
import { useEffect, useState } from "react";

const T = { bgSurface: "#211C19", glassRaised: "rgba(22,17,14,0.80)", border: "rgba(255,255,255,0.09)", accent: "#D4B896", accentLabel: "#1A1614", text: "#F5F0EA", textSub: "#A89F91", error: "#FCA5A5" };

export function MessagesSection({ supabase, toast }: any) {
  const [messages, setMessages] = useState<any[]>([]);

  const fetchMessages = async () => {
    const { data } = await supabase.from('messages').select('*').order('created_at', { ascending: false });
    if (data) setMessages(data);
  };

  useEffect(() => { fetchMessages(); }, []);

  const markAsRead = async (id: string) => {
    await supabase.from('messages').update({ read: true }).eq('id', id);
    fetchMessages();
  };

  const deleteMessage = async (id: string) => {
    if(!confirm("Permanently delete this message?")) return;
    await supabase.from('messages').delete().eq('id', id);
    toast("Message deleted.");
    fetchMessages();
  };

  return (
    <div>
      <h2 style={{ fontSize: 24, fontWeight: 700, color: T.text, marginBottom: 24 }}>Inbox</h2>
      
      {messages.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: T.textSub, background: T.glassRaised, borderRadius: 16 }}>No messages yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map(msg => (
            <div key={msg.id} onClick={() => !msg.read && markAsRead(msg.id)} style={{ padding: 20, background: T.glassRaised, border: `1px solid ${msg.read ? T.border : T.accent}`, borderRadius: 12, cursor: msg.read ? "default" : "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: msg.read ? 600 : 800, color: T.text }}>{msg.name}</div>
                  <div style={{ fontSize: 13, color: T.accent }}>{msg.email}</div>
                </div>
                <div style={{ fontSize: 12, color: T.textSub }}>{new Date(msg.created_at).toLocaleDateString()}</div>
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: T.text, marginBottom: 4 }}>Subject: {msg.subject}</div>
              <p style={{ fontSize: 14, color: T.textSub, lineHeight: 1.6, whiteSpace: "pre-wrap", background: T.bgSurface, padding: 16, borderRadius: 8, marginTop: 12 }}>
                {msg.message}
              </p>
              <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
                <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`} style={{ padding: "8px 16px", background: T.accent, color: T.accentLabel, borderRadius: 6, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>Reply via Email</a>
                <button onClick={(e) => { e.stopPropagation(); deleteMessage(msg.id); }} style={{ padding: "8px 16px", background: "transparent", color: T.error, border: `1px solid ${T.error}`, borderRadius: 6, cursor: "pointer", fontSize: 13 }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}