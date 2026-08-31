// app/owner-defaults.ts
// Pulled out of page.tsx so both the server-side data loader and the
// client component can import DEFAULT_OWNER / OwnerData without creating
// a client<->server import cycle.

export const DEFAULT_OWNER = {
  name:      "Alamin Mohaddis Hasan",
  first:     "MOHADDIS HASAN",
  last:      "ALAMIN",
  initials:  "MHA",
  role:      "Full-Stack Web Developer",
  bio:       "I build full-stack web apps - the kind that look good, load fast, and don't break when someone clicks the wrong button.",
  uni:       "SEGi University",
  year:      "3rd Year · BIT",
  location:  "Malaysia",
  cgpa:      "3.78",
  deansList: 4,
  email:     "hasanmohaddis@gmail.com",
  github:    "https://github.com/mohaddis88",
  linkedin:  "www.linkedin.com/in/mohaddis-hasan",
  skills: {
    Frontend: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Framer Motion"],
    Backend:  ["Node.js", "Supabase", "PostgreSQL", "REST APIs", "Express"],
    Tools:    ["Git", "Figma", "Vercel", "Docker", "VS Code"],
  },
  projects: [
    { title:"StudySync",   tag:"Full-Stack", desc:"Real-time collaborative study platform - live cursors, shared notes, Pomodoro timer.", tech:["Next.js","Supabase","TypeScript"], demo:"#", repo:"#", emoji:"📚" },
  ],
  experience: [
    { role:"Frontend Developer", org:"Freelance",  period:"Jan 2024 – Present", desc:"Client projects - landing pages, dashboards." },
  ],
  awards: {
    academic:       [{ title:"Dean's List", issuer:"SEGi University", year:"2023/24", gpa:"3.92", hasPdf:true }],
    certifications: [{ title:"Meta Front-End", issuer:"Coursera",   year:"2024", hasPdf:true }],
    volunteering:   [],
    personal:       [],
  },
  deanSemesters: [{ sem:"Sem 2 2023/24", gpa:"3.92" }],
  certs: [{ title:"Meta Front-End", issuer:"Coursera", year:"2024" }],
  bgMusic: "https://cdn.pixabay.com/audio/2024/11/13/audio_ac22a60be9.mp3",
};

export type OwnerData = typeof DEFAULT_OWNER;
