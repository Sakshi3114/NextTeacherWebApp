import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { EmptyState } from "@/components/empty-state";
import { AttendanceRoster } from "@/components/teacher/attendance-roster";

const DAY_LABEL = {
  MONDAY: "Monday", TUESDAY: "Tuesday", WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday", FRIDAY: "Friday", SATURDAY: "Saturday",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default async function TeacherAttendancePage({ searchParams }) {
  const params = await searchParams;
  const session = await auth();

  const teacher = await prisma.teacher.findUnique({
    where: { userId: session.user.id },
    include: { periods: { include: { subject: true }, orderBy: [{ day: "asc" }, { startTime: "asc" }] } },
  });

  if (!teacher) {
    return (
      <EmptyState
        title="No teacher profile"
        description="You're signed in as an admin, so there's no personal roster to take attendance for."
      />
    );
  }

  if (teacher.periods.length === 0) {
    return <EmptyState title="No periods assigned yet" description="An admin will set up your timetable." />;
  }

  const selectedPeriodId = params?.periodId && teacher.periods.some((p) => p.id === params.periodId)
    ? params.periodId
    : teacher.periods[0].id;
  const selectedDate = params?.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : todayIso();

  const selectedPeriod = teacher.periods.find((p) => p.id === selectedPeriodId);

  const [enrollments, existingSession] = await Promise.all([
    prisma.enrollment.findMany({
      where: { subjectId: selectedPeriod.subjectId },
      include: { student: { include: { user: true } } },
      orderBy: { student: { user: { name: "asc" } } },
    }),
    prisma.attendanceSession.findUnique({
      where: { periodId_date: { periodId: selectedPeriodId, date: new Date(selectedDate) } },
      include: { records: true },
    }),
  ]);

  const students = enrollments.map((e) => ({
    id: e.student.id,
    name: e.student.user.name,
    rollNumber: e.student.rollNumber,
  }));
  const existingStatuses = Object.fromEntries((existingSession?.records ?? []).map((r) => [r.studentId, r.status]));

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Take attendance</h1>
        <p className="text-muted-foreground">Pick a class and date, then mark each student.</p>
      </div>

      <form className="flex flex-wrap items-end gap-3" action="/teacher/attendance">
        <div className="space-y-1">
          <label htmlFor="periodId" className="text-sm font-medium">Class</label>
          <select
            id="periodId"
            name="periodId"
            defaultValue={selectedPeriodId}
            className="flex h-9 w-64 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            {teacher.periods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.subject.name} — {DAY_LABEL[p.day]} {p.startTime}–{p.endTime}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label htmlFor="date" className="text-sm font-medium">Date</label>
          <input
            id="date"
            type="date"
            name="date"
            defaultValue={selectedDate}
            className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-9 items-center rounded-md bg-secondary px-4 text-sm font-medium hover:bg-secondary/80"
        >
          Load
        </button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{selectedPeriod.subject.name}</CardTitle>
          <CardDescription>
            {DAY_LABEL[selectedPeriod.day]} {selectedPeriod.startTime}–{selectedPeriod.endTime} · {selectedDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {students.length === 0 ? (
            <EmptyState
              title="No students enrolled"
              description="An admin can enroll students in this subject from Admin → Subjects."
            />
          ) : (
            <AttendanceRoster
              periodId={selectedPeriodId}
              date={selectedDate}
              students={students}
              existingStatuses={existingStatuses}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
