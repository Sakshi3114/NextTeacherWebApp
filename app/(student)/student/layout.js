import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layouts/dashboard-shell";

export default async function StudentLayout({ children }) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "STUDENT"].includes(session.user.role)) {
    redirect("/sign-in");
  }

  return <DashboardShell role="student">{children}</DashboardShell>;
}
