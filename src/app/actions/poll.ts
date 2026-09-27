"use server";

import { db } from "@/lib/db";
import { pollSchema, pollUpdateSchema, VALID_CATEGORIES } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser, writeAuditLog } from "./user";

export async function createPoll(_prevState: unknown, data: any) {
  try {
    const user = await getAuthenticatedUser();
    const parsed = pollSchema.safeParse({ ...data, category: data.category, status: data.status ?? "PUBLISHED" });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const d = parsed.data;
    if (await db.poll.count({ where: { creatorId: user.id, createdAt: { gte: new Date(Date.now() - 600000) } } }) >= 5) {
      return { success: false, error: "Too many polls created recently. Please wait a few minutes and try again." };
    }

    const parsedScheduledAt = d.scheduledAt ? new Date(d.scheduledAt) : null;
    const newPoll = await db.poll.create({
      data: {
        question: d.question,
        description: d.description?.trim() || null,
        category: d.category,
        status: parsedScheduledAt && parsedScheduledAt > new Date() ? "DRAFT" : d.status,
        closesAt: d.closesAt ? new Date(d.closesAt) : null,
        scheduledAt: parsedScheduledAt,
        isMultipleChoice: d.isMultipleChoice,
        maxChoices: d.isMultipleChoice ? (d.maxChoices ?? 2) : 1,
        imageUrl: d.imageUrl || null,
        creatorId: user.id,
        options: { create: d.options.map((text) => ({ text: text.trim() })) },
      },
    });

    if (d.tags?.length) {
      const tags = await Promise.all(d.tags.map(name => db.tag.upsert({ where: { name }, create: { name }, update: {} })));
      await db.pollTag.createMany({ data: tags.map(t => ({ pollId: newPoll.id, tagId: t.id })) });
    }

    await writeAuditLog({ userId: user.id, action: "CREATE_POLL", entity: "Poll", entityId: newPoll.id });
    revalidatePath("/");
    return { success: true, pollId: newPoll.id };
  } catch (e: any) {
    return { success: false, error: e.message || "Could not create poll." };
  }
}

export async function updatePoll(pollId: string, data: Record<string, unknown>) {
  try {
    const user = await getAuthenticatedUser();
    const poll = await db.poll.findUnique({ where: { id: pollId }, include: { _count: { select: { votes: true } } } });
    
    if (!poll) return { success: false, error: "Poll not found." };
    if (poll.creatorId !== user.id) return { success: false, error: "You are not allowed to edit this poll." };
    if (poll._count.votes > 0) return { success: false, error: "Cannot edit a poll that already has votes. This protects data integrity." };

    const parsed = pollUpdateSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const d = parsed.data;
    await db.poll.update({
      where: { id: pollId },
      data: {
        ...(d.question !== undefined && { question: d.question }),
        ...(d.description !== undefined && { description: d.description || null }),
        ...(d.closesAt !== undefined && { closesAt: d.closesAt ? new Date(d.closesAt) : null }),
        ...(d.imageUrl !== undefined && { imageUrl: d.imageUrl || null }),
      },
    });

    await writeAuditLog({ userId: user.id, action: "UPDATE_POLL", entity: "Poll", entityId: pollId });
    revalidatePath(`/polls/${pollId}`);
    revalidatePath("/");
    return { success: true, message: "Poll updated successfully!" };
  } catch (e: any) {
    return { success: false, error: e.message || "Could not update poll." };
  }
}

export async function publishPoll(pollId: string) {
  try {
    const user = await getAuthenticatedUser();
    const poll = await db.poll.findUnique({ where: { id: pollId } });
    
    if (!poll) return { success: false, error: "Poll not found." };
    if (poll.creatorId !== user.id) return { success: false, error: "Only the creator can publish this poll." };
    if (poll.status === "PUBLISHED") return { success: false, error: "Poll is already published." };

    await db.poll.update({ where: { id: pollId }, data: { status: "PUBLISHED", scheduledAt: null } });
    await writeAuditLog({ userId: user.id, action: "PUBLISH_POLL", entity: "Poll", entityId: pollId });
    
    revalidatePath(`/polls/${pollId}`);
    revalidatePath("/");
    return { success: true, message: "Poll published! 🚀" };
  } catch (e: any) {
    return { success: false, error: e.message || "Could not publish poll." };
  }
}

export async function closePoll(pollId: string) {
  try {
    const user = await getAuthenticatedUser();
    const poll = await db.poll.findUnique({ where: { id: pollId } });
    
    if (!poll) return { success: false, error: "Poll not found." };
    if (poll.creatorId !== user.id) return { success: false, error: "Only the creator can close this poll." };
    if (poll.status === "CLOSED") return { success: false, error: "Poll is already closed." };

    await db.poll.update({ where: { id: pollId }, data: { status: "CLOSED" } });
    await writeAuditLog({ userId: user.id, action: "CLOSE_POLL", entity: "Poll", entityId: pollId });
    
    revalidatePath(`/polls/${pollId}`);
    revalidatePath("/");
    return { success: true, message: "Poll closed." };
  } catch (e: any) {
    return { success: false, error: e.message || "Could not close poll." };
  }
}

export async function duplicatePoll(pollId: string) {
  try {
    const user = await getAuthenticatedUser();
    const original = await db.poll.findUnique({ where: { id: pollId }, include: { options: true, tags: true } });
    
    if (!original) return { success: false, error: "Poll not found." };

    const copy = await db.poll.create({
      data: {
        question: `${original.question} (copy)`,
        description: original.description,
        category: original.category,
        status: "DRAFT",
        isMultipleChoice: original.isMultipleChoice,
        maxChoices: original.maxChoices,
        imageUrl: original.imageUrl,
        creatorId: user.id,
        options: { create: original.options.map((o) => ({ text: o.text })) },
      },
    });

    if (original.tags.length > 0) {
      await db.pollTag.createMany({ data: original.tags.map((pt) => ({ pollId: copy.id, tagId: pt.tagId })) });
    }

    await writeAuditLog({ userId: user.id, action: "DUPLICATE_POLL", entity: "Poll", entityId: copy.id, metadata: { sourceId: pollId } });
    revalidatePath("/dashboard");
    return { success: true, pollId: copy.id, message: "Poll duplicated as draft! ✂️" };
  } catch (e: any) {
    return { success: false, error: e.message || "Could not duplicate poll." };
  }
}

export async function deletePoll(pollId: string) {
  try {
    const user = await getAuthenticatedUser();
    const poll = await db.poll.findUnique({ where: { id: pollId } });
    
    if (!poll) return { success: false, error: "Poll not found." };
    if (poll.creatorId !== user.id && user.role !== "ADMIN" && user.role !== "MODERATOR") {
      return { success: false, error: "You are not allowed to delete this poll." };
    }

    await db.poll.update({ where: { id: pollId }, data: { deletedAt: new Date() } });
    await writeAuditLog({ userId: user.id, action: "SOFT_DELETE_POLL", entity: "Poll", entityId: pollId });
    
    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message || "Could not delete poll." };
  }
}

export async function toggleBookmark(pollId: string) {
  try {
    const user = await getAuthenticatedUser();
    const existing = await db.bookmark.findUnique({ where: { userId_pollId: { userId: user.id, pollId } } });

    if (existing) {
      await db.bookmark.delete({ where: { userId_pollId: { userId: user.id, pollId } } });
      revalidatePath(`/polls/${pollId}`);
      revalidatePath("/bookmarks");
      return { success: true, bookmarked: false, message: "Bookmark removed." };
    }

    await db.bookmark.create({ data: { userId: user.id, pollId } });
    revalidatePath(`/polls/${pollId}`);
    revalidatePath("/bookmarks");
    return { success: true, bookmarked: true, message: "Poll bookmarked! 🔖" };
  } catch (e: any) {
    return { success: false, error: e.message || "Could not update bookmark." };
  }
}
