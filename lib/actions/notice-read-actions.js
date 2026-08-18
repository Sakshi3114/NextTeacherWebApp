"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Idempotent — a student viewing the same notice twice shouldn't error or
// create a duplicate row (unique([noticeId, studentId]) backs this).
export async function markNoticeRead(noticeId) {
  const session = await auth();
  if (!session?.user || session.user.role !== "STUDENT") {
    return { error: "Not authorized." };
  }

  const student = await prisma.student.findUnique({ where: { userId: session.user.id } });
  if (!student) return { error: "No student profile found." };

  await prisma.noticeRead.upsert({
    where: { noticeId_studentId: { noticeId, studentId: student.id } },
    update: {},
    create: { noticeId, studentId: student.id },
  });

  return { success: true };
}
