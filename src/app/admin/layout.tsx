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

  if (!user && typeof window === "undefined") {
    // Middleware handles redirect
  }

  return (
    <div className="admin-wrapper">
      {children}
    </div>
  );
}