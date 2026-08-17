import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NoticeForm } from "@/components/forms/notice-form";
import { EmptyState } from "@/components/empty-state";

export default async function TeacherNoticesPage() {
  const session = await auth();

  const myNotices = await prisma.notice.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Post a notice</h1>
        <p className="text-muted-foreground">
          This posts under your own account — the old app trusted an editable URL for identity, this one uses
          your signed-in session.
        </p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <NoticeForm />
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Your notices</h2>
        {myNotices.length === 0 ? (
          <EmptyState title="You haven't posted anything yet" />
        ) : (
          <div className="space-y-3">
            {myNotices.map((notice) => (
              <Card key={notice.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{notice.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm">{notice.body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
