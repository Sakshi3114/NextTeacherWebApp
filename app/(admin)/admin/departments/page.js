import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DepartmentForm } from "@/components/admin/department-form";
import { EmptyState } from "@/components/empty-state";

export default async function AdminDepartmentsPage() {
  const departments = await prisma.department.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { teachers: true } } },
  });

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Departments</h1>
        <p className="text-muted-foreground">Departments group teachers and subjects together.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a department</CardTitle>
        </CardHeader>
        <CardContent>
          <DepartmentForm />
        </CardContent>
      </Card>

      {departments.length === 0 ? (
        <EmptyState title="No departments yet" description="Add one above to get started." />
      ) : (
        <div className="flex flex-wrap gap-2">
          {departments.map((d) => (
            <Badge key={d.id} variant="secondary" className="px-3 py-1.5 text-sm">
              {d.name} &middot; {d._count.teachers} teacher{d._count.teachers === 1 ? "" : "s"}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
