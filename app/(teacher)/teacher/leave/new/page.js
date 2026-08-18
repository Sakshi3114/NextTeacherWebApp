import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { LeaveForm } from "@/components/forms/leave-form";

export default async function NewLeaveRequestPage() {
  const session = await auth();
  const teacher = await prisma.teacher.findUnique({ where: { userId: session.user.id } });

  const otherTeachers = await prisma.teacher.findMany({
    where: teacher ? { id: { not: teacher.id } } : undefined,
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });

  return (
    <div className="max-w-xl">
      <Card>
        <CardHeader>
          <CardTitle>Request leave</CardTitle>
          <CardDescription>An admin will review and approve or reject this request.</CardDescription>
        </CardHeader>
        <CardContent>
          <LeaveForm otherTeachers={otherTeachers} />
        </CardContent>
      </Card>
    </div>
  );
}
