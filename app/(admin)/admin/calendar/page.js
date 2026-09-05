import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const DAY_INDEX_TO_ENUM = ["", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function monthParam(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

// `Period` rows are recurring weekly slots, not date instances (the same
// fact that shaped the leave-request scope boundary in Phase 3) — so the
// calendar projects the recurring schedule onto real dates rather than
// needing any new schema.
function buildMonthGrid(year, month) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = firstOfMonth.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i += 1) cells.push(null);
  for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default async function AdminCalendarPage({ searchParams }) {
  const params = await searchParams;
  const today = new Date();
  const [yearStr, monthStr] = (params?.month ?? monthParam(today)).split("-");
  const year = Number(yearStr);
  const month = Number(monthStr) - 1;
  const displayedDate = new Date(year, month, 1);

  const prevMonth = new Date(year, month - 1, 1);
  const nextMonth = new Date(year, month + 1, 1);

  const [periods, approvedLeave] = await Promise.all([
    prisma.period.findMany({ include: { subject: true, teacher: { include: { user: true } } } }),
    prisma.leaveRequest.findMany({
      where: {
        status: "APPROVED",
        startDate: { lte: new Date(year, month + 1, 0) },
        endDate: { gte: new Date(year, month, 1) },
      },
      include: { teacher: { include: { user: true } } },
    }),
  ]);

  const periodsByDay = new Map();
  for (const period of periods) {
    const list = periodsByDay.get(period.day) ?? [];
    list.push(period);
    periodsByDay.set(period.day, list.sort((a, b) => a.startTime.localeCompare(b.startTime)));
  }

  const cells = buildMonthGrid(year, month);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Classes and approved leave, projected onto the month.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="icon">
            <Link href={`/admin/calendar?month=${monthParam(prevMonth)}`} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="w-36 text-center text-sm font-medium">
            {new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(displayedDate)}
          </span>
          <Button asChild variant="outline" size="icon">
            <Link href={`/admin/calendar?month=${monthParam(nextMonth)}`} aria-label="Next month">
              <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border text-xs">
            {WEEKDAY_LABELS.map((label) => (
              <div key={label} className="bg-muted px-2 py-1.5 text-center font-medium text-muted-foreground">
                {label}
              </div>
            ))}
            {cells.map((date, i) => {
              if (!date) return <div key={i} className="min-h-24 bg-card" />;

              const dayEnum = DAY_INDEX_TO_ENUM[date.getDay()];
              const dayPeriods = dayEnum ? (periodsByDay.get(dayEnum) ?? []) : [];
              const onLeave = approvedLeave.filter((r) => date >= r.startDate && date <= r.endDate);
              const isToday = isSameDay(date, today);

              return (
                <div key={i} className="min-h-24 space-y-1 bg-card p-1.5">
                  <span
                    className={
                      isToday
                        ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground"
                        : "text-[11px] text-muted-foreground"
                    }
                  >
                    {date.getDate()}
                  </span>
                  <div className="space-y-0.5">
                    {dayPeriods.slice(0, 3).map((p) => (
                      <div
                        key={p.id}
                        title={`${p.subject.name} · ${p.teacher.user.name} · ${p.startTime}-${p.endTime}`}
                        className="truncate rounded bg-primary/10 px-1 py-0.5 text-[10px] text-primary"
                      >
                        {p.startTime} {p.subject.name}
                      </div>
                    ))}
                    {dayPeriods.length > 3 ? (
                      <div className="px-1 text-[10px] text-muted-foreground">+{dayPeriods.length - 3} more</div>
                    ) : null}
                    {onLeave.length > 0 ? (
                      <Badge
                        variant="secondary"
                        className="w-full justify-center px-1 py-0 text-[10px]"
                        title={onLeave.map((r) => r.teacher.user.name).join(", ")}
                      >
                        {onLeave.length} on leave
                      </Badge>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
