import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STATUS_VARIANT = {
  PRESENT: "default",
  ABSENT: "destructive",
  LATE: "secondary",
  EXCUSED: "outline",
};

export default async function AttendanceSessionDetailPage({ params }) {
  const { sessionId } = await params;
  const session = await auth();

  const attendanceSession = await prisma.attendanceSession.findUnique({
    where: { id: sessionId },
    include: {
      period: { include: { subject: true, teacher: true } },
      records: { include: { student: { include: { user: true } } }, orderBy: { student: { user: { name: "asc" } } } },
    },
  });

  if (!attendanceSession) notFound();
  // Teachers can only view their own sessions; admins can view any.
  if (session.user.role === "TEACHER" && attendanceSession.period.teacher.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{attendanceSession.period.subject.name}</h1>
        <p className="text-muted-foreground">
          {new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(attendanceSession.date)}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Records</CardTitle>
          <CardDescription>{attendanceSession.records.length} students</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {attendanceSession.records.map((record) => (
            <div key={record.id} className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">{record.student.user.name}</p>
                <p className="text-sm text-muted-foreground">{record.student.rollNumber ?? "—"}</p>
              </div>
              <Badge variant={STATUS_VARIANT[record.status]}>{record.status}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
