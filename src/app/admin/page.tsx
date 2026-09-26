import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Shield, Users, BarChart2, MessageCircle, Vote,
  Trash2, CheckCircle, XCircle, ArrowLeft, AlertTriangle,
} from "lucide-react";
import AdminUserRow from "./AdminUserRow";
import AdminPollRow from "./AdminPollRow";

export const metadata = { title: "Admin — VoTI" };

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) redirect("/");

  const currentUser = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, role: true },
  });

  // RBAC gate — hard redirect for non-admins
  if (!currentUser || (currentUser.role !== "ADMIN" && currentUser.role !== "MODERATOR")) {
    redirect("/");
  }

  // ── Aggregate stats ──
  const [userCount, pollCount, voteCount, commentCount] = await Promise.all([
    db.user.count(),
    db.poll.count(),
    db.vote.count(),
    db.comment.count(),
  ]);

  // ── Recent users (last 20) ──
  const users = await db.user.findMany({
    orderBy: { emailVerified: "desc" },
    take: 20,
    select: {
      id: true, name: true, email: true, role: true, age: true, address: true,
      _count: { select: { polls: true, votes: true } },
    },
  });

  // ── Recent polls (last 30) ──
  const polls = await db.poll.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
    include: {
      creator: { select: { name: true, email: true } },
      _count: { select: { votes: true, comments: true } },
    },
  });

  const stats = [
    { label: "Users", value: userCount, icon: <Users className="h-5 w-5" />, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Polls", value: pollCount, icon: <BarChart2 className="h-5 w-5" />, color: "text-violet-600", bg: "bg-violet-50" },
    { label: "Votes", value: voteCount, icon: <Vote className="h-5 w-5" />, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Comments", value: commentCount, icon: <MessageCircle className="h-5 w-5" />, color: "text-pink-600", bg: "bg-pink-50" },
  ];

  return (
    <div className="max-w-7xl mx-auto my-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-indigo-600 mb-4 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-linear-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-md">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Admin Dashboard</h1>
            <p className="text-sm text-slate-400">
              {currentUser.role} view — full platform control
            </p>
          </div>
        </div>
      </div>

      {/* Warning banner for moderators */}
      {currentUser.role === "MODERATOR" && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-sm text-amber-800">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>You have <strong>Moderator</strong> access. Some admin-only actions are restricted.</span>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className={`${s.bg} ${s.color} rounded-xl p-2.5`}>{s.icon}</div>
            <div>
              <span className={`block text-3xl font-black ${s.color}`}>{s.value.toLocaleString()}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" /> Users
            <span className="text-sm font-semibold text-slate-400">(last 20)</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="text-left px-6 py-3">User</th>
                <th className="text-left px-4 py-3">Role</th>
                <th className="text-left px-4 py-3">Age / Region</th>
                <th className="text-center px-4 py-3">Polls</th>
                <th className="text-center px-4 py-3">Votes</th>
                <th className="text-center px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u) => (
                <AdminUserRow
                  key={u.id}
                  user={u}
                  currentUserRole={currentUser.role}
                  isSelf={u.id === currentUser.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Polls table */}
      <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-violet-500" /> Recent Polls
            <span className="text-sm font-semibold text-slate-400">(last 30)</span>
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs font-extrabold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="text-left px-6 py-3">Question</th>
                <th className="text-left px-4 py-3">Creator</th>
                <th className="text-left px-4 py-3">Status</th>
                <th className="text-center px-4 py-3">Votes</th>
                <th className="text-center px-4 py-3">Comments</th>
                <th className="text-center px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {polls.map((p) => (
                <AdminPollRow key={p.id} poll={p} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
