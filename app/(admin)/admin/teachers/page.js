import Link from "next/link";
import { Plus, Download } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { TeachersTable } from "@/components/admin/teachers-table";

export default async function AdminTeachersPage() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [teachers, onLeaveToday] = await Promise.all([
    prisma.teacher.findMany({
      include: { user: true, department: true },
      orderBy: { user: { name: "asc" } },
    }),
    prisma.leaveRequest.findMany({
      where: { status: "APPROVED", startDate: { lte: today }, endDate: { gte: today } },
      select: { teacherId: true },
    }),
  ]);
  const onLeaveIds = new Set(onLeaveToday.map((r) => r.teacherId));

  const rows = teachers.map((t) => ({
    id: t.id,
    name: t.user.name,
    email: t.user.email,
    department: t.department?.name ?? null,
    onLeaveToday: onLeaveIds.has(t.id),
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Teachers</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <a href="/api/export/teachers">
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </a>
          </Button>
          <Button asChild>
            <Link href="/admin/teachers/new">
              <Plus className="mr-2 h-4 w-4" /> Add teacher
            </Link>
          </Button>
        </div>
      </div>
      <TeachersTable teachers={rows} />
    </div>
  );
}
