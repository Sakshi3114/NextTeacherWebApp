import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";

const STATUS_VARIANT = { PRESENT: "default", ABSENT: "destructive", LATE: "secondary", EXCUSED: "outline" };

export default async function StudentAttendancePage() {
  const session = await auth();

  const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
  if (!student) {
    return <EmptyState title="No student profile" description="Nothing to show here for an admin account." />;
  }

  const records = await prisma.attendanceRecord.findMany({
    where: { studentId: student.id },
    include: { session: { include: { period: { include: { subject: true } } } } },
    orderBy: { session: { date: "desc" } },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My attendance</h1>
        <p className="text-muted-foreground">Every session recorded for your classes.</p>
      </div>

      {records.length === 0 ? (
        <EmptyState title="No attendance recorded yet" description="Sessions your teachers take will show up here." />
      ) : (
        <div className="space-y-2">
          {records.map((record) => (
            <Card key={record.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0 py-3">
                <div>
                  <CardTitle className="text-base">{record.session.period.subject.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(record.session.date)}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[record.status]}>{record.status}</Badge>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
