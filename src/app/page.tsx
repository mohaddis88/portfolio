// app/page.tsx
// Server Component: fetches portfolio data on the server so the first
// response is already populated (no client-side loading spinner).

import PortfolioClient from "./PortfolioClient";
import { getOwnerData } from "@/lib/supabase/getOwnerData";

// Re-fetch at most once per 60s per deployment (tune to taste, or remove
// entirely to fetch fresh on every request).
export const revalidate = 60;

export default async function Page() {
  const owner = await getOwnerData();
  return <PortfolioClient owner={owner} />;
}
