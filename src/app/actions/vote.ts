"use server";

import { db } from "@/lib/db";
import { voteSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser, createNotification, writeAuditLog } from "./user";

export async function submitVote(pollId: string, optionIds: string[]) {
  try {
    const user = await getAuthenticatedUser();
    const parsed = voteSchema.safeParse({ pollId, optionIds });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    const poll = await db.poll.findUnique({
      where: { id: pollId },
      include: { options: { select: { id: true } }, votes: { where: { userId: user.id }, select: { id: true } }, creator: { select: { id: true } } },
    });

    if (!poll) return { success: false, error: "Poll not found." };
    if (poll.status === "DRAFT") return { success: false, error: "This poll is not yet published." };
    if (poll.status === "CLOSED") return { success: false, error: "This poll has closed and is no longer accepting votes." };
    if (poll.closesAt && poll.closesAt < new Date()) return { success: false, error: "This poll has expired." };
    if (poll.votes.length > 0) return { success: false, error: "You have already voted in this poll!" };
    if (!user.age || !user.address) return { success: false, error: "Please complete your profile (add age & address) before voting so we can analyze demographics!", redirectProfile: true };

    const validOptionIds = new Set(poll.options.map((o) => o.id));
    if (!parsed.data.optionIds.every(oid => validOptionIds.has(oid))) return { success: false, error: "Invalid option selected." };
    
    if (!poll.isMultipleChoice && parsed.data.optionIds.length > 1) return { success: false, error: "This poll only allows one choice." };
    if (poll.isMultipleChoice && parsed.data.optionIds.length > poll.maxChoices) return { success: false, error: `You may select at most ${poll.maxChoices} options in this poll.` };
    
    if (await db.vote.count({ where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 600000) } } }) >= 10) {
      return { success: false, error: "You are voting too quickly. Please wait a few minutes before casting another vote." };
    }

    await db.vote.createMany({ data: parsed.data.optionIds.map((optionId) => ({ userId: user.id, pollId, optionId })) });

    if (poll.creator.id !== user.id) {
      await createNotification({ userId: poll.creator.id, type: "VOTE", message: `Someone voted on your poll: "${poll.question.substring(0, 60)}…"`, pollId });
    }

    await writeAuditLog({ userId: user.id, action: "SUBMIT_VOTE", entity: "Poll", entityId: pollId });
    
    revalidatePath(`/polls/${pollId}`);
    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true, message: "Vote cast successfully! Thank you for voting. 🗳️" };
  } catch (e: any) {
    return { success: false, error: e.message || "Could not cast vote." };
  }
}
