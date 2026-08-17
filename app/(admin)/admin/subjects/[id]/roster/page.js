import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { EnrollmentToggle } from "@/components/admin/enrollment-toggle";

export default async function SubjectRosterPage({ params }) {
  const { id } = await params;

  const subject = await prisma.subject.findUnique({ where: { id } });
  if (!subject) notFound();

  const [students, enrollments] = await Promise.all([
    prisma.student.findMany({ include: { user: true, department: true }, orderBy: { user: { name: "asc" } } }),
    prisma.enrollment.findMany({ where: { subjectId: id } }),
  ]);
  const enrolledIds = new Set(enrollments.map((e) => e.studentId));

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{subject.name} roster</h1>
        <p className="text-muted-foreground">Choose which students are enrolled in this subject.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Students</CardTitle>
          <CardDescription>{enrolledIds.size} of {students.length} enrolled</CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <EmptyState title="No students yet" description="Students are added via the seed script for now." />
          ) : (
            <div className="divide-y">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{student.user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {student.rollNumber ?? "—"} {student.department ? `· ${student.department.name}` : ""}
                    </p>
                  </div>
                  <EnrollmentToggle
                    studentId={student.id}
                    subjectId={id}
                    initialEnrolled={enrolledIds.has(student.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
