import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/workspace-auth";
import { getDashboardOverviewData } from "@/lib/data/dashboard-overview";
import DashboardClient from "./DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login");
  }

  const initialData = await getDashboardOverviewData(auth.workspace.id, auth.user);

  return <DashboardClient initialData={initialData} />;
}
