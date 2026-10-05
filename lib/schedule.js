// Shared scheduling helpers — used by both timetable conflict checks
// (lib/actions/period-actions.js) and substitute-finding
// (lib/actions/substitution-actions.js), so the "do these two time ranges
// clash" and "which weekday is this date" logic only lives in one place.

// Overlap test on zero-padded "HH:mm" strings — no time parsing needed,
// lexicographic comparison is correct for a fixed-width format.
export function overlaps(aStart, aEnd, bStart, bEnd) {
  return !(aEnd <= bStart || aStart >= bEnd);
}

export const DAY_INDEX_TO_ENUM = ["", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

// "YYYY-MM-DD" from a Date's local Y/M/D — the plain-date-string format
// used everywhere a date crosses a form/action boundary (see
// leaveRequestSchema), so it round-trips through `new Date(str)` cleanly.
export function toDateInputValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Periods are recurring weekly slots, not date instances (see the comment
// on LeaveRequest in prisma/schema.prisma), so "which classes does this
// leave affect" has to be computed by walking the leave's date range and
// matching each date's weekday against the teacher's periods — there's no
// row to query directly. Returns one { date, period } entry per affected
// class occurrence, ordered by date then start time.
export function getOccurrencesForLeave(leaveRequest, periods) {
  const occurrences = [];
  const cursor = new Date(leaveRequest.startDate);
  const end = new Date(leaveRequest.endDate);

  while (cursor.getTime() <= end.getTime()) {
    const dayEnum = DAY_INDEX_TO_ENUM[cursor.getDay()];
    const dayPeriods = periods
      .filter((p) => p.day === dayEnum)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    for (const period of dayPeriods) {
      occurrences.push({ date: new Date(cursor), period });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return occurrences;
}
