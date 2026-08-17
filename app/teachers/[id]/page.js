import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";

const DAY_ORDER = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const DAY_LABEL = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
};

export default async function TeacherDetailPage({ params }) {
  const { id } = await params;

  const teacher = await prisma.teacher.findUnique({
    where: { id },
    include: {
      user: true,
      department: true,
      periods: { include: { subject: true }, orderBy: [{ day: "asc" }, { startTime: "asc" }] },
    },
  });

  if (!teacher) notFound();

  const periodsByDay = DAY_ORDER.map((day) => ({
    day,
    periods: teacher.periods.filter((p) => p.day === day),
  }));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="text-2xl">{teacher.user.name}</CardTitle>
            {teacher.department ? <Badge variant="secondary">{teacher.department.name}</Badge> : null}
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> {teacher.user.email}
          </span>
          {teacher.phone ? (
            <span className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> {teacher.phone}
            </span>
          ) : null}
        </CardContent>
      </Card>

      <h2 className="mb-4 text-lg font-semibold">Weekly schedule</h2>
      {teacher.periods.length === 0 ? (
        <EmptyState title="No schedule yet" description="This teacher doesn't have any periods assigned." />
      ) : (
        <div className="space-y-4">
          {periodsByDay
            .filter((d) => d.periods.length > 0)
            .map(({ day, periods }) => (
              <Card key={day}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{DAY_LABEL[day]}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {periods.map((period) => (
                    <div
                      key={period.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm"
                    >
                      <span className="font-medium">{period.subject.name}</span>
                      <span className="text-muted-foreground">
                        {period.startTime}&ndash;{period.endTime}
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
