"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const MAX_BYTES = 1024 * 1024; // ~1MB — stored as base64 in Postgres (User.image),
// not a dedicated blob store, so this stays deliberately small. Fine at
// demo/small-school scale; a larger deployment would want real file storage
// (Vercel Blob, S3, etc.) instead.

export async function uploadAvatar(formData) {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  const file = formData.get("avatar");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." };
  }
  if (!file.type.startsWith("image/")) {
    return { error: "Please choose an image file." };
  }
  if (file.size > MAX_BYTES) {
    return { error: "Image is too large — please choose one under 1MB." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${file.type};base64,${buffer.toString("base64")}`;

  await prisma.user.update({ where: { id: session.user.id }, data: { image: dataUrl } });

  revalidatePath("/profile");
  return { success: true, image: dataUrl };
}

export async function removeAvatar() {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  await prisma.user.update({ where: { id: session.user.id }, data: { image: null } });

  revalidatePath("/profile");
  return { success: true };
}
