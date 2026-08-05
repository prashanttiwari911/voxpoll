import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import Link from "next/link";
import { Bookmark, ArrowLeft, Calendar, Users, ChevronRight } from "lucide-react";

export const metadata = { title: "Bookmarks — VoTI" };

export default async function BookmarksPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 py-8 bg-white border border-indigo-50 rounded-3xl shadow-xl text-center">
        <Bookmark className="h-12 w-12 text-indigo-300 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-800">Your Bookmarks 🔖</h2>
        <p className="text-slate-500 mt-2">Sign in to view polls you have saved.</p>
        <Link
          href="/"
          className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-colors"
        >
          Go Home
        </Link>
      </div>
    );
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  if (!user) return null;

  const bookmarks = await db.bookmark.findMany({
    where: { userId: user.id },
    include: {
      poll: {
        include: {
          creator: { select: { name: true } },
          _count: { select: { votes: true, comments: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto my-10 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-sm font-medium text-slate-400 hover:text-indigo-600 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Polls</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
            <Bookmark className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800">Saved Polls</h1>
            <p className="text-sm text-slate-400">{bookmarks.length} bookmark{bookmarks.length !== 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {bookmarks.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
          <Bookmark className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-semibold">No saved polls yet.</p>
          <p className="text-sm text-slate-400 mt-1">
            Bookmark a poll by clicking the 🔖 icon on any poll page.
          </p>
          <Link
            href="/"
            className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-colors text-sm"
          >
            Explore Polls
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map(({ poll, createdAt }) => (
            <Link
              key={poll.id}
              href={`/polls/${poll.id}`}
              className="group flex items-center justify-between bg-white border border-slate-100 hover:border-indigo-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex-1 min-w-0 pr-4">
                {/* Category badge */}
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mb-2">
                  {poll.category}
                </span>
                <p className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug line-clamp-2">
                  {poll.question}
                </p>
                <div className="flex items-center gap-4 mt-2 text-[11px] font-semibold text-slate-400">
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {poll._count.votes} vote{poll._count.votes !== 1 ? "s" : ""}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Saved {new Date(createdAt).toLocaleDateString()}
                  </span>
                  {poll.creator.name && (
                    <span className="text-slate-300">by {poll.creator.name}</span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-400 shrink-0 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
