import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    // Ideally, secure this endpoint with a CRON_SECRET token
    // const authHeader = req.headers.get("authorization");
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //   return new NextResponse("Unauthorized", { status: 401 });
    // }

    const now = new Date();

    const result = await db.poll.updateMany({
      where: {
        status: "DRAFT",
        scheduledAt: { lte: now },
      },
      data: {
        status: "PUBLISHED",
        scheduledAt: null, // Clear it out once published
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully published ${result.count} scheduled polls.`,
    });
  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ success: false, error: "Cron execution failed" }, { status: 500 });
  }
}
