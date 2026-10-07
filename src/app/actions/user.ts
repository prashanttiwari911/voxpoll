"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { profileSchema, auditLogSchema, notificationSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("You must be logged in to perform this action.");
  const user = await db.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("User account not found.");
  return user;
}

export async function writeAuditLog(input: { userId?: string; action: string; entity: string; entityId?: string; metadata?: Record<string, unknown>; ipAddress?: string; }) {
  try {
    const parsed = auditLogSchema.safeParse(input);
    if (parsed.success) await db.auditLog.create({ data: {
      userId: parsed.data.userId ?? null, action: parsed.data.action, entity: parsed.data.entity,
      entityId: parsed.data.entityId ?? null, metadata: parsed.data.metadata ? JSON.stringify(parsed.data.metadata) : null,
      ipAddress: parsed.data.ipAddress ?? null,
    } });
  } catch {}
}
export async function createNotification(input: { userId: string; type: "VOTE" | "COMMENT" | "REPLY" | "LIKE" | "SYSTEM"; message: string; pollId?: string; }) {
  try {
    const parsed = notificationSchema.safeParse(input);
    if (parsed.success) await db.notification.create({ data: {
      userId: parsed.data.userId, type: parsed.data.type, message: parsed.data.message, pollId: parsed.data.pollId ?? null,
    } });
  } catch {}
}
export async function updateProfile(_prevState: unknown, formData: FormData) {
  try {
    const user = await getAuthenticatedUser();
    const raw = {
      name: (formData.get("name") as string)?.trim() || undefined, age: formData.get("age") ? Number(formData.get("age")) : null,
      address: (formData.get("address") as string)?.trim() || null, gender: (formData.get("gender") as string)?.trim() || null,
      occupation: (formData.get("occupation") as string)?.trim() || null,
    };
    const parsed = profileSchema.safeParse(raw);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    await db.user.update({ where: { id: user.id }, data: {
      name: parsed.data.name || user.name || undefined, age: parsed.data.age ?? null,
      address: parsed.data.address ?? null, gender: parsed.data.gender ?? null, occupation: parsed.data.occupation ?? null,
    } });
    await writeAuditLog({ userId: user.id, action: "UPDATE_PROFILE", entity: "User", entityId: user.id });
    revalidatePath("/profile");
    revalidatePath("/");
    return { success: true, message: "Profile updated successfully! dYZ%" };
  } catch (e: any) {
    return { success: false, error: e.message || "An unexpected error occurred." };
  }
}
export async function markNotificationsRead(notificationIds: string[]) {
  try {
    const user = await getAuthenticatedUser();
    await db.notification.updateMany({ where: { id: { in: notificationIds }, userId: user.id }, data: { isRead: true } });
    revalidatePath("/notifications");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Could not update notifications." };
  }
}
