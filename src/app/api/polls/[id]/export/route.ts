import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { db } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return new NextResponse("Unauthorized", { status: 401 });

  const currentUser = await db.user.findUnique({ where: { email: session.user.email }, select: { id: true, role: true } });
  if (!currentUser) return new NextResponse("Unauthorized", { status: 401 });
  const isAdmin = currentUser.role === "ADMIN" || currentUser.role === "MODERATOR";

  const poll = await db.poll.findUnique({
    where: { id },
    include: { creator: { select: { email: true, name: true } }, options: { select: { id: true, text: true } } },
  });

  if (!poll) return new NextResponse("Poll not found", { status: 404 });
  if (poll.creator.email !== session.user.email && !isAdmin) {
    return new NextResponse("Forbidden — only the poll creator or an admin can export results.", { status: 403 });
  }
  const votes = await db.vote.findMany({
    where: { pollId: id },
    include: { user: { select: { name: true, age: true, address: true } }, option: { select: { text: true } } },
    orderBy: { createdAt: "asc" },
  });

  const esc = (v: string | number | null | undefined): string => {
    if (v == null) return "";
    const s = String(v);
    return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const totalVoters = new Set(votes.map((v) => v.userId)).size;
  const optionSummary = poll.options.map((opt) => {
    const count = votes.filter((v) => v.optionId === opt.id).length;
    return `# ${esc(opt.text)}: ${count} votes (${((count / (totalVoters || 1)) * 100).toFixed(1)}%)`;
  });
  const csv = [
    `# VoTI Poll Export\n# Question: ${esc(poll.question)}\n# Category: ${esc(poll.category)}\n# Status: ${esc(poll.status)}\n# Created: ${esc(poll.createdAt.toISOString())}\n# Closes: ${poll.closesAt ? esc(poll.closesAt.toISOString()) : "Never"}\n# Total Votes: ${totalVoters}`,
    ...optionSummary,
    `# Exported: ${esc(new Date().toISOString())}\n#\n` + "Name,Age,Location,Choice,Response Time",
    ...votes.map((v) => [v.user.name, v.user.age, v.user.address, v.option.text, v.createdAt.toISOString()].map(esc).join(","))
  ].join("\n");
  const safeName = poll.question.replace(/[^a-zA-Z0-9 _-]/g, "").trim().replace(/\s+/g, "_").slice(0, 60);
  return new NextResponse(csv, { status: 200, headers: {
    "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="voti_${safeName}.csv"`, "Cache-Control": "no-store",
  } });
}
