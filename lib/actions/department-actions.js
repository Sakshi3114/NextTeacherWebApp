"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { departmentSchema, subjectSchema } from "@/lib/validations/department";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Not authorized.");
  }
}

export async function createDepartment(_prevState, formData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "You must be an admin to do this." };
  }

  const parsed = departmentSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await prisma.department.findUnique({ where: { name: parsed.data.name } });
  if (existing) return { error: "A department with that name already exists." };

  await prisma.department.create({ data: parsed.data });
  revalidatePath("/admin/departments");
  return { success: true };
}

export async function createSubject(_prevState, formData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "You must be an admin to do this." };
  }

  const parsed = subjectSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { name, code, departmentId } = parsed.data;

  await prisma.subject.create({
    data: { name, code: code || null, departmentId },
  });
  revalidatePath("/admin/subjects");
  return { success: true };
}
