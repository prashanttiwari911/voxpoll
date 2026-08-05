import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import Link from "next/link";
import { User, BarChart2, PlusCircle, PenTool, CheckSquare, Sparkles, MapPin, Calendar } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 py-8 bg-white border border-indigo-50 rounded-3xl shadow-xl text-center">
        <h2 className="text-2xl font-black text-slate-800">Access Denied 🔒</h2>
        <p className="text-slate-500 mt-2">You need to sign in to access your personal dashboard.</p>
        <Link
          href="/"
          className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-colors"
        >
          Sign In Now
        </Link>
      </div>
    );
  }

  // 1. Fetch user information
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: {
      polls: {
        include: {
          votes: true,
        },
      },
      votes: {
        include: {
          poll: true,
        },
      },
    },
  });

  if (!user) {
    return <div className="text-center py-12">User session error</div>;
  }

  const createdCount = user.polls.length;
  const votedCount = user.votes.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-10 space-y-8">
      {/* Welcome banner */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black flex items-center space-x-2">
            <span>Hi, {user.name || "Voter"}!</span>
            <Sparkles className="h-6 w-6 text-amber-300 fill-amber-300 animate-pulse" />
          </h1>
          <p className="text-indigo-100 text-sm mt-1">
            Welcome to your VoTI command center. Cast votes and check your impact!
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/polls/new"
            className="bg-white text-indigo-600 hover:bg-indigo-50 font-bold px-5 py-3 rounded-2xl flex items-center space-x-2 text-sm shadow-md transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Launch New Poll</span>
          </Link>
          <Link
            href="/profile"
            className="bg-indigo-600/35 hover:bg-indigo-600/50 border border-white/20 text-white font-bold px-5 py-3 rounded-2xl flex items-center space-x-2 text-sm transition-colors"
          >
            <User className="h-4 w-4" />
            <span>Edit Profile</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card details */}
        <div className="bg-white border border-indigo-50 rounded-3xl p-6 shadow-sm space-y-6">
          <div className="flex items-center space-x-3.5">
            <img
              src={session.user.image || ""}
              alt="Avatar"
              className="h-14 w-14 rounded-2xl border-2 border-indigo-100"
            />
            <div>
              <h3 className="font-extrabold text-slate-800 text-lg leading-tight">{user.name}</h3>
              <p className="text-xs text-slate-400 font-semibold">{user.email}</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 space-y-3">
            <div className="flex items-center text-sm font-semibold text-slate-600">
              <Calendar className="h-4 w-4 text-pink-500 mr-2 shrink-0" />
              <span>Age: {user.age ? `${user.age} years` : "Not provided"}</span>
            </div>
            <div className="flex items-center text-sm font-semibold text-slate-600">
              <MapPin className="h-4 w-4 text-amber-500 mr-2 shrink-0" />
              <span>Region: {user.address || "Not provided"}</span>
            </div>
          </div>

          {(!user.age || !user.address) && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs">
              <strong>⚠️ Details Missing!</strong> Complete your profile with your age and region so you can vote in any poll and view advanced demographic charts.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-slate-50 border rounded-2xl p-3">
              <span className="block text-2xl font-black text-indigo-600">{createdCount}</span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Created</span>
            </div>
            <div className="bg-slate-50 border rounded-2xl p-3">
              <span className="block text-2xl font-black text-pink-600">{votedCount}</span>
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400">Voted In</span>
            </div>
          </div>
        </div>

        {/* Dashboard Main Lists */}
        <div className="lg:col-span-2 space-y-8">
          {/* Polls Created Section */}
          <div className="bg-white border border-indigo-50 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-800 flex items-center space-x-2 mb-4">
              <PenTool className="h-5 w-5 text-indigo-600" />
              <span>Polls Launched by You ({createdCount})</span>
            </h2>
            
            {createdCount === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                You haven't launched any polls yet. Why not create one now?
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {user.polls.map((poll) => (
                  <div key={poll.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div>
                      <Link
                        href={`/polls/${poll.id}`}
                        className="font-bold text-slate-700 hover:text-indigo-600 transition-colors text-sm"
                      >
                        {poll.question}
                      </Link>
                      <span className="block text-[10px] text-slate-400 font-bold mt-0.5">
                        Category: {poll.category} • Created {new Date(poll.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="bg-indigo-50 text-indigo-700 font-extrabold text-xs py-1 px-3 rounded-full shrink-0">
                      {poll.votes.length} {poll.votes.length === 1 ? "vote" : "votes"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Polls Voted In Section */}
          <div className="bg-white border border-indigo-50 rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-800 flex items-center space-x-2 mb-4">
              <CheckSquare className="h-5 w-5 text-pink-500" />
              <span>Polls Voted In ({votedCount})</span>
            </h2>
            
            {votedCount === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm">
                You haven't voted in any polls yet. Explore the home page to start participating!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {user.votes.map((vote) => (
                  <div key={vote.id} className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div>
                      <Link
                        href={`/polls/${vote.pollId}`}
                        className="font-bold text-slate-700 hover:text-indigo-600 transition-colors text-sm"
                      >
                        {vote.poll.question}
                      </Link>
                      <span className="block text-[10px] text-slate-400 font-bold mt-0.5">
                        Category: {vote.poll.category} • Voted on {new Date(vote.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="bg-slate-100 text-slate-600 font-extrabold text-[10px] uppercase tracking-wider py-1 px-3 rounded-full shrink-0">
                      Voted
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
