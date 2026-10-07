"use server";

import { db } from "@/lib/db";
import { commentSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser, createNotification, writeAuditLog } from "./user";
async function analyzeCommentSentiment(commentId: string, text: string) {
  if (!process.env.SENTIMENT_SERVICE_URL) return;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${process.env.SENTIMENT_SERVICE_URL}/analyze`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }), signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (res.ok) {
      const { compound, label } = await res.json();
      await db.comment.update({ where: { id: commentId }, data: { sentimentScore: compound, sentimentLabel: label } });
    }
  } catch (error) {
    console.error("[VoTI] Sentiment analysis failed or timed out:", error);
  }
}
export async function addComment(pollId: string, text: string, parentId?: string) {
  try {
    const user = await getAuthenticatedUser();
    const parsed = commentSchema.safeParse({ text, parentId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };
    const poll = await db.poll.findUnique({ where: { id: pollId }, select: { id: true, creatorId: true, question: true } });
    if (!poll) return { success: false, error: "Poll not found." };
    if (parentId) {
      const parent = await db.comment.findUnique({ where: { id: parentId }, select: { id: true, userId: true, parentId: true } });
      if (!parent) return { success: false, error: "Parent comment not found." };
      if (parent.parentId) return { success: false, error: "Replies cannot have replies." };
    }
    if (await db.comment.count({ where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 600000) } } }) >= 10) {
      return { success: false, error: "You are commenting too quickly. Please wait a few minutes." };
    }
    const comment = await db.comment.create({ data: { pollId, userId: user.id, text: parsed.data.text, parentId: parsed.data.parentId ?? null } });
    if (poll.creatorId !== user.id) {
      await createNotification({ userId: poll.creatorId, type: parentId ? "REPLY" : "COMMENT", message: `New ${parentId ? "reply" : "comment"} on your poll: "${poll.question.substring(0, 60)}…"`, pollId });
    }
    if (parentId) {
      const parent = await db.comment.findUnique({ where: { id: parentId }, select: { userId: true } });
      if (parent && parent.userId !== user.id && parent.userId !== poll.creatorId) {
        await createNotification({ userId: parent.userId, type: "REPLY", message: `Someone replied to your comment on: "${poll.question.substring(0, 60)}…"`, pollId });
      }
    }
    analyzeCommentSentiment(comment.id, comment.text);
    revalidatePath(`/polls/${pollId}`);
    return { success: true, message: "Comment posted!", commentId: comment.id };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error && e.message || "Could not post comment." };
  }
}
export async function deleteComment(commentId: string) {
  try {
    const user = await getAuthenticatedUser();
    const comment = await db.comment.findUnique({ where: { id: commentId }, select: { id: true, userId: true, pollId: true } });
    if (!comment) return { success: false, error: "Comment not found." };
    if (comment.userId !== user.id && user.role !== "ADMIN" && user.role !== "MODERATOR") {
      return { success: false, error: "You are not allowed to delete this comment." };
    }

    await db.comment.delete({ where: { id: commentId } });
    await writeAuditLog({ userId: user.id, action: "DELETE_COMMENT", entity: "Comment", entityId: commentId });
    revalidatePath(`/polls/${comment.pollId}`);
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error && e.message || "Could not delete comment." };
  }
}
export async function toggleCommentLike(commentId: string) {
  try {
    const user = await getAuthenticatedUser();
    const where = { userId_commentId: { userId: user.id, commentId } };
    if (await db.commentLike.findUnique({ where })) {
      await db.commentLike.delete({ where });
      await db.comment.update({ where: { id: commentId }, data: { likes: { decrement: 1 } } });
      return { success: true, liked: false };
    }
    const comment = await db.comment.findUnique({ where: { id: commentId }, select: { id: true, pollId: true, userId: true } });
    if (!comment) return { success: false, error: "Comment not found." };
    await db.commentLike.create({ data: { userId: user.id, commentId } });
    await db.comment.update({ where: { id: commentId }, data: { likes: { increment: 1 } } });
    if (comment.userId !== user.id) {
      await createNotification({ userId: comment.userId, type: "LIKE", message: "Someone liked your comment!", pollId: comment.pollId });
    }

    const updatedComment = await db.comment.findUnique({ where: { id: commentId }, select: { likes: true } });
    return { success: true, liked: true, likes: updatedComment?.likes ?? 0 };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error && e.message || "Could not update like." };
  }
}
