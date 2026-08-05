"use server";

import { db } from "@/lib/db";
import { commentSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser, createNotification, writeAuditLog } from "./user";

// ---------------------------------------------------------------------------
// Internal: Call Sentiment Microservice
// ---------------------------------------------------------------------------
async function analyzeCommentSentiment(commentId: string, text: string) {
  const url = process.env.SENTIMENT_SERVICE_URL;
  if (!url) return;

  try {
    // 2-second timeout to avoid hanging the request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${url}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      await db.comment.update({
        where: { id: commentId },
        data: {
          sentimentScore: data.compound,
          sentimentLabel: data.label,
        },
      });
    }
  } catch (error) {
    console.error("[VoTI] Sentiment analysis failed or timed out:", error);
  }
}

// ---------------------------------------------------------------------------
// Action: Add Comment (top-level or reply)
// ---------------------------------------------------------------------------
export async function addComment(pollId: string, text: string, parentId?: string) {
  try {
    const user = await getAuthenticatedUser();

    const parsed = commentSchema.safeParse({ text, parentId });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const poll = await db.poll.findUnique({
      where: { id: pollId },
      select: { id: true, creatorId: true, question: true },
    });
    if (!poll) return { success: false, error: "Poll not found." };

    // Validate parent exists if this is a reply
    if (parentId) {
      const parent = await db.comment.findUnique({ where: { id: parentId }, select: { id: true, userId: true } });
      if (!parent) return { success: false, error: "Parent comment not found." };
    }

    // Rate limit: max 10 comments per 10 min
    const recentComments = await db.comment.count({
      where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } },
    });
    if (recentComments >= 10) {
      return { success: false, error: "You are commenting too quickly. Please wait a few minutes." };
    }

    const comment = await db.comment.create({
      data: {
        pollId,
        userId: user.id,
        text: parsed.data.text,
        parentId: parsed.data.parentId ?? null,
      },
    });

    // Notify poll creator (if different from commenter)
    if (poll.creatorId !== user.id) {
      await createNotification({
        userId: poll.creatorId,
        type: parentId ? "REPLY" : "COMMENT",
        message: `New ${parentId ? "reply" : "comment"} on your poll: "${poll.question.substring(0, 60)}…"`,
        pollId,
      });
    }

    // If this is a reply, also notify the parent comment author
    if (parentId) {
      const parent = await db.comment.findUnique({ where: { id: parentId }, select: { userId: true } });
      if (parent && parent.userId !== user.id && parent.userId !== poll.creatorId) {
        await createNotification({
          userId: parent.userId,
          type: "REPLY",
          message: `Someone replied to your comment on: "${poll.question.substring(0, 60)}…"`,
          pollId,
        });
      }
    }

    // Fire sentiment analysis in the background
    // We don't await this to keep the UI snappy, it will update the DB shortly after
    analyzeCommentSentiment(comment.id, comment.text);

    revalidatePath(`/polls/${pollId}`);
    return { success: true, message: "Comment posted!", commentId: comment.id };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Could not post comment." };
  }
}

// ---------------------------------------------------------------------------
// Action: Delete Comment (owner or admin/moderator)
// ---------------------------------------------------------------------------
export async function deleteComment(commentId: string) {
  try {
    const user = await getAuthenticatedUser();

    const comment = await db.comment.findUnique({
      where: { id: commentId },
      select: { id: true, userId: true, pollId: true },
    });
    if (!comment) return { success: false, error: "Comment not found." };

    const isAdmin = user.role === "ADMIN" || user.role === "MODERATOR";
    if (comment.userId !== user.id && !isAdmin) {
      return { success: false, error: "You are not allowed to delete this comment." };
    }

    await db.comment.delete({ where: { id: commentId } });
    await writeAuditLog({ userId: user.id, action: "DELETE_COMMENT", entity: "Comment", entityId: commentId });

    revalidatePath(`/polls/${comment.pollId}`);
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Could not delete comment." };
  }
}

// ---------------------------------------------------------------------------
// Action: Like / Unlike Comment (toggle)
// ---------------------------------------------------------------------------
export async function toggleCommentLike(commentId: string) {
  try {
    const user = await getAuthenticatedUser();

    const existing = await db.commentLike.findUnique({
      where: { userId_commentId: { userId: user.id, commentId } },
    });

    if (existing) {
      // Unlike
      await db.commentLike.delete({ where: { userId_commentId: { userId: user.id, commentId } } });
      await db.comment.update({ where: { id: commentId }, data: { likes: { decrement: 1 } } });
      return { success: true, liked: false };
    }

    // Like
    const comment = await db.comment.findUnique({
      where: { id: commentId },
      select: { id: true, pollId: true, userId: true },
    });
    if (!comment) return { success: false, error: "Comment not found." };

    await db.commentLike.create({ data: { userId: user.id, commentId } });
    await db.comment.update({ where: { id: commentId }, data: { likes: { increment: 1 } } });

    // Notify comment author
    if (comment.userId !== user.id) {
      await createNotification({
        userId: comment.userId,
        type: "LIKE",
        message: "Someone liked your comment!",
        pollId: comment.pollId,
      });
    }

    const updatedComment = await db.comment.findUnique({ where: { id: commentId }, select: { likes: true } });
    return { success: true, liked: true, likes: updatedComment?.likes ?? 0 };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Could not update like." };
  }
}
