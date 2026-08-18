"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function markNotificationRead(notificationId) {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  // updateMany (not update) so a user can only ever affect their own
  // notification — scoping by userId in the where clause makes this safe
  // even if someone passes another user's notification id.
  await prisma.notification.updateMany({
    where: { id: notificationId, userId: session.user.id },
    data: { read: true },
  });

  return { success: true };
}

export async function markAllNotificationsRead() {
  const session = await auth();
  if (!session?.user) return { error: "Not authorized." };

  await prisma.notification.updateMany({
    where: { userId: session.user.id, read: false },
    data: { read: true },
  });

  return { success: true };
}
