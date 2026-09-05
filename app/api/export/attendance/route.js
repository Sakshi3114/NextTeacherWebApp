import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { toCsv, csvResponse } from "@/lib/csv";

// GET route (not a Server Action) for the same download-trigger reason as
// /api/export/teachers. A teacher always gets their own records regardless
// of query params; an admin can target a specific teacher or omit it for
// everyone.
export async function GET(request) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    return new Response("Not authorized.", { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  let teacherId = searchParams.get("teacherId") || undefined;

  if (session.user.role === "TEACHER") {
    const teacher = await prisma.teacher.findUnique({ where: { userId: session.user.id } });
    if (!teacher) return new Response("No teacher profile found.", { status: 404 });
    teacherId = teacher.id;
  }

  const records = await prisma.attendanceRecord.findMany({
    where: teacherId ? { session: { teacherId } } : undefined,
    include: {
      student: { include: { user: true } },
      session: { include: { period: { include: { subject: true, teacher: { include: { user: true } } } } } },
    },
    orderBy: { session: { date: "desc" } },
  });

  const csv = toCsv(
    ["Date", "Subject", "Teacher", "Student", "Roll number", "Status"],
    records.map((r) => [
      r.session.date.toISOString().slice(0, 10),
      r.session.period.subject.name,
      r.session.period.teacher.user.name,
      r.student.user.name,
      r.student.rollNumber ?? "",
      r.status,
    ])
  );

  return csvResponse("attendance.csv", csv);
}
