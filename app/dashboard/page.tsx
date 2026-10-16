import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, getCurrentUser } from "@/lib/auth/session";
import { getAuthContext } from "@/lib/auth/workspace-auth";
import { getDashboardOverviewData, defaultDashboardData } from "@/lib/data/dashboard-overview";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  let auth = null;
  try {
    auth = await getAuthContext();
  } catch (err) {
    console.error("Failed to retrieve auth context during dashboard SSR:", err);
  }

  // If full DB workspace resolution wasn't completed in SSR, verify session token
  if (!auth) {
    const session = await getCurrentUser();
    if (!session) {
      redirect("/login?unauthenticated=1");
    }
  }

  const safeUser = auth?.user || { id: "user", email: "", role: "USER" };
  let initialData = defaultDashboardData(safeUser);
  if (auth?.workspace?.id) {
    try {
      initialData = await getDashboardOverviewData(auth.workspace.id, auth.user);
    } catch (err) {
      console.error("Error fetching dashboard overview data during SSR:", err);
    }
  }

  return <DashboardClient initialData={initialData} />;
}
