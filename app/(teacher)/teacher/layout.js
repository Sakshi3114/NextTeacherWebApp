import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/layouts/dashboard-shell";

export default async function TeacherLayout({ children }) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    redirect("/sign-in");
  }

  return <DashboardShell role="teacher">{children}</DashboardShell>;
}
