import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import Link from "next/link";
import { Bell, CheckCheck, ArrowLeft, MessageCircle, Heart, Vote, Info } from "lucide-react";
import MarkReadButton from "./MarkReadButton";

export const metadata = { title: "Notifications — VoTI" };

const TYPE_ICONS: Record<string, React.ReactNode> = {
  VOTE: <Vote className="h-4 w-4 text-indigo-500" />,
  COMMENT: <MessageCircle className="h-4 w-4 text-emerald-500" />,
  REPLY: <MessageCircle className="h-4 w-4 text-violet-500" />,
  LIKE: <Heart className="h-4 w-4 text-rose-500" />,
  SYSTEM: <Info className="h-4 w-4 text-amber-500" />,
};

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 py-8 bg-white border border-indigo-50 rounded-3xl shadow-xl text-center">
        <Bell className="h-12 w-12 text-indigo-300 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-slate-800">Notifications</h2>
        <p className="text-slate-500 mt-2">Sign in to see your notifications.</p>
      </div>
    );
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
  if (!user) return null;

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n.id);
  const unreadCount = unreadIds.length;

  return (
    <div className="max-w-2xl mx-auto my-10 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-sm font-medium text-slate-400 hover:text-indigo-600 mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md">
                <Bell className="h-5 w-5 text-white" />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800">Notifications</h1>
              <p className="text-sm text-slate-400">{notifications.length} total</p>
            </div>
          </div>
          {/* Mark all read button */}
          {unreadCount > 0 && (
            <MarkReadButton notificationIds={unreadIds} />
          )}
        </div>
      </div>

      {/* Empty state */}
      {notifications.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
          <Bell className="h-12 w-12 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-semibold">No notifications yet.</p>
          <p className="text-sm text-slate-400 mt-1">
            You'll see activity on your polls and comments here.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 p-4 rounded-2xl border transition-all ${
                n.isRead
                  ? "bg-white border-slate-100"
                  : "bg-indigo-50/60 border-indigo-100 shadow-sm"
              }`}
            >
              {/* Icon */}
              <div className="mt-0.5 shrink-0">
                {TYPE_ICONS[n.type] ?? <Bell className="h-4 w-4 text-slate-400" />}
              </div>

              {/* Message + link */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-snug ${n.isRead ? "text-slate-600" : "text-slate-800 font-semibold"}`}>
                  {n.message}
                </p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[11px] text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                  {n.pollId && (
                    <Link
                      href={`/polls/${n.pollId}`}
                      className="text-[11px] font-bold text-indigo-600 hover:underline"
                    >
                      View poll →
                    </Link>
                  )}
                </div>
              </div>

              {/* Unread dot */}
              {!n.isRead && (
                <span className="shrink-0 mt-1.5 h-2 w-2 rounded-full bg-indigo-500" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
