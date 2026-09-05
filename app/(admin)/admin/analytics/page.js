import { ClipboardCheck, Megaphone, CalendarOff, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";
import { AttendanceBarChart } from "@/components/admin/attendance-bar-chart";
import { LeaveTrendChart } from "@/components/admin/leave-trend-chart";

function monthLabel(date) {
  return new Intl.DateTimeFormat("en-US", { month: "short" }).format(date);
}

// Last `count` months (oldest first), keyed the same way requests are
// bucketed below, so months with zero requests still render as a bar.
function lastMonths(count) {
  const months = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: monthLabel(d) });
  }
  return months;
}

export default async function AdminAnalyticsPage() {
  const [totalStudents, attendanceRecords, notices, pendingLeaveCount, leaveRequests] = await Promise.all([
    prisma.student.count(),
    prisma.attendanceRecord.findMany({
      include: { session: { include: { period: { include: { subject: true } } } } },
    }),
    prisma.notice.findMany({
      include: { reads: true, author: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.leaveRequest.count({ where: { status: "PENDING" } }),
    // Bucketed by startDate (when the leave is/was), not createdAt (when it
    // was filed) — createdAt defaults to "now" for every row regardless of
    // how far in the past/future the leave itself falls, which would bury
    // every request in a single "this month" bucket.
    prisma.leaveRequest.findMany({ select: { startDate: true, status: true } }),
  ]);

  // Aggregated in JS rather than a DB-side groupBy: fine at this data scale
  // (a real deployment's worth of rows would want prisma.groupBy or raw SQL
  // instead of pulling every record).
  const overallAttendanceRate = attendanceRecords.length
    ? Math.round((attendanceRecords.filter((r) => r.status === "PRESENT").length / attendanceRecords.length) * 100)
    : 0;

  const bySubject = new Map();
  for (const record of attendanceRecords) {
    const subject = record.session.period.subject;
    const bucket = bySubject.get(subject.id) ?? { label: subject.name, present: 0, total: 0 };
    bucket.total += 1;
    if (record.status === "PRESENT") bucket.present += 1;
    bySubject.set(subject.id, bucket);
  }
  const attendanceBySubject = [...bySubject.values()]
    .map((b) => ({ label: b.label, value: Math.round((b.present / b.total) * 100), count: b.total }))
    .sort((a, b) => b.value - a.value);

  const overallReadRate = notices.length
    ? Math.round(
        (notices.reduce((sum, n) => sum + (totalStudents ? n.reads.length / totalStudents : 0), 0) / notices.length) * 100
      )
    : 0;

  const months = lastMonths(6);
  const leaveByMonth = months.map((m) => ({ label: m.label, APPROVED: 0, PENDING: 0, REJECTED: 0 }));
  const monthIndex = new Map(months.map((m, i) => [m.key, i]));
  for (const req of leaveRequests) {
    const key = `${req.startDate.getFullYear()}-${req.startDate.getMonth()}`;
    const idx = monthIndex.get(key);
    if (idx !== undefined) leaveByMonth[idx][req.status] += 1;
  }

  const stats = [
    { icon: ClipboardCheck, label: "Overall attendance rate", value: `${overallAttendanceRate}%` },
    { icon: Megaphone, label: "Notice read rate", value: `${overallReadRate}%` },
    { icon: CalendarOff, label: "Pending leave requests", value: pendingLeaveCount },
    { icon: Users, label: "Students", value: totalStudents },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Attendance, notice engagement, and leave trends at a glance.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardContent className="flex items-center gap-3 pt-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{value}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Attendance rate by subject</CardTitle>
            <CardDescription>Share of records marked present.</CardDescription>
          </CardHeader>
          <CardContent>
            <AttendanceBarChart data={attendanceBySubject} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leave requests, last 6 months</CardTitle>
            <CardDescription>By decision status.</CardDescription>
          </CardHeader>
          <CardContent>
            <LeaveTrendChart months={leaveByMonth} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notice engagement</CardTitle>
          <CardDescription>How many students have read each recent notice.</CardDescription>
        </CardHeader>
        <CardContent>
          {notices.length === 0 ? (
            <EmptyState title="No notices yet" description="Notices you post will show up here." />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Notice</TableHead>
                  <TableHead>Posted by</TableHead>
                  <TableHead>Posted</TableHead>
                  <TableHead className="text-right">Read</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notices.map((notice) => {
                  const pct = totalStudents ? Math.round((notice.reads.length / totalStudents) * 100) : 0;
                  return (
                    <TableRow key={notice.id}>
                      <TableCell className="font-medium">{notice.title}</TableCell>
                      <TableCell className="text-muted-foreground">{notice.author.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(notice.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        {notice.reads.length}/{totalStudents} ({pct}%)
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
