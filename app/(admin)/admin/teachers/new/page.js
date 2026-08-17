import { prisma } from "@/lib/prisma";
import { createTeacher } from "@/lib/actions/teacher-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TeacherForm } from "@/components/forms/teacher-form";

export default async function NewTeacherPage() {
  const departments = await prisma.department.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Add a teacher</CardTitle>
          <CardDescription>
            This creates a real account (email + temporary password) — teachers are no longer able to
            self-register.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {departments.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Create a department first before adding a teacher.
            </p>
          ) : (
            <TeacherForm departments={departments} action={createTeacher} mode="create" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
