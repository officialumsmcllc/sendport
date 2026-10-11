import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
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

  if (!user || user.role !== "ADMIN") {
    redirect("/login?redirect=/admin");
  }

  let initialData = defaultAdminData;
  try {
    initialData = await getAdminOverviewData();
  } catch (err) {
    console.error("Error fetching initial admin overview data:", err);
  }

  return <AdminDashboardClient initialData={initialData} />;
}
