import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SubjectForm } from "@/components/admin/subject-form";
import { EmptyState } from "@/components/empty-state";

export default async function AdminSubjectsPage() {
  const [subjects, departments] = await Promise.all([
    prisma.subject.findMany({ orderBy: { name: "asc" }, include: { department: true } }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
        <p className="text-muted-foreground">
          Subjects are assigned to periods when building a teacher's timetable (full timetable builder UI lands
          in the next phase).
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
        <div className="flex flex-wrap gap-2">
          {subjects.map((s) => (
            <Badge key={s.id} variant="secondary" className="px-3 py-1.5 text-sm">
              {s.name} {s.code ? `(${s.code})` : ""} {s.department ? `· ${s.department.name}` : ""}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
