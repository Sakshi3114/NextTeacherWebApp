"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Not authorized.");
  }
}

export async function enrollStudent(studentId, subjectId) {
  try {
    await requireAdmin();
  } catch {
    return { error: "You must be an admin to do this." };
  }

  await prisma.enrollment.upsert({
    where: { studentId_subjectId: { studentId, subjectId } },
    update: {},
    create: { studentId, subjectId },
  });

  revalidatePath("/admin/subjects");
  return { success: true };
}

export async function unenrollStudent(studentId, subjectId) {
  try {
    await requireAdmin();
  } catch {
    return { error: "You must be an admin to do this." };
  }

  await prisma.enrollment.deleteMany({ where: { studentId, subjectId } });

  revalidatePath("/admin/subjects");
  return { success: true };
}
