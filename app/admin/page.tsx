import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getCurrentUser, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { getAdminOverviewData, defaultAdminData } from "@/lib/data/admin-overview";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch (err) {
    console.error("Failed to verify user session during admin SSR:", err);
  }

  if (!user) {
    try {
      const cookieStore = await cookies();
      cookieStore.delete(SESSION_COOKIE_NAME);
    } catch (_) {}
    redirect("/login?redirect=/admin");
  }

  if (user.role !== "ADMIN") {
    redirect("/dashboard?error=unauthorized_admin_access");
  }

  let initialData = defaultAdminData;
  try {
    initialData = await getAdminOverviewData();
  } catch (err) {
    console.error("Error fetching initial admin overview data:", err);
  }

  return <AdminDashboardClient initialData={initialData} />;
}
