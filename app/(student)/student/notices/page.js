import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { NoticeReadTracker } from "@/components/student/notice-read-tracker";

export default async function StudentNoticesPage() {
  const session = await auth();

  const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
  if (!student) {
    return <EmptyState title="No student profile" description="Nothing to show here for an admin account." />;
  }

  const where = { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }] };
  const [notices, reads] = await Promise.all([
    prisma.notice.findMany({ where, include: { author: true }, orderBy: { createdAt: "desc" } }),
    prisma.noticeRead.findMany({ where: { studentId: student.id } }),
  ]);
  const readIds = new Set(reads.map((r) => r.noticeId));

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notices</h1>
        <p className="text-muted-foreground">Announcements from your teachers and admins.</p>
      </div>

      {notices.length === 0 ? (
        <EmptyState title="No notices right now" description="Check back later." />
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => {
            const isRead = readIds.has(notice.id);
            return (
              <Card key={notice.id} className={isRead ? "opacity-70" : "border-primary"}>
                <NoticeReadTracker noticeId={notice.id} />
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">{notice.title}</CardTitle>
                    <div className="flex items-center gap-2">
                      {!isRead ? <Badge>New</Badge> : null}
                      <Badge variant="outline">{notice.author.name}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{notice.body}</p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Posted {new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" }).format(notice.createdAt)}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
