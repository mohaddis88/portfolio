"use client";
import { useEffect, useState } from "react";

const T = { bgSurface: "#211C19", glassRaised: "rgba(22,17,14,0.80)", border: "rgba(255,255,255,0.09)", accent: "#D4B896", accentLabel: "#1A1614", text: "#F5F0EA", textSub: "#A89F91" };

// ── Label + input wrapper ─────────────────────────────────────
function Field({ label, children }: { label:string; children:React.ReactNode }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      <label style={{ fontSize:11, fontWeight:600, color:T.textSub, letterSpacing:"0.08em", textTransform:"uppercase" }}>{label}</label>
      {children}
    </div>
  );
}

export function SettingsSection({ supabase, toast }: any) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('site_settings').select('*');
      if (data) {
        const sMap: Record<string, string> = {};
        data.forEach((row: any) => sMap[row.key] = row.value);
        setSettings(sMap);
      }
    }
    fetchSettings();
  }, [supabase]);

  const handleChange = (key: string, value: string) => setSettings(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    const rows = Object.entries(settings).map(([key, value]) => ({ key, value }));
    const { error } = await supabase.from('site_settings').upsert(rows, { onConflict: 'key' });
    
    setSaving(false);
    if (error) toast("Failed to save settings", "error");
    else toast("Portfolio Settings Updated!", "success");
  };

  const inputStyle = { width: "100%", padding: "10px 14px", background: T.bgSurface, border: `1px solid ${T.border}`, color: T.text, borderRadius: 8, marginBottom: 16, outline: "none", fontFamily: "inherit" };
  const labelStyle = { display: "block", fontSize: 12, color: T.textSub, marginBottom: 6, fontWeight: 600, textTransform: "uppercase" as const };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: T.text }}>Portfolio Settings</h2>
        <button onClick={handleSave} disabled={saving} style={{ padding: "8px 20px", background: T.accent, color: T.accentLabel, borderRadius: 8, border: "none", fontWeight: 600, cursor: "pointer" }}>
          {saving ? "Saving..." : "Save All Changes"}
        </button>
      </div>

      <div style={{ background: T.glassRaised, padding: 32, borderRadius: 16, border: `1px solid ${T.border}`, display: "flex", flexDirection: "column", gap: 8 }}>
        <h3 style={{ fontSize: 18, color: T.text, marginBottom: 16 }}>Personal Information</h3>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div><label style={labelStyle}>Full Name</label><input style={inputStyle} value={settings['owner_name'] || ''} onChange={e => handleChange('owner_name', e.target.value)} /></div>
          <div><label style={labelStyle}>Role Title</label><input style={inputStyle} value={settings['owner_role'] || ''} onChange={e => handleChange('owner_role', e.target.value)} /></div>
          <div><label style={labelStyle}>University</label><input style={inputStyle} value={settings['owner_uni'] || ''} onChange={e => handleChange('owner_uni', e.target.value)} /></div>
          <div><label style={labelStyle}>Year / Program</label><input style={inputStyle} value={settings['owner_year'] || ''} onChange={e => handleChange('owner_year', e.target.value)} /></div>
          <div><label style={labelStyle}>Location</label><input style={inputStyle} value={settings['owner_location'] || ''} onChange={e => handleChange('owner_location', e.target.value)} /></div>
          <div><label style={labelStyle}>CGPA</label><input style={inputStyle} value={settings['owner_cgpa'] || ''} onChange={e => handleChange('owner_cgpa', e.target.value)} /></div>
          <div><label style={labelStyle}>Dean's List Count</label><input style={inputStyle} value={settings['owner_dean_list'] || ''} onChange={e => handleChange('owner_dean_list', e.target.value)} /></div>
        </div>

        <div><label style={labelStyle}>Bio (About Section)</label><textarea rows={3} style={inputStyle} value={settings['owner_bio'] || ''} onChange={e => handleChange('owner_bio', e.target.value)} /></div>
        
        <div><label style={labelStyle}>Available Badge Text</label><input style={inputStyle} value={settings['available_text'] || ''} onChange={e => handleChange('available_text', e.target.value)} /></div>
        <div><label style={labelStyle}>Mino Greeting Message</label><textarea rows={3} style={inputStyle} value={settings['mino_greeting'] || ''} onChange={e => handleChange('mino_greeting', e.target.value)} /></div>
        
        {/* HERE IS THE NEW MUSIC URL FIELD */}
        <div><label style={labelStyle}>Background Music URL (.mp3)</label><input style={inputStyle} value={settings['bg_music_url'] || ''} onChange={e => handleChange('bg_music_url', e.target.value)} placeholder="Paste Supabase MP3 URL here" /></div>

        <h3 style={{ fontSize: 18, color: T.text, marginTop: 24, marginBottom: 16 }}>Social Links</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div><label style={labelStyle}>Email Address</label><input type="email" style={inputStyle} value={settings['social_email'] || ''} onChange={e => handleChange('social_email', e.target.value)} /></div>
          <div><label style={labelStyle}>GitHub URL</label><input style={inputStyle} value={settings['social_github'] || ''} onChange={e => handleChange('social_github', e.target.value)} /></div>
          <div><label style={labelStyle}>LinkedIn URL</label><input style={inputStyle} value={settings['social_linkedin'] || ''} onChange={e => handleChange('social_linkedin', e.target.value)} /></div>
        </div>
      </div>
    </div>
  );
}