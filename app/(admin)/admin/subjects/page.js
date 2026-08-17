import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubjectForm } from "@/components/admin/subject-form";
import { EmptyState } from "@/components/empty-state";

export default async function AdminSubjectsPage() {
  const [subjects, departments] = await Promise.all([
    prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: { department: true, _count: { select: { enrollments: true, periods: true } } },
    }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
        <p className="text-muted-foreground">
          Subjects are assigned to periods on the timetable and to students via each subject's roster.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a subject</CardTitle>
        </CardHeader>
        <CardContent>
          {departments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Add a department first.</p>
          ) : (
            <SubjectForm departments={departments} />
          )}
        </CardContent>
      </Card>

      {subjects.length === 0 ? (
        <EmptyState title="No subjects yet" description="Add one above to get started." />
      ) : (
        <div className="space-y-2">
          {subjects.map((s) => (
            <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">{s.name}</span>
                {s.code ? <Badge variant="outline">{s.code}</Badge> : null}
                {s.department ? <Badge variant="secondary">{s.department.name}</Badge> : null}
                <span className="text-sm text-muted-foreground">{s._count.enrollments} enrolled</span>
              </div>
              <Link href={`/admin/subjects/${s.id}/roster`} className="text-sm font-medium text-primary hover:underline">
                Manage roster
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
