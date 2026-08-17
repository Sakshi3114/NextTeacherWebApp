import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { PeriodDialog } from "@/components/admin/period-dialog";
import { DeletePeriodButton } from "@/components/admin/delete-period-button";

const DAY_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const DAY_LABEL = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
};

export default async function AdminTimetablePage({ searchParams }) {
  const params = await searchParams;

  const teachers = await prisma.teacher.findMany({
    include: { user: true },
    orderBy: { user: { name: "asc" } },
  });

  if (teachers.length === 0) {
    return (
      <EmptyState title="No teachers yet" description="Add a teacher before building their timetable." />
    );
  }

  const selectedTeacherId = params?.teacherId && teachers.some((t) => t.id === params.teacherId)
    ? params.teacherId
    : teachers[0].id;

  const [subjects, periods] = await Promise.all([
    prisma.subject.findMany({ orderBy: { name: "asc" } }),
    prisma.period.findMany({
      where: { teacherId: selectedTeacherId },
      include: { subject: true },
      orderBy: [{ day: "asc" }, { startTime: "asc" }],
    }),
  ]);

  const periodsByDay = DAY_ORDER.map((day) => ({ day, periods: periods.filter((p) => p.day === day) }));
  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Timetable</h1>
          <p className="text-muted-foreground">Build each teacher's weekly schedule.</p>
        </div>
        <PeriodDialog teachers={teachers} subjects={subjects} defaultTeacherId={selectedTeacherId} />
      </div>

      {/* Native GET form so the page stays a Server Component — no client
          state needed just to switch which teacher's timetable is shown. */}
      <form className="mb-6 flex flex-wrap gap-2" action="/admin/timetable">
        {teachers.map((t) => (
          <Button
            key={t.id}
            type="submit"
            name="teacherId"
            value={t.id}
            variant={t.id === selectedTeacherId ? "default" : "outline"}
            size="sm"
          >
            {t.user.name}
          </Button>
        ))}
      </form>

      {periods.length === 0 ? (
        <EmptyState
          title={`No periods yet for ${selectedTeacher.user.name}`}
          description='Use "Add period" to build their schedule.'
        />
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
                        <span className="ml-2 text-muted-foreground">
                          {period.startTime}–{period.endTime}
                          {period.room ? ` · Room ${period.room}` : ""}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <PeriodDialog teachers={teachers} subjects={subjects} period={period} />
                        <DeletePeriodButton
                          periodId={period.id}
                          label={`${period.subject.name} on ${DAY_LABEL[day]}`}
                        />
                      </div>
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
