# Portfolio — Alamin Mohaddis Hasan

> AI-powered personal portfolio built with Next.js, Supabase, and Google Gemini

**Live:** [alamin.dev](https://alamin.dev)

## Features

- 🤖 **Mino AI Agent** — Gemini 2.5 Flash answers questions about my work
- 🎨 **Dual theme** — Light (camel) / Dark (champagne gold) with 6-layer glassmorphism
- ⚡ **Spring-physics cursor** — Framer Motion dual-blob reactive background
- 🗄️ **Full CMS** — Admin dashboard for all content, no redeploy needed
- 📬 **Contact form** — Rate-limited, validated, saves to DB, sends via Resend
- 🔒 **Secure** — RLS on all tables, hashed IPs, Zod validation, no hardcoded secrets

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 14 App Router + TypeScript |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| AI | Google Gemini 2.5 Flash |
| Animation | Framer Motion |
| Email | Resend |
| Rate Limiting | Upstash Redis |
| Deployment | Vercel |

## Local Development

```bash
# Clone
git clone https://github.com/YOUR_USERNAME/portfolio.git
cd portfolio

# Install
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your keys in .env.local

# Run
npm run dev
```

## Environment Variables

See `.env.example` for all required variables.
Never commit `.env.local` — it is in `.gitignore`.

## Admin Access

The admin dashboard lives at `/admin/login`.  
Account created directly in Supabase Auth — no public signup.

---

Built by [Alamin Mohaddis Hasan](https://alamin.dev) · SEGi University · Malaysia
EOF
