import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";

const DAY_LABEL = {
  MONDAY: "Monday", TUESDAY: "Tuesday", WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday", FRIDAY: "Friday", SATURDAY: "Saturday",
};
const DAY_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export default async function StudentDashboardPage() {
  const session = await auth();

  const student = await prisma.student.findUnique({
    where: { userId: session.user.id },
    include: { enrollments: { include: { subject: true } } },
  });

  if (!student) {
    return (
      <EmptyState
        title="No student profile"
        description="You're signed in as an admin, so there's no personal schedule to show here."
      />
    );
  }

  const subjectIds = student.enrollments.map((e) => e.subjectId);
  const periods = subjectIds.length
    ? await prisma.period.findMany({
        where: { subjectId: { in: subjectIds } },
        include: { subject: true, teacher: { include: { user: true } } },
        orderBy: [{ day: "asc" }, { startTime: "asc" }],
      })
    : [];

  const periodsByDay = DAY_ORDER.map((day) => ({ day, periods: periods.filter((p) => p.day === day) }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold tracking-tight">My schedule</h1>
      {student.enrollments.length === 0 ? (
        <EmptyState title="Not enrolled in any subjects yet" description="An admin will enroll you soon." />
      ) : periods.length === 0 ? (
        <EmptyState title="No classes scheduled yet" description="Check back once the timetable is built." />
      ) : (
        <div className="space-y-4">
          {periodsByDay
            .filter((d) => d.periods.length > 0)
            .map(({ day, periods: dayPeriods }) => (
              <Card key={day}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{DAY_LABEL[day]}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dayPeriods.map((period) => (
                    <div
                      key={period.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                    >
                      <div>
                        <span className="font-medium">{period.subject.name}</span>
                        <span className="ml-2 text-muted-foreground">with {period.teacher.user.name}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {period.startTime}–{period.endTime}
                        {period.room ? ` · Room ${period.room}` : ""}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </div>
  );
}
