import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateTeacher } from "@/lib/actions/teacher-actions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TeacherForm } from "@/components/forms/teacher-form";

export default async function EditTeacherPage({ params }) {
  const { id } = await params;

  const [teacher, departments] = await Promise.all([
    prisma.teacher.findUnique({ where: { id }, include: { user: true } }),
    prisma.department.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!teacher) notFound();

  const boundAction = updateTeacher.bind(null, teacher.id);

  return (
    <div className="max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Edit {teacher.user.name}</CardTitle>
          <CardDescription>Update this teacher's profile details.</CardDescription>
        </CardHeader>
        <CardContent>
          <TeacherForm
            departments={departments}
            action={boundAction}
            mode="edit"
            defaultValues={{
              name: teacher.user.name,
              email: teacher.user.email,
              phone: teacher.phone ?? "",
              departmentId: teacher.departmentId ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
