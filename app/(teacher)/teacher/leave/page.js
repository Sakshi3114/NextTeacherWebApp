import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";

const STATUS_VARIANT = { PENDING: "secondary", APPROVED: "default", REJECTED: "destructive" };

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export default async function TeacherLeavePage() {
  const session = await auth();
  const teacher = await prisma.teacher.findUnique({ where: { userId: session.user.id } });

  if (!teacher) {
    return <EmptyState title="No teacher profile" description="Nothing to show here for an admin account." />;
  }

  const requests = await prisma.leaveRequest.findMany({
    where: { teacherId: teacher.id },
    include: { substitute: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Leave requests</h1>
          <p className="text-muted-foreground">Your leave history and pending requests.</p>
        </div>
        <Button asChild>
          <Link href="/teacher/leave/new">Request leave</Link>
        </Button>
      </div>

      {requests.length === 0 ? (
        <EmptyState title="No leave requests yet" description="Submit one when you need time off." />
      ) : (
        <div className="space-y-2">
          {requests.map((r) => (
            <Card key={r.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0 py-3">
                <div>
                  <CardTitle className="text-base">
                    {formatDate(r.startDate)} – {formatDate(r.endDate)}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{r.reason}</p>
                  {r.substitute ? (
                    <p className="text-xs text-muted-foreground">Suggested substitute: {r.substitute.user.name}</p>
                  ) : null}
                </div>
                <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
