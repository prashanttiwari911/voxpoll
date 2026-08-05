"use server";

import { db } from "@/lib/db";
import { voteSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { getAuthenticatedUser, createNotification, writeAuditLog } from "./user";

// ---------------------------------------------------------------------------
// Action: Submit Vote (single OR multi-choice)
// ---------------------------------------------------------------------------
export async function submitVote(pollId: string, optionIds: string[]) {
  try {
    const user = await getAuthenticatedUser();

    const parsed = voteSchema.safeParse({ pollId, optionIds });
    if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

    // 1. Verify poll exists and is open
    const poll = await db.poll.findUnique({
      where: { id: pollId },
      include: {
        options: { select: { id: true } },
        votes: { where: { userId: user.id }, select: { id: true } },
        creator: { select: { id: true } },
      },
    });

    if (!poll) return { success: false, error: "Poll not found." };
    if (poll.status === "DRAFT") return { success: false, error: "This poll is not yet published." };
    if (poll.status === "CLOSED") return { success: false, error: "This poll has closed and is no longer accepting votes." };
    if (poll.closesAt && poll.closesAt < new Date()) return { success: false, error: "This poll has expired." };

    // 2. Already voted?
    if (poll.votes.length > 0) return { success: false, error: "You have already voted in this poll!" };

    // 3. Profile completeness
    if (!user.age || !user.address) {
      return {
        success: false,
        error: "Please complete your profile (add age & address) before voting so we can analyze demographics!",
        redirectProfile: true,
      };
    }

    // 4. Validate selected options belong to this poll
    const validOptionIds = new Set(poll.options.map((o) => o.id));
    for (const oid of parsed.data.optionIds) {
      if (!validOptionIds.has(oid)) return { success: false, error: "Invalid option selected." };
    }

    // 5. Multi-choice cap
    if (!poll.isMultipleChoice && parsed.data.optionIds.length > 1) {
      return { success: false, error: "This poll only allows one choice." };
    }
    if (poll.isMultipleChoice && parsed.data.optionIds.length > poll.maxChoices) {
      return { success: false, error: `You may select at most ${poll.maxChoices} options in this poll.` };
    }

    // 6. Rate limit: max 10 votes per 10 min
    const recentVotes = await db.vote.count({
      where: { userId: user.id, createdAt: { gte: new Date(Date.now() - 10 * 60 * 1000) } },
    });
    if (recentVotes >= 10) {
      return { success: false, error: "You are voting too quickly. Please wait a few minutes before casting another vote." };
    }

    // 7. Create vote records (one per selected option)
    await db.vote.createMany({
      data: parsed.data.optionIds.map((optionId) => ({ userId: user.id, pollId, optionId })),
    });

    // 8. Notify poll creator
    if (poll.creator.id !== user.id) {
      await createNotification({
        userId: poll.creator.id,
        type: "VOTE",
        message: `Someone voted on your poll: "${poll.question.substring(0, 60)}…"`,
        pollId,
      });
    }

    await writeAuditLog({ userId: user.id, action: "SUBMIT_VOTE", entity: "Poll", entityId: pollId });

    revalidatePath(`/polls/${pollId}`);
    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true, message: "Vote cast successfully! Thank you for voting. 🗳️" };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : "Could not cast vote." };
  }
}
