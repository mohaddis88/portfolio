// lib/supabase/getOwnerData.ts
// Runs on the server. Fetches settings/projects/experience/awards and
// merges them into DEFAULT_OWNER, so page.tsx can render fully-populated
// HTML on the first response instead of showing a client-side spinner.

import { createClient } from "@/lib/supabase/server";
import { DEFAULT_OWNER, type OwnerData } from "@/app/owner-defaults";

export async function getOwnerData(): Promise<OwnerData> {
  try {
    const supabase = await createClient();
    const [{ data: set }, { data: proj }, { data: exp }, { data: awd }] = await Promise.all([
      supabase.from("site_settings").select("*"),
      supabase.from("projects").select("*").eq("visible", true).order("sort_order"),
      supabase.from("experience").select("*").eq("visible", true).order("sort_order"),
      supabase.from("awards").select("*").eq("visible", true).order("sort_order"),
    ]);

    const sMap: Record<string, string> = {};
    set?.forEach((row) => (sMap[row.key] = row.value));

    const liveOwner: OwnerData = JSON.parse(JSON.stringify(DEFAULT_OWNER));

    if (sMap["owner_name"]) {
      liveOwner.name = sMap["owner_name"];
      const parts = sMap["owner_name"].split(" ");
      liveOwner.first = parts[0];
      liveOwner.last = parts.slice(1).join(" ");
      liveOwner.initials = parts.map((n) => n[0]).join("").toUpperCase();
    }
    if (sMap["owner_role"]) liveOwner.role = sMap["owner_role"];
    if (sMap["owner_bio"]) liveOwner.bio = sMap["owner_bio"];
    if (sMap["owner_uni"]) liveOwner.uni = sMap["owner_uni"];
    if (sMap["owner_year"]) liveOwner.year = sMap["owner_year"];
    if (sMap["owner_location"]) liveOwner.location = sMap["owner_location"];
    if (sMap["owner_cgpa"]) liveOwner.cgpa = sMap["owner_cgpa"];
    if (sMap["owner_dean_list"]) liveOwner.deansList = parseInt(sMap["owner_dean_list"]) || 0;
    if (sMap["social_email"]) liveOwner.email = sMap["social_email"];
    if (sMap["social_github"]) liveOwner.github = sMap["social_github"];
    if (sMap["social_linkedin"]) liveOwner.linkedin = sMap["social_linkedin"];
    if (sMap["bg_music_url"]) liveOwner.bgMusic = sMap["bg_music_url"];

    if (proj && proj.length > 0) {
      liveOwner.projects = proj.map((p) => ({
        title: p.title,
        tag: p.category || "Project",
        desc: p.description || "",
        tech: p.tech_stack || [],
        demo: p.demo_url || "#",
        repo: p.repo_url || "#",
        emoji: "🚀",
      }));
    }

    if (exp && exp.length > 0) {
      liveOwner.experience = exp.map((e) => ({
        role: e.role,
        org: e.org,
        period: e.period,
        desc: e.description || "",
      }));
    }

    if (awd && awd.length > 0) {
      const academic = awd.filter((a) => a.category === "academic");
      const certs = awd.filter((a) => a.category === "certifications");

      if (academic.length > 0) {
        liveOwner.awards.academic = academic.map((a) => ({
          title: a.title,
          issuer: a.issuer,
          year: a.year || "",
          gpa: a.gpa || "",
          hasPdf: !!a.pdf_url,
        }));
        liveOwner.deanSemesters = academic.map((a) => ({ sem: a.year || "", gpa: a.gpa || "" }));
      }
      if (certs.length > 0) {
        liveOwner.awards.certifications = certs.map((a) => ({
          title: a.title,
          issuer: a.issuer,
          year: a.year || "",
          hasPdf: !!a.pdf_url,
        }));
        liveOwner.certs = certs.map((a) => ({ title: a.title, issuer: a.issuer, year: a.year || "" }));
      }
    }

    return liveOwner;
  } catch (e) {
    console.error("[getOwnerData] fetch error:", e);
    return DEFAULT_OWNER;
  }
}
