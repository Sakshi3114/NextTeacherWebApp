"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { overlaps } from "@/lib/schedule";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return null;
  }
  return session;
}

// A candidate teacher is free for `period` on `date` if they don't already
// have a clashing class of their own, aren't on approved leave that date,
// and aren't already covering a different class at the same clashing time.
// Shared by getSubstituteCandidates (what the admin sees) and
// assignSubstitute (re-checked server-side before writing — never trust
// the client's snapshot of who was free).
async function getFreeTeacherIds(period, date, candidateTeacherIds) {
  if (candidateTeacherIds.length === 0) return new Set();

  const [ownPeriods, approvedLeave, sameDaySubstitutions] = await Promise.all([
    prisma.period.findMany({
      where: { teacherId: { in: candidateTeacherIds }, day: period.day },
      select: { teacherId: true, startTime: true, endTime: true },
    }),
    prisma.leaveRequest.findMany({
      where: {
        teacherId: { in: candidateTeacherIds },
        status: "APPROVED",
        startDate: { lte: date },
        endDate: { gte: date },
      },
      select: { teacherId: true },
    }),
    prisma.substitution.findMany({
      where: { substituteId: { in: candidateTeacherIds }, date },
      select: { substituteId: true, period: { select: { startTime: true, endTime: true } } },
    }),
  ]);

  const busy = new Set(approvedLeave.map((r) => r.teacherId));
  for (const p of ownPeriods) {
    if (overlaps(period.startTime, period.endTime, p.startTime, p.endTime)) busy.add(p.teacherId);
  }
  for (const s of sameDaySubstitutions) {
    if (overlaps(period.startTime, period.endTime, s.period.startTime, s.period.endTime)) busy.add(s.substituteId);
  }

  return new Set(candidateTeacherIds.filter((id) => !busy.has(id)));
}

async function loadPeriodAndCandidates(periodId) {
  const period = await prisma.period.findUnique({ where: { id: periodId }, include: { subject: true } });
  if (!period) return { error: "Class not found." };

  // Candidate pool: teachers who teach this subject somewhere, other than
  // the teacher whose class this is.
  const subjectTeachers = await prisma.period.findMany({
    where: { subjectId: period.subjectId, teacherId: { not: period.teacherId } },
    distinct: ["teacherId"],
    select: { teacher: { include: { user: true } } },
  });

  return { period, candidates: subjectTeachers.map((p) => p.teacher) };
}

export async function getSubstituteCandidates(periodId, dateStr) {
  const session = await requireAdmin();
  if (!session) return { error: "You must be an admin to do this." };

  const { period, candidates, error } = await loadPeriodAndCandidates(periodId);
  if (error) return { error };

  const date = new Date(dateStr);
  const freeIds = await getFreeTeacherIds(period, date, candidates.map((t) => t.id));
  const free = candidates
    .filter((t) => freeIds.has(t.id))
    .map((t) => ({ id: t.id, name: t.user.name }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return { candidates: free };
}

export async function assignSubstitute({ periodId, date: dateStr, substituteId, leaveRequestId }) {
  const session = await requireAdmin();
  if (!session) return { error: "You must be an admin to do this." };

  const { period, candidates, error } = await loadPeriodAndCandidates(periodId);
  if (error) return { error };

  const date = new Date(dateStr);
  const freeIds = await getFreeTeacherIds(period, date, candidates.map((t) => t.id));
  if (!freeIds.has(substituteId)) {
    return { error: "That teacher is no longer free for this class — pick another." };
  }

  const [substitute, originalTeacher] = await Promise.all([
    prisma.teacher.findUnique({ where: { id: substituteId }, include: { user: true } }),
    prisma.teacher.findUnique({ where: { id: period.teacherId }, include: { user: true } }),
  ]);

  await prisma.substitution.upsert({
    where: { periodId_date: { periodId, date } },
    create: {
      periodId,
      date,
      originalTeacherId: period.teacherId,
      substituteId,
      leaveRequestId: leaveRequestId || null,
      assignedById: session.user.id,
    },
    update: { substituteId, leaveRequestId: leaveRequestId || null, assignedById: session.user.id },
  });

  await prisma.notification.create({
    data: {
      userId: substitute.userId,
      type: "SUBSTITUTE_ASSIGNED",
      message: `You're covering ${period.subject.name} for ${originalTeacher.user.name} on ${formatDate(date)} (${period.startTime}–${period.endTime}).`,
      link: "/teacher",
    },
  });

  revalidatePath("/admin/calendar");
  revalidatePath("/admin/leave");
  revalidatePath("/teacher");
  return { success: true };
}

export async function removeSubstitute(substitutionId) {
  const session = await requireAdmin();
  if (!session) return { error: "You must be an admin to do this." };

  const substitution = await prisma.substitution.findUnique({
    where: { id: substitutionId },
    include: { period: { include: { subject: true } }, substitute: { include: { user: true } } },
  });
  if (!substitution) return { error: "Assignment not found." };

  await prisma.substitution.delete({ where: { id: substitutionId } });

  await prisma.notification.create({
    data: {
      userId: substitution.substitute.userId,
      type: "SUBSTITUTE_CANCELLED",
      message: `You're no longer covering ${substitution.period.subject.name} on ${formatDate(substitution.date)}.`,
      link: "/teacher",
    },
  });

  revalidatePath("/admin/calendar");
  revalidatePath("/admin/leave");
  revalidatePath("/teacher");
  return { success: true };
}
