"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { noticeSchema } from "@/lib/validations/notice";

export async function createNotice(_prevState, formData) {
  const session = await auth();
  if (!session?.user || !["TEACHER", "ADMIN"].includes(session.user.role)) {
    return { error: "You must be signed in as a teacher or admin to post a notice." };
  }

  const parsed = noticeSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }
  const { title, body, expiresInDays } = parsed.data;

  // Identity now comes from the server session, not a URL query string the
  // old app trusted blindly (?_id=... let anyone post as any teacher).
  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.notice.create({
    data: { title, body, expiresAt, authorId: session.user.id },
  });

  revalidatePath("/notices");
  revalidatePath("/teacher/notices");
  return { success: true };
}

export async function deleteNotice(noticeId) {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  const notice = await prisma.notice.findUnique({ where: { id: noticeId } });
  if (!notice) return { error: "Notice not found." };

  // Authors can remove their own notices; admins can remove any.
  if (notice.authorId !== session.user.id && session.user.role !== "ADMIN") {
    return { error: "You can only delete your own notices." };
  }

  await prisma.notice.delete({ where: { id: noticeId } });
  revalidatePath("/notices");
  revalidatePath("/teacher/notices");
  return { success: true };
}
