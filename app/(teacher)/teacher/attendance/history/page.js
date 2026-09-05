import Link from "next/link";
import { Download } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

export default async function AttendanceHistoryPage() {
  const session = await auth();

  const teacher = await prisma.teacher.findUnique({ where: { userId: session.user.id } });
  if (!teacher) {
    return <EmptyState title="No teacher profile" description="Nothing to show here for an admin account." />;
  }

  const sessions = await prisma.attendanceSession.findMany({
    where: { teacherId: teacher.id },
    include: { period: { include: { subject: true } }, records: true },
    orderBy: { date: "desc" },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Attendance history</h1>
          <p className="text-muted-foreground">Every session you've taken attendance for.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <a href="/api/export/attendance">
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </a>
        </Button>
      </div>

      {sessions.length === 0 ? (
        <EmptyState title="No attendance taken yet" description="Sessions you record will show up here." />
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => {
            const present = s.records.filter((r) => r.status === "PRESENT").length;
            return (
              <Link key={s.id} href={`/teacher/attendance/history/${s.id}`}>
                <Card className="transition-colors hover:border-primary">
                  <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                    <div>
                      <CardTitle className="text-base">{s.period.subject.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(s.date)} · {s.period.startTime}–{s.period.endTime}
                      </p>
                    </div>
                    <Badge variant="secondary">{present}/{s.records.length} present</Badge>
                  </CardHeader>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
