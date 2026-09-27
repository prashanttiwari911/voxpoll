import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const now = new Date();
    const [publishResult, closeResult] = await Promise.all([
      db.poll.updateMany({
        where: { status: "DRAFT", scheduledAt: { lte: now } },
        data: { status: "PUBLISHED", scheduledAt: null },
      }),
      db.poll.updateMany({
        where: { status: "PUBLISHED", closesAt: { lte: now } },
        data: { status: "CLOSED" },
      })
    ]);

    return NextResponse.json({
      success: true,
      message: `Successfully published ${publishResult.count} scheduled polls and closed ${closeResult.count} expired polls.`,
    });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ success: false, error: "Cron execution failed" }, { status: 500 });
  }
}
