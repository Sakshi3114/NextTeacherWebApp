import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layouts/dashboard-shell";

export default async function AdminLayout({ children }) {
  // middleware.js already gates /admin/**, but every layout/action re-checks
  // independently — defense in depth, since middleware alone doesn't cover
  // every possible entry point (e.g. a Server Action invoked directly).
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    redirect("/sign-in");
  }

  return <DashboardShell role="admin">{children}</DashboardShell>;
}
