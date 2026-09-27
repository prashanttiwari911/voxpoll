"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser, writeAuditLog } from "@/app/actions/user";

export async function adminSetUserRole(targetUserId: string, newRole: string) {
  try {
    const actor = await getAuthenticatedUser();
    if (actor.role !== "ADMIN") return { success: false, error: "Only admins can change roles." };
    if (actor.id === targetUserId) return { success: false, error: "You cannot change your own role." };
    if (!["USER", "ADMIN", "MODERATOR"].includes(newRole)) return { success: false, error: "Invalid role." };

    await db.user.update({ where: { id: targetUserId }, data: { role: newRole } });
    await writeAuditLog({ userId: actor.id, action: "ADMIN_SET_ROLE", entity: "User", entityId: targetUserId, metadata: { newRole } });

    revalidatePath("/admin");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to update role." };
  }
}

export async function adminDeletePoll(pollId: string) {
  try {
    const actor = await getAuthenticatedUser();
    if (actor.role !== "ADMIN" && actor.role !== "MODERATOR") return { success: false, error: "Admin access required." };

    await db.poll.update({ where: { id: pollId }, data: { deletedAt: new Date() } });
    await writeAuditLog({ userId: actor.id, action: "ADMIN_SOFT_DELETE_POLL", entity: "Poll", entityId: pollId });

    revalidatePath("/admin");
    revalidatePath("/");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Failed to delete poll." };
  }
}
