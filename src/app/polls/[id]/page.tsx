import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import PollVotingForm from "./PollVotingForm";
import PollResults from "./PollResults";
import type { TrendDataPoint } from "./PollResults";
import PollAdminPanel from "./PollAdminPanel";
import SharePollModal from "./SharePollModal";
import PresenterMode from "./PresenterMode";
import CommentsSection from "./CommentsSection";
import type { CommentData } from "./CommentsSection";
import Link from "next/link";
import { ArrowLeft, Calendar, User, MessageCircle, BarChart, Clock, Download } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

/** Returns a human-readable countdown or "CLOSED" label */
function getClosingLabel(closesAt: Date | null): { label: string; isClosed: boolean } | null {
  if (!closesAt) return null;
  const now = new Date();
  if (closesAt <= now) return { label: "CLOSED", isClosed: true };

  const diffMs = closesAt.getTime() - now.getTime();
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHrs / 24);

  if (diffDays >= 1) return { label: `Closes in ${diffDays}d`, isClosed: false };
  if (diffHrs >= 1) return { label: `Closes in ${diffHrs}h`, isClosed: false };
  const diffMins = Math.floor(diffMs / (1000 * 60));
  return { label: `Closes in ${diffMins}m`, isClosed: false };
}

export default async function PollPage({ params }: PageProps) {
  const { id } = await params;

  // 1. Fetch poll details
  const poll = await db.poll.findUnique({
    where: { id },
    include: {
      options: { include: { votes: true } },
      // Only select demographic fields from users — not full user objects
votes: {
  select: {
    id: true,
    userId: true,
    optionId: true,
    createdAt: true,
    user: {
      select: {
        age: true,
        address: true
      }
    }
  }
},      creator: true,
      comments: {
        include: { user: { select: { id: true, name: true, image: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!poll || poll.deletedAt) {
    return (
      <div className="max-w-md mx-auto my-16 px-4 py-8 bg-white border border-indigo-50 rounded-3xl shadow-xl text-center">
        <h2 className="text-2xl font-black text-slate-800">Poll Not Found 🕵️</h2>
        <p className="text-slate-500 mt-2">The poll you are looking for does not exist or has been deleted.</p>
        <Link
          href="/"
          className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-md transition-colors"
        >
          Back to Explore
        </Link>
      </div>
    );
  }

  // 2. Session + ownership
  const session = await getServerSession(authOptions);
  const isCreator = session?.user?.email === poll.creator.email;

  // Current viewer's DB record (for role + userId)
  const currentUser = session?.user?.email
    ? await db.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, role: true, age: true, address: true },
      })
    : null;

  // 3. Voting state
  const hasVoted = currentUser
    ? poll.votes.some((vote) => vote.userId === currentUser.id)
    : false;
  const isProfileComplete = currentUser?.age && currentUser?.address;

  // 4. Closing status
  const closingInfo = getClosingLabel(poll.closesAt);
  const isClosed = closingInfo?.isClosed ?? false;

  // Lazy Evaluation DB sync for expired polls
  if (isClosed && poll.status === "PUBLISHED") {
    db.poll.update({ where: { id: poll.id }, data: { status: "CLOSED" } }).catch(console.error);
  }

  // 5. Option statistics
  const totalVotes = poll.votes.length;
  const optionsResults = poll.options.map((opt) => {
    const count = opt.votes.length;
    const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
    return { id: opt.id, text: opt.text, count, percentage };
  });

  // 6. Age demographics
  const ageGroups = [
    { name: "Under 25", min: 0, max: 24 },
    { name: "25 - 45", min: 25, max: 45 },
    { name: "45+", min: 46, max: 120 },
  ];
  const ageData = ageGroups.map((group) => {
    const dataPoint: { name: string; [key: string]: string | number } = { name: group.name };
    poll.options.forEach((opt) => { dataPoint[opt.text] = 0; });
    poll.votes.forEach((vote) => {
      const voterAge = vote.user?.age;
      const optionText = poll.options.find((o) => o.id === vote.optionId)?.text;
      if (voterAge && optionText && voterAge >= group.min && voterAge <= group.max) {
        dataPoint[optionText] = (dataPoint[optionText] as number) + 1;
      }
    });
    return dataPoint;
  });

  // 7. Region demographics
  const regionCounts: { [r: string]: number } = {};
  poll.votes.forEach((vote) => {
    const rawAddress = vote.user?.address;
    if (rawAddress) {
      const formatted = rawAddress.trim();
      regionCounts[formatted] = (regionCounts[formatted] || 0) + 1;
    }
  });
  const regionData = Object.entries(regionCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // 8. Vote trend — daily vote counts + cumulative
  const dailyCounts: { [day: string]: number } = {};
  poll.votes.forEach((vote) => {
    const day = new Date(vote.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    });
    dailyCounts[day] = (dailyCounts[day] || 0) + 1;
  });
  let cumulative = 0;
  const trendData: TrendDataPoint[] = Object.entries(dailyCounts).map(([date, votes]) => {
    cumulative += votes;
    return { date, votes, cumulative };
  });

  return (
    <div className="max-w-4xl mx-auto my-12 px-4 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center space-x-1.5 text-sm font-medium text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Polls</span>
      </Link>

      <div className="bg-white dark:bg-zinc-900 border border-indigo-50 dark:border-zinc-800 rounded-3xl shadow-xl overflow-hidden">
        {/* Category Header */}
        <div className="bg-linear-to-r from-indigo-500 via-indigo-600 to-violet-600 text-white relative">
          {poll.imageUrl && (
            <div className="w-full h-48 sm:h-64 relative">
              <img src={poll.imageUrl} alt={poll.question} className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-linear-to-t from-indigo-600 to-transparent"></div>
            </div>
          )}
          <div className={`p-6 sm:px-8 relative z-10 ${poll.imageUrl ? '-mt-16' : ''}`}>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider px-3 py-1 rounded-full backdrop-blur-sm shadow-sm">
                {poll.category}
              </span>
              {/* Closing badge */}
              {closingInfo && (
                <span
                  className={`font-extrabold text-xs px-3 py-1 rounded-full flex items-center gap-1 backdrop-blur-sm shadow-sm ${
                    closingInfo.isClosed
                      ? "bg-red-500/80 text-white"
                      : "bg-amber-400/80 text-amber-900"
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  {closingInfo.label}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-4 leading-tight drop-shadow-md">{poll.question}</h1>
            {poll.description && (
              <p className="mt-3 text-indigo-100 text-sm leading-relaxed max-w-3xl drop-shadow">{poll.description}</p>
            )}
          </div>
        </div>

        {/* Info badges */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-zinc-800/50 border-b border-slate-100 dark:border-zinc-800 flex flex-wrap gap-4 text-xs font-semibold text-slate-500 dark:text-zinc-400 sm:px-8">
          <div className="flex items-center space-x-1">
            <User className="h-3.5 w-3.5 text-indigo-500" />
            <span>Asked by {poll.creator.name || "Anonymous"}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-3.5 w-3.5 text-pink-500" />
            <span>Created on {new Date(poll.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1 ml-auto gap-3">
            <div className="flex items-center space-x-1">
              <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
              <span>{totalVotes} {totalVotes === 1 ? "response" : "responses"}</span>
            </div>
            {/* Share button (Modal with QR & ShortCode) */}
            <SharePollModal pollId={poll.id} shortCode={poll.shortCode} pollTitle={poll.question} />
            
            {/* Presenter Mode and CSV download — creator only */}
            {isCreator && (
              <>
                <PresenterMode 
                  pollId={poll.id} 
                  question={poll.question} 
                  shortCode={poll.shortCode} 
                  totalVotes={totalVotes} 
                  options={optionsResults} 
                />
                <a
                  id="poll-csv-export-btn"
                  href={`/api/polls/${poll.id}/export`}
                  download
                  className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50 transition-all"
                  title="Download votes as CSV"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Export CSV</span>
                </a>
              </>
            )}
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Creator admin panel */}
          {isCreator && (
            <PollAdminPanel
              pollId={poll.id}
              initialQuestion={poll.question}
              initialDescription={poll.description}
              initialClosesAt={poll.closesAt ? poll.closesAt.toISOString() : null}
              voteCount={totalVotes}
            />
          )}

          {/* Voting / results section */}
          {!session ? (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-sm font-semibold">
                🔒 Cast your vote! Please sign in using the dashboard or homepage to participate in this poll.
              </div>
                            <PollResults options={optionsResults} totalVotes={totalVotes} ageData={ageData} regionData={regionData} trendData={trendData} />
            </div>
          ) : isClosed ? (
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl text-sm font-bold flex items-center space-x-2">
                <span>🔒 This poll has closed. Here are the final results.</span>
              </div>
                            <PollResults options={optionsResults} totalVotes={totalVotes} ageData={ageData} regionData={regionData} trendData={trendData} />
            </div>
          ) : hasVoted ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-sm font-bold flex items-center space-x-2">
                <span>✅ You voted on this poll! Here are the live results.</span>
              </div>
                            <PollResults options={optionsResults} totalVotes={totalVotes} ageData={ageData} regionData={regionData} trendData={trendData} />
            </div>
          ) : !isProfileComplete ? (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-2xl text-sm">
                <span className="font-extrabold text-base block mb-1">⚠️ Profile Details Needed</span>
                To maintain accurate and anonymous demographics, you must complete your profile by adding your <strong>Age</strong> and <strong>City/Region</strong> before voting.
                <div className="mt-4">
                  <Link
                    href="/profile"
                    className="inline-block bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-xl shadow transition-colors"
                  >
                    Complete Profile Now
                  </Link>
                </div>
              </div>
                            <PollResults options={optionsResults} totalVotes={totalVotes} ageData={ageData} regionData={regionData} trendData={trendData} />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-4">
                <h2 className="text-lg font-black text-slate-800">Cast Your Ballot</h2>
                {poll.isMultipleChoice && (
                  <p className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg">
                    ✦ Multiple choice — select up to {poll.maxChoices} option{poll.maxChoices > 1 ? "s" : ""}
                  </p>
                )}
                <p className="text-xs text-slate-400">Results are shown in aggregate. Individual votes are never displayed publicly.</p>
                <PollVotingForm
                  pollId={poll.id}
                  options={poll.options}
                  isClosed={isClosed}
                  isMultipleChoice={poll.isMultipleChoice}
                  maxChoices={poll.maxChoices}
                />
              </div>
              <div className="hidden lg:block lg:col-span-1 border-l border-slate-100" />
              <div className="lg:col-span-6 space-y-4">
                <h2 className="text-lg font-black text-slate-800 flex items-center space-x-1.5">
                  <BarChart className="h-5 w-5 text-indigo-600" />
                  <span>Current Demographics</span>
                </h2>
                <p className="text-xs text-slate-400">Vote to view full breakdowns.</p>
                <PollResults options={optionsResults} totalVotes={totalVotes} ageData={ageData} regionData={regionData} trendData={trendData} />
              </div>
            </div>
          )}

          {/* Comments section */}
          <CommentsSection
            pollId={poll.id}
            initialComments={poll.comments.map((c): CommentData => ({
              id: c.id,
              text: c.text,
              likes: c.likes,
              parentId: c.parentId,
              createdAt: c.createdAt,
              sentimentScore: c.sentimentScore,
              sentimentLabel: c.sentimentLabel,
              user: { id: c.user.id, name: c.user.name, image: c.user.image },
            }))}
            isLoggedIn={!!session}
            currentUserId={currentUser?.id}
            currentUserRole={currentUser?.role}
          />
        </div>
      </div>
    </div>
  );
}
