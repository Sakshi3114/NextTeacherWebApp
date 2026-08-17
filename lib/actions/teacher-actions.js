"use server";

import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createTeacherSchema, updateTeacherSchema } from "@/lib/validations/teacher";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    // Every mutation re-checks the role server-side — this is what closes
    // the old app's "any mutating route was publicly callable" gap.
    throw new Error("Not authorized.");
  }
  return session;
}

export async function createTeacher(_prevState, formData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "You must be an admin to do this." };
  }

  const parsed = createTeacherSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { name, email, phone, departmentId, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "A user with that email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "TEACHER",
      teacher: {
        create: {
          phone: phone || null,
          departmentId,
        },
      },
    },
  });

  revalidatePath("/admin/teachers");
  revalidatePath("/teachers");
  redirect("/admin/teachers");
}

export async function updateTeacher(teacherId, _prevState, formData) {
  try {
    await requireAdmin();
  } catch {
    return { error: "You must be an admin to do this." };
  }

  const parsed = updateTeacherSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { name, email, phone, departmentId } = parsed.data;

  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
  if (!teacher) return { error: "Teacher not found." };

  const emailOwner = await prisma.user.findUnique({ where: { email } });
  if (emailOwner && emailOwner.id !== teacher.userId) {
    return { error: "Another user already uses that email." };
  }

  await prisma.$transaction([
    prisma.user.update({ where: { id: teacher.userId }, data: { name, email } }),
    prisma.teacher.update({ where: { id: teacherId }, data: { phone: phone || null, departmentId } }),
  ]);

  revalidatePath("/admin/teachers");
  revalidatePath(`/teachers/${teacherId}`);
  redirect("/admin/teachers");
}

export async function deleteTeacher(teacherId) {
  await requireAdmin();

  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
  if (!teacher) return { error: "Teacher not found." };

  // Deleting the User cascades to Teacher, and Teacher -> Period, so this
  // removes the account, profile, and timetable in one consistent operation.
  await prisma.user.delete({ where: { id: teacher.userId } });

  revalidatePath("/admin/teachers");
  revalidatePath("/teachers");
  return { success: true };
}
