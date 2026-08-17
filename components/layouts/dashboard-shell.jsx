"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, Building2, BookOpen, Megaphone, CalendarDays, ClipboardCheck } from "lucide-react";
import { cn } from "@/lib/utils";

// Nav config lives here (not passed down from the Server Component layout)
// because icon *components* are function references — React can't serialize
// those across the server -> client boundary as props.
const NAV_BY_ROLE = {
  admin: [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/teachers", label: "Teachers", icon: Users },
    { href: "/admin/departments", label: "Departments", icon: Building2 },
    { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
    { href: "/admin/timetable", label: "Timetable", icon: CalendarDays },
  ],
  teacher: [
    { href: "/teacher", label: "My schedule", icon: LayoutDashboard },
    { href: "/teacher/attendance", label: "Attendance", icon: ClipboardCheck },
    { href: "/teacher/notices", label: "Notices", icon: Megaphone },
  ],
};

const ROLE_LABEL = { admin: "Admin", teacher: "Teacher" };

export function DashboardShell({ role, children }) {
  const pathname = usePathname();
  const navItems = NAV_BY_ROLE[role] ?? [];

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row">
      <aside className="shrink-0 md:w-56">
        <p className="mb-3 px-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {ROLE_LABEL[role]}
        </p>
        <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                  active && "bg-accent text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
