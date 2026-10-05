"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { periodSchema } from "@/lib/validations/period";
import { overlaps } from "@/lib/schedule";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Not authorized.");
  }
}

async function findConflict({ day, startTime, endTime, teacherId, room }, excludePeriodId) {
  const sameDay = await prisma.period.findMany({
    where: { day, id: excludePeriodId ? { not: excludePeriodId } : undefined },
    include: { teacher: { include: { user: true } }, subject: true },
  });

  for (const existing of sameDay) {
    if (!overlaps(startTime, endTime, existing.startTime, existing.endTime)) continue;

    if (existing.teacherId === teacherId) {
      return `${existing.teacher.user.name} already has a class ${existing.startTime}–${existing.endTime} on ${day.charAt(0)}${day.slice(1).toLowerCase()}.`;
    }
    if (room && existing.room && existing.room === room) {
      return `Room ${room} is already booked ${existing.startTime}–${existing.endTime} on ${day.charAt(0)}${day.slice(1).toLowerCase()} (${existing.subject.name}).`;
    }
  }
  return null;
}

export async function createPeriod(_prevState, formData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "You must be an admin to do this." };
  }

  const parsed = periodSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

  const conflict = await findConflict(data);
  if (conflict) return { error: conflict };

  await prisma.period.create({
    data: {
      day: data.day,
      startTime: data.startTime,
      endTime: data.endTime,
      room: data.room || null,
      teacherId: data.teacherId,
      subjectId: data.subjectId,
    },
  });

  revalidatePath("/admin/timetable");
  revalidatePath("/teacher");
  revalidatePath("/teachers");
  return { success: true };
}

export async function updatePeriod(periodId, _prevState, formData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "You must be an admin to do this." };
  }

  const parsed = periodSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const data = parsed.data;

  const conflict = await findConflict(data, periodId);
  if (conflict) return { error: conflict };

  await prisma.period.update({
    where: { id: periodId },
    data: {
      day: data.day,
      startTime: data.startTime,
      endTime: data.endTime,
      room: data.room || null,
      teacherId: data.teacherId,
      subjectId: data.subjectId,
    },
  });

  revalidatePath("/admin/timetable");
  revalidatePath("/teacher");
  revalidatePath("/teachers");
  return { success: true };
}

export async function deletePeriod(periodId) {
  try {
    await requireAdmin();
  } catch {
    return { error: "You must be an admin to do this." };
  }

  await prisma.period.delete({ where: { id: periodId } });

  revalidatePath("/admin/timetable");
  revalidatePath("/teacher");
  revalidatePath("/teachers");
  return { success: true };
}
