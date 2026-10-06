"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DeprecatedDashboardAdminPage() {
  const router = useRouter();

  useEffect(() => {
    // The admin panel is completely separate from customer dashboard
    router.replace("/admin");
  }, [router]);

  return (
    <div className="p-8 text-center text-slate-500">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary-600 border-t-transparent mx-auto mb-2" />
      <p className="text-xs font-semibold">Redirecting to dedicated Admin Portal at /admin...</p>
    </div>
  );
}
