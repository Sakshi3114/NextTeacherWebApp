import { prisma } from "@/lib/prisma";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { LeaveDecisionButtons } from "@/components/admin/leave-decision-buttons";

const STATUS_VARIANT = { PENDING: "secondary", APPROVED: "default", REJECTED: "destructive" };

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export default async function AdminLeavePage() {
  const requests = await prisma.leaveRequest.findMany({
    include: { teacher: { include: { user: true } }, substitute: { include: { user: true } } },
    // Pending first, then most recently decided.
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Leave requests</h1>
        <p className="text-muted-foreground">Review and decide on teacher leave requests.</p>
      </div>

      {requests.length === 0 ? (
        <EmptyState title="No leave requests" description="Requests submitted by teachers will show up here." />
      ) : (
        <div className="space-y-2">
          {requests.map((r) => (
            <Card key={r.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0 py-3">
                <div>
                  <CardTitle className="text-base">{r.teacher.user.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(r.startDate)} – {formatDate(r.endDate)}
                  </p>
                  <p className="text-sm text-muted-foreground">{r.reason}</p>
                  {r.substitute ? (
                    <p className="text-xs text-muted-foreground">Suggested substitute: {r.substitute.user.name}</p>
                  ) : null}
                </div>
                {r.status === "PENDING" ? (
                  <LeaveDecisionButtons leaveRequestId={r.id} />
                ) : (
                  <Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge>
                )}
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
