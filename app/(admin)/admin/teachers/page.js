import Link from "next/link";
import { Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { TeachersTable } from "@/components/admin/teachers-table";

export default async function AdminTeachersPage() {
  const teachers = await prisma.teacher.findMany({
    include: { user: true, department: true },
    orderBy: { user: { name: "asc" } },
  });

  const rows = teachers.map((t) => ({
    id: t.id,
    name: t.user.name,
    email: t.user.email,
    department: t.department?.name ?? null,
  }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Teachers</h1>
        <Button asChild>
          <Link href="/admin/teachers/new">
            <Plus className="mr-2 h-4 w-4" /> Add teacher
          </Link>
        </Button>
      </div>
      <TeachersTable teachers={rows} />
    </div>
  );
}
