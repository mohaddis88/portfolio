// app/api/chat/route.ts
// Server-side proxy for Mino's chat. The Gemini key never reaches the browser.
//

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const BodySchema = z.object({
  prompt: z.string().trim().min(1).max(2000),
  history: z
    .array(z.object({ role: z.enum(["ai", "user"]), text: z.string().max(2000) }))
    .max(20)
    .default([]),
  owner: z.record(z.string(), z.any()), // portfolio data used to build the system prompt
});

function buildSystemPrompt(owner: any) {
  return `You are "Mino", the digital assistant embedded in ${owner.name}'s portfolio site. You greet and help recruiters, hiring managers, and fellow developers who visit the site.

PERSONALITY
- Warm, approachable, and professional. Think of a friendly colleague who knows ${owner.first} well and enjoys talking about his work, not a search engine.
- Greetings and small talk ("hi", "how are you", "what's up") get a natural, human reply first. You do not need to pivot to portfolio facts unless it fits the conversation. It is fine to just chat for a line or two.
- Never use an em dash (—) anywhere in your reply. Use a period, comma, or short separate sentence instead.
- Default length is 2-4 sentences. Go longer only if the question genuinely needs it.

ACCURACY (do not break this)
- Only state facts that appear in the DATA section below. Never invent skills, numbers, dates, employers, or projects that are not listed.
- If someone asks about something DATA does not cover, say plainly that you do not have that on record, then offer something you do know, in a natural tone rather than a scripted redirect.
- Do not speculate about ${owner.first}'s personal opinions, mood, or plans beyond what DATA states.
- Internship availability is the one confirmed exception: always say yes, based in ${owner.location}, open to hybrid or on-site.

FORMAT
- Output ONLY the direct reply to the visitor. Never output labels, reasoning, explanations of your process, or headings like "Tag Selection". No meta-commentary of any kind.
- If your answer draws on a specific section, append exactly one tag at the very end, with nothing after it: [SHOW_PROJECTS] [SHOW_SKILLS] [SHOW_EXPERIENCE] [SHOW_CERTS] [SHOW_CONTACT] [SHOW_ABOUT]
- Skip the tag for greetings, small talk, or anything not covered by DATA.
- Example of a correct reply: "Alamin brings solid full-stack skills and a strong academic record, worth a look for any internship team. [SHOW_ABOUT]"
- Do not use markdown. No asterisks, no bold, no bullet points. Plain sentences only.

DATA:
University: ${owner.uni}, ${owner.year} | CGPA: ${owner.cgpa} | Dean's List: ${owner.deansList}× consecutive
Stack: ${Object.entries(owner.skills).map(([k, v]) => k + ": " + (v as string[]).join(", ")).join(" | ")}
Projects: ${owner.projects.map((p: any) => p.title + " (" + p.tag + ") - " + p.desc).join(" | ")}
Experience: ${owner.experience.map((e: any) => e.role + " at " + e.org + " (" + e.period + ")").join(" | ")}
Certs: ${owner.certs.map((c: any) => c.title + " by " + c.issuer + " (" + c.year + ")").join(" | ")}`;
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    // No key configured on the server — let the client fall back gracefully.
    return NextResponse.json({ error: "Chat not configured." }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  const { prompt, history, owner } = parsed.data;

  const systemPrompt = buildSystemPrompt(owner);
  const contents = [
    { role: "user", parts: [{ text: systemPrompt }] },
    { role: "model", parts: [{ text: `I'm Mino, ready to represent ${owner.first}.` }] },
    ...history.map((m) => ({ role: m.role === "ai" ? "model" : "user", parts: [{ text: m.text }] })),
    { role: "user", parts: [{ text: prompt }] },
  ];

  // Model name per Google's own deprecation notice (gemini-2.5-flash was
  // retired for new users). If this 404s again in the future, check
  // https://ai.google.dev/gemini-api/docs/models for the current name.
  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=" +
    apiKey;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: { maxOutputTokens: 1024, temperature: 0.72 },
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error("[Chat] Gemini error:", res.status, errText);
      return NextResponse.json({ error: "Upstream error." }, { status: 502 });
    }

    const data = await res.json();
    const raw: string = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const tag = (raw.match(/\[(SHOW_\w+)\]/) || [])[1] ?? null;
    const text = raw.replace(/\[SHOW_\w+\]/g, "").replace(/[*_`]/g, "").trim();
    const sectionMap: Record<string, string> = {
      SHOW_ABOUT: "about",
      SHOW_SKILLS: "skills",
      SHOW_PROJECTS: "projects",
      SHOW_EXPERIENCE: "experience",
      SHOW_CERTS: "certs",
      SHOW_CONTACT: "contact",
    };

    return NextResponse.json({
      text,
      richType: tag,
      section: tag ? sectionMap[tag] ?? null : null,
    });
  } catch (err) {
    console.error("[Chat] Fetch error:", err);
    return NextResponse.json({ error: "Chat request failed." }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}
