import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import Link from "next/link";
import { User, PlusCircle, BarChart2, Bookmark, MessageCircle, ArrowRight, Vote, Sparkles, MapPin, Calendar, Briefcase, TrendingUp, Clock, CheckCircle2, AlertTriangle, Eye } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 py-8 bg-white border border-indigo-50 rounded-3xl shadow-xl text-center">
        <h2 className="text-2xl font-black text-slate-800">Access Denied 🔒</h2>
        <p className="text-slate-500 mt-2">You need to sign in to access your personal dashboard.</p>
        <Link href="/" className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-colors">Sign In Now</Link>
      </div>
    );
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      polls: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, include: { _count: { select: { votes: true } } } },
      votes: { distinct: ["pollId"], orderBy: { createdAt: "desc" }, include: { poll: { select: { id: true, question: true, category: true, status: true, _count: { select: { votes: true } } } } } },
      bookmarks: { select: { id: true } },
      comments:  { select: { id: true } },
      notifications: { orderBy: { createdAt: "desc" }, take: 6, select: { id: true, type: true, message: true, isRead: true, createdAt: true, pollId: true } },
    },
  });

  if (!user) return <div className="text-center py-12">Session error. Please sign out and back in.</div>;

  const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
    PUBLISHED: { label: "Active",  cls: "bg-emerald-100 text-emerald-700" },
    DRAFT:     { label: "Draft",   cls: "bg-zinc-100 text-zinc-500" },
    CLOSED:    { label: "Closed",  cls: "bg-red-100 text-red-600" },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-linear-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_50%,white,transparent)]" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <img src={session.user.image || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user.name || "user"}`} alt="Avatar" className="h-16 w-16 rounded-2xl border-2 border-white/30 shadow-lg object-cover" />
            <div>
              <h1 className="text-3xl font-black flex items-center gap-2">Hi, {user.name?.split(" ")[0] || "Voter"}!<Sparkles className="h-6 w-6 text-amber-300 fill-amber-300 animate-pulse" /></h1>
              <p className="text-indigo-100 text-sm mt-1">{user.email}</p>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/polls/new" className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm shadow-md transition-all"><PlusCircle className="h-4 w-4" /> New Poll</Link>
            <Link href="/profile" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm transition-all"><User className="h-4 w-4" /> Profile</Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: BarChart2, label: "Polls Created", value: user.polls.length, color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
          { icon: Vote, label: "Polls Voted In", value: user.votes.length, color: "text-violet-600", bg: "bg-violet-50", border: "border-violet-100" },
          { icon: Bookmark, label: "Bookmarks", value: user.bookmarks.length, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
          { icon: MessageCircle, label: "Comments Made", value: user.comments.length, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
        ].map(({ icon: Icon, label, value, color, bg, border }) => (
          <div key={label} className={`${bg} border-2 ${border} rounded-2xl p-5 flex items-center gap-4`}>
            <div className={`p-2.5 rounded-xl ${bg} border ${border}`}><Icon className={`h-6 w-6 ${color}`} /></div>
            <div><span className={`block text-3xl font-black ${color}`}>{value}</span><span className="block text-xs font-bold text-zinc-500 mt-0.5">{label}</span></div>
          </div>
        ))}
      </div>

      {(!user.age || !user.address) && (
        <div className="flex items-start gap-3 bg-amber-50 border-2 border-amber-200 text-amber-800 p-4 rounded-2xl">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-amber-500" />
          <div><p className="font-black text-sm">Profile incomplete</p><p className="text-xs font-medium mt-0.5">Add your Age and Region to vote in polls and unlock demographic analytics.</p></div>
          <Link href="/profile" className="ml-auto shrink-0 text-xs font-black text-amber-700 hover:underline">Fix now →</Link>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-6">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm space-y-5">
            <h3 className="font-black text-sm uppercase tracking-widest text-zinc-400">Profile</h3>
            <div className="space-y-3 text-sm font-semibold text-zinc-600">
              <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-pink-400 shrink-0" /><span>{user.age ? `${user.age} years old` : <span className="text-zinc-400 italic">Age not set</span>}</span></div>
              <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-amber-400 shrink-0" /><span>{user.address || <span className="text-zinc-400 italic">Region not set</span>}</span></div>
              {user.gender && <div className="flex items-center gap-2"><User className="h-4 w-4 text-indigo-400 shrink-0" /><span>{user.gender}</span></div>}
              {user.occupation && <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-violet-400 shrink-0" /><span>{user.occupation}</span></div>}
            </div>
            <Link href="/profile" className="block text-center bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold py-2.5 px-4 rounded-xl transition-all">Edit Profile</Link>
          </div>
          <div className="bg-white border border-zinc-200 rounded-3xl p-5 shadow-sm space-y-2">
            <h3 className="font-black text-zinc-400 text-xs uppercase tracking-widest mb-3">Quick Links</h3>
            {[{ href: "/bookmarks", label: "My Bookmarks", icon: Bookmark }, { href: "/notifications", label: "Notifications", icon: MessageCircle }].map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-zinc-50 transition-colors text-sm font-bold text-zinc-700"><Icon className="h-4 w-4 text-zinc-400" />{label}<ArrowRight className="h-4 w-4 ml-auto text-zinc-300" /></Link>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
              <h2 className="font-black text-zinc-900 flex items-center gap-2"><TrendingUp className="h-5 w-5 text-indigo-500" />Your Polls<span className="text-xs font-bold bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">{user.polls.length}</span></h2>
              <Link href="/polls/new" className="text-xs font-black text-indigo-600 hover:text-indigo-800 flex items-center gap-1"><PlusCircle className="h-3.5 w-3.5" /> New</Link>
            </div>
            {user.polls.length === 0 ? (
              <div className="text-center py-12 text-zinc-400"><BarChart2 className="h-10 w-10 mx-auto mb-3 text-zinc-200" /><p className="font-bold">No polls yet</p><Link href="/polls/new" className="text-indigo-600 text-sm font-bold hover:underline mt-1 block">Create your first poll →</Link></div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {user.polls.map((poll) => {
                  const badge = STATUS_BADGE[poll.status] ?? STATUS_BADGE.DRAFT;
                  return (
                    <div key={poll.id} className="flex items-center gap-4 px-6 py-4 hover:bg-zinc-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <Link href={`/polls/${poll.id}`} className="font-bold text-zinc-800 hover:text-indigo-600 transition-colors text-sm truncate block">{poll.question}</Link>
                        <span className="text-[10px] text-zinc-400 font-semibold">{poll.category} · {new Date(poll.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-black text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-lg">{poll._count.votes} <span className="text-xs font-semibold text-zinc-400">votes</span></span>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${badge.cls}`}>{badge.label}</span>
                        <Link href={`/polls/${poll.id}`} className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"><Eye className="h-4 w-4" /></Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100">
              <h2 className="font-black text-zinc-900 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-emerald-500" />Voted In<span className="text-xs font-bold bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-full">{user.votes.length}</span></h2>
            </div>
            {user.votes.length === 0 ? (
              <div className="text-center py-12 text-zinc-400"><Vote className="h-10 w-10 mx-auto mb-3 text-zinc-200" /><p className="font-bold">No votes yet</p><Link href="/" className="text-indigo-600 text-sm font-bold hover:underline mt-1 block">Explore polls →</Link></div>
            ) : (
              <div className="divide-y divide-zinc-50">
                {user.votes.slice(0, 8).map((vote) => (
                  <div key={vote.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-zinc-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <Link href={`/polls/${vote.pollId}`} className="font-bold text-zinc-800 hover:text-indigo-600 text-sm truncate block transition-colors">{vote.poll.question}</Link>
                      <span className="text-[10px] text-zinc-400 font-semibold">{vote.poll.category}</span>
                    </div>
                    <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full shrink-0">✓ Voted</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {user.notifications.length > 0 && (
            <div className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
                <h2 className="font-black text-zinc-900 flex items-center gap-2"><Clock className="h-5 w-5 text-violet-500" />Recent Activity</h2>
                <Link href="/notifications" className="text-xs font-black text-indigo-600 hover:underline">View all</Link>
              </div>
              <div className="divide-y divide-zinc-50">
                {user.notifications.map((n) => (
                  <div key={n.id} className={`flex items-start gap-3 px-6 py-3.5 ${!n.isRead ? "bg-indigo-50/30" : ""}`}>
                    <div className="w-2 h-2 rounded-full mt-2 shrink-0 bg-indigo-400" />
                    <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-zinc-700 truncate">{n.message}</p><span className="text-[10px] text-zinc-400 font-semibold">{new Date(n.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span></div>
                    {!n.isRead && <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2" />}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
