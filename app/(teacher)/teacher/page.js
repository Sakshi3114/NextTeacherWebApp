import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

const DAY_LABEL = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
};

export default async function TeacherDashboardPage() {
  const session = await auth();

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
    include: { periods: { include: { subject: true }, orderBy: [{ day: "asc" }, { startTime: "asc" }] } },
  });

  if (!teacher) {
    return (
      <EmptyState
        title="No teacher profile"
        description="You're signed in as an admin, so there's no personal schedule to show here."
      />
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">My schedule</h1>
      {teacher.periods.length === 0 ? (
        <EmptyState title="No periods assigned yet" description="An admin will set up your timetable." />
      ) : (
        <div className="space-y-3">
          {teacher.periods.map((period) => (
            <Card key={period.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{DAY_LABEL[period.day]}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between text-sm">
                <span className="font-medium">{period.subject.name}</span>
                <span className="text-muted-foreground">
                  {period.startTime}&ndash;{period.endTime}
                  {period.room ? ` · Room ${period.room}` : ""}
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
