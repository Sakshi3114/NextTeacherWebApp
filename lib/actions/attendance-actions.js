"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { attendanceSchema } from "@/lib/validations/attendance";

// Takes a plain object (not FormData) — called directly from a client
// component via startTransition, same pattern as the other *-form.jsx
// components, since attendance records are a dynamic per-student array that
// doesn't map cleanly onto native form fields.
export async function submitAttendance(input) {
  const session = await auth();
  if (!session?.user || !["ADMIN", "TEACHER"].includes(session.user.role)) {
    return { error: "You must be signed in as a teacher or admin to do this." };
  }

  const parsed = attendanceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { periodId, date, records } = parsed.data;

  const period = await prisma.period.findUnique({ where: { id: periodId }, include: { teacher: true } });
  if (!period) return { error: "Period not found." };

  // A teacher can only take attendance for their own classes; admins can
  // take/override attendance for anyone (support/correction scenarios).
  if (session.user.role === "TEACHER" && period.teacher.userId !== session.user.id) {
    return { error: "You can only take attendance for your own classes." };
  }

  const attendanceSession = await prisma.attendanceSession.upsert({
    where: { periodId_date: { periodId, date: new Date(date) } },
    update: {},
    create: { periodId, teacherId: period.teacherId, date: new Date(date) },
  });

  // Upsert each record individually rather than delete-then-recreate, so
  // resubmitting the same date updates statuses in place instead of
  // duplicating rows.
  await prisma.$transaction(
    records.map((r) =>
      prisma.attendanceRecord.upsert({
        where: { sessionId_studentId: { sessionId: attendanceSession.id, studentId: r.studentId } },
        update: { status: r.status },
        create: { sessionId: attendanceSession.id, studentId: r.studentId, status: r.status },
      })
    )
  );

  revalidatePath("/teacher/attendance");
  revalidatePath("/teacher/attendance/history");
  return { success: true, sessionId: attendanceSession.id };
}
