"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { leaveRequestSchema } from "@/lib/validations/leave";

export async function requestLeave(_prevState, formData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TEACHER") {
    return { error: "Only teachers can request leave." };
  }

  const parsed = leaveRequestSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { startDate, endDate, reason, substituteId } = parsed.data;

  const teacher = await prisma.teacher.findUnique({ where: { userId: session.user.id } });
  if (!teacher) return { error: "No teacher profile found." };

  const leaveRequest = await prisma.leaveRequest.create({
    data: {
      teacherId: teacher.id,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      substituteId: substituteId || null,
    },
  });

  const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });
  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: "LEAVE_REQUESTED",
        message: `${session.user.name} requested leave (${startDate} to ${endDate}).`,
        link: "/admin/leave",
      })),
    });
  }

  revalidatePath("/teacher/leave");
  revalidatePath("/admin/leave");
  return { success: true, leaveRequestId: leaveRequest.id };
}

export async function decideLeave(leaveRequestId, decision) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { error: "You must be an admin to do this." };
  }
  if (!["APPROVED", "REJECTED"].includes(decision)) {
    return { error: "Invalid decision." };
  }

  const leaveRequest = await prisma.leaveRequest.update({
    where: { id: leaveRequestId },
    data: { status: decision, decidedById: session.user.id, decidedAt: new Date() },
    include: { teacher: { include: { user: true } } },
  });

  await prisma.notification.create({
    data: {
      userId: leaveRequest.teacher.userId,
      type: decision === "APPROVED" ? "LEAVE_APPROVED" : "LEAVE_REJECTED",
      message: `Your leave request (${leaveRequest.startDate.toISOString().slice(0, 10)} to ${leaveRequest.endDate.toISOString().slice(0, 10)}) was ${decision.toLowerCase()}.`,
      link: "/teacher/leave",
    },
  });

  revalidatePath("/admin/leave");
  revalidatePath("/teacher/leave");
  return { success: true };
}
