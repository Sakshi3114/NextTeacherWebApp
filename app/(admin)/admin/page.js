import Link from "next/link";
import { Users, Building2, BookOpen, Megaphone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const [teacherCount, departmentCount, subjectCount, noticeCount] = await Promise.all([
    prisma.teacher.count(),
    prisma.department.count(),
    prisma.subject.count(),
    prisma.notice.count(),
  ]);

  const stats = [
    { label: "Teachers", value: teacherCount, href: "/admin/teachers", icon: Users },
    { label: "Departments", value: departmentCount, href: "/admin/departments", icon: Building2 },
    { label: "Subjects", value: subjectCount, href: "/admin/subjects", icon: BookOpen },
    { label: "Notices", value: noticeCount, href: "/notices", icon: Megaphone },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">Admin dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, href, icon: Icon }) => (
          <Link key={label} href={href}>
            <Card className="transition-colors hover:border-primary">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
