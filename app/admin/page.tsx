import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { getAdminOverviewData } from "@/lib/data/admin-overview";
import AdminDashboardClient from "./AdminDashboardClient";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/login?redirect=/admin");
  }

  const initialData = await getAdminOverviewData();

  return <AdminDashboardClient initialData={initialData} />;
}
