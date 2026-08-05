import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Auth check
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const currentUser = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });
  if (!currentUser) return new NextResponse("Unauthorized", { status: 401 });

  const isAdmin = currentUser.role === "ADMIN" || currentUser.role === "MODERATOR";

  // Fetch poll and verify creator (or admin override)
  const poll = await db.poll.findUnique({
    where: { id },
    include: {
      creator: { select: { email: true, name: true } },
      options: { select: { id: true, text: true } },
    },
  });

  if (!poll) return new NextResponse("Poll not found", { status: 404 });

  if (poll.creator.email !== session.user.email && !isAdmin) {
    return new NextResponse("Forbidden — only the poll creator or an admin can export results.", {
      status: 403,
    });
  }

  // Fetch all votes with full user + option details
  const votes = await db.vote.findMany({
    where: { pollId: id },
    include: {
      user: { select: { name: true, age: true, address: true } },
      option: { select: { text: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  // CSV escape helper
  const esc = (v: string | number | null | undefined): string => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  // ── Summary block ──
  const totalVoters = new Set(votes.map((v) => v.userId)).size;
  const optionSummary = poll.options.map((opt) => {
    const count = votes.filter((v) => v.optionId === opt.id).length;
    const pct = totalVoters > 0 ? ((count / totalVoters) * 100).toFixed(1) : "0.0";
    return `${esc(opt.text)}: ${count} votes (${pct}%)`;
  });

  const summaryLines = [
    `# VoTI Poll Export`,
    `# Question: ${esc(poll.question)}`,
    `# Category: ${esc(poll.category)}`,
    `# Status: ${esc(poll.status)}`,
    `# Created: ${esc(poll.createdAt.toISOString())}`,
    `# Closes: ${poll.closesAt ? esc(poll.closesAt.toISOString()) : "Never"}`,
    `# Total Votes: ${totalVoters}`,
    ...optionSummary.map((s) => `# ${s}`),
    `# Exported: ${esc(new Date().toISOString())}`,
    `#`,
  ];

  // ── Per-vote rows ──
  const header = "VoterName,Age,Region,Choice,VotedAt";
  const rows = votes.map((v) =>
    [
      esc(v.user.name),
      esc(v.user.age),
      esc(v.user.address),
      esc(v.option.text),
      esc(v.createdAt.toISOString()),
    ].join(",")
  );

  const csv = [...summaryLines, header, ...rows].join("\n");

  // Sanitize filename
  const safeName = poll.question
    .replace(/[^a-zA-Z0-9 _-]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 60);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="voti_${safeName}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
