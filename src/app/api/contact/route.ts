// app/api/contact/route.ts
// Contact form endpoint.
// Flow: validate → rate limit → save to DB → send email → respond
//
// Setup:
//   npm install resend zod @upstash/ratelimit @upstash/redis
//
// .env.local:
//   RESEND_API_KEY=re_xxxxxxxxxxxx
//   CONTACT_EMAIL_TO=you@email.com
//   UPSTASH_REDIS_REST_URL=https://...
//   UPSTASH_REDIS_REST_TOKEN=...

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Resend } from "resend";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { createClient } from "@/lib/supabase/server";

// Input schema - mirrors the client-side validation exactly
const ContactSchema = z.object({
  name:    z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email:   z.string().trim().toLowerCase().email("Please enter a valid email address").max(254),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(200),
  message: z.string().trim().min(10, "Message too short - tell me more!").max(5000),
});

// Rate limiter - 5 requests per 15 minutes per IP
// Falls back gracefully if Upstash isn't configured yet
let ratelimit: Ratelimit | null = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis:     new Redis({ url: process.env.UPSTASH_REDIS_REST_URL, token: process.env.UPSTASH_REDIS_REST_TOKEN }),
    limiter:   Ratelimit.slidingWindow(5, "15 m"),
    analytics: true,
    prefix:    "portfolio:contact",
  });
}

// Email to you when someone contacts
function emailHtml(name: string, email: string, subject: string, message: string) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#1A1614;font-family:'Inter',system-ui,sans-serif;">
<div style="max-width:560px;margin:40px auto;padding:0 20px;">
  <div style="background:rgba(212,184,150,0.10);border:1px solid rgba(212,184,150,0.20);border-radius:16px;padding:24px 28px;margin-bottom:16px;">
    <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.12em;color:#D4B896;text-transform:uppercase;">New Message</p>
    <h1 style="margin:0;font-size:20px;font-weight:800;color:#F5F0EA;">Portfolio Contact</h1>
  </div>
  <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:14px;padding:20px 24px;margin-bottom:16px;">
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px 0;font-size:11px;color:#6B6158;font-weight:600;width:80px;">FROM</td><td style="padding:6px 0;font-size:14px;color:#F5F0EA;font-weight:600;">${name}</td></tr>
      <tr><td style="padding:6px 0;font-size:11px;color:#6B6158;font-weight:600;">EMAIL</td><td style="padding:6px 0;font-size:14px;"><a href="mailto:${email}" style="color:#D4B896;">${email}</a></td></tr>
      <tr><td style="padding:6px 0;font-size:11px;color:#6B6158;font-weight:600;">SUBJECT</td><td style="padding:6px 0;font-size:14px;color:#F5F0EA;">${subject}</td></tr>
    </table>
  </div>
  <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.09);border-radius:14px;padding:20px 24px;margin-bottom:20px;">
    <p style="margin:0 0 8px;font-size:11px;color:#6B6158;font-weight:600;">MESSAGE</p>
    <p style="margin:0;font-size:14px;color:#A89F91;line-height:1.8;white-space:pre-wrap;">${message.replace(/</g,"&lt;").replace(/>/g,"&gt;")}</p>
  </div>
  <div style="text-align:center;margin-bottom:32px;">
    <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" style="display:inline-block;padding:12px 28px;background:#D4B896;color:#1A1614;font-weight:700;font-size:14px;text-decoration:none;border-radius:999px;">Reply to ${name} →</a>
  </div>
  <p style="text-align:center;font-size:11px;color:#3D3028;">Sent from your portfolio contact form</p>
</div></body></html>`;
}

// Confirmation email to person who contacted you
function confirmationHtml(name: string) {
  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#FDFBF7;font-family:'Inter',system-ui,sans-serif;">
<div style="max-width:480px;margin:40px auto;padding:0 20px;text-align:center;">
  <div style="background:#fff;border:1px solid rgba(210,180,140,0.25);border-radius:20px;padding:36px 32px;">
    <div style="width:52px;height:52px;background:rgba(193,154,107,0.12);border-radius:50%;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;font-size:24px;">✓</div>
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:800;color:#2C241B;">Message received!</h1>
    <p style="margin:0 0 24px;font-size:14px;color:#7A6548;line-height:1.7;">Hey ${name}, thanks for reaching out. I'll get back to you within 24–48 hours.</p>
    <a href="https://alamin.dev" style="display:inline-block;padding:11px 24px;background:#C19A6B;color:#2C241B;font-weight:700;font-size:13px;text-decoration:none;border-radius:999px;">Back to portfolio →</a>
  </div>
  <p style="font-size:11px;color:#A89070;margin-top:20px;">Alamin Mohaddis Hasan · Full-Stack Web Developer</p>
</div></body></html>`;
}

// Hash IP - never store raw IPs, hashed for spam tracking only
async function hashIp(ip: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip + (process.env.CONTACT_EMAIL_TO ?? "salt")));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("").slice(0,16);
}

export async function POST(request: NextRequest) {
  // 1. Get IP
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
           ?? request.headers.get("x-real-ip")
           ?? "127.0.0.1";

  // 2. Rate limit
  if (ratelimit) {
    const { success, reset } = await ratelimit.limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "Too many messages. Please try again in a few minutes." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((reset - Date.now()) / 1000)) } }
      );
    }
  }

  // 3. Parse + validate
  let body: unknown;
  try { body = await request.json(); }
  catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }

  const result = ContactSchema.safeParse(body);
  if (!result.success) {
    const first = result.error.issues[0];
    return NextResponse.json({ error: first.message, field: first.path[0] }, { status: 400 });
  }

  const { name, email, subject, message } = result.data;

  // 4. Save to DB (don't block on failure)
  try {
    const supabase = await createClient();
    await supabase.from("messages").insert({ name, email, subject, message, ip_hash: await hashIp(ip) });
  } catch (err) {
    console.error("[Contact] DB error:", err);
  }

  // 5. Send emails (don't block on failure - message is in DB)
  const resendKey = process.env.RESEND_API_KEY;
  const toEmail   = process.env.CONTACT_EMAIL_TO;
  if (resendKey && toEmail) {
    try {
      const resend = new Resend(resendKey);
      await Promise.all([
        resend.emails.send({ from:"Portfolio <hasanmohaddis@gmail.com>", to:toEmail, subject:`[Portfolio] ${subject} - from ${name}`, html:emailHtml(name,email,subject,message), replyTo:email }),
        resend.emails.send({ from:"Alamin Mohaddis Hasan <hasanmohaddis@gmail.com>", to:email, subject:"Got your message! - Alamin", html:confirmationHtml(name) }),
      ]);
    } catch (err) {
      console.error("[Contact] Email error:", err);
    }
  }

  // 6. Success
  return NextResponse.json({ success: true, message: "Message sent! I'll reply within 48 hours." });
}

export async function GET() {
  return NextResponse.json({ error: "Method not allowed." }, { status: 405 });
}