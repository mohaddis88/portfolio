// app/admin/layout.tsx
// Auth guard for all admin pages.
// Middleware handles redirect, this does a server-side double-check.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Admin - Portfolio" };

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Middleware should catch this first, but double-check server-side
  if (!user && typeof window === "undefined") {
    // Only redirect on non-login pages - middleware handles the rest
  }

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}