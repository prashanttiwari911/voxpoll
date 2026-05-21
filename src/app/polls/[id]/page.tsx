import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import PollVotingForm from "./PollVotingForm";
import PollResults from "./PollResults";
import Link from "next/link";
import { ArrowLeft, Calendar, HelpCircle, User, MessageCircle, BarChart } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PollPage({ params }: PageProps) {
  const { id } = await params;

  // 1. Fetch poll details including options, votes, and user demographics
  const poll = await db.poll.findUnique({
    where: { id },
    include: {
      options: {
        include: {
          votes: true
        }
      },
      votes: {
        include: {
          user: true,
        },
      },
      creator: true,
    },
  });

  if (!poll) {
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

  // 2. Fetch user session
  const session = await getServerSession(authOptions);
  
  // 3. Check if user already voted in this poll
  const hasVoted = session?.user?.id
    ? poll.votes.some((vote) => vote.userId === session.user.id)
    : false;

  // 4. Check if profile is complete (needed to vote)
  const isProfileComplete = session?.user?.age && session?.user?.address;

  // 5. Compile Statistics for options
  const totalVotes = poll.votes.length;
  const optionsResults = poll.options.map((opt) => {
    const count = opt.votes.length;
    const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
    return {
      id: opt.id,
      text: opt.text,
      count,
      percentage,
    };
  });

  // 6. Compile Age Demographics data
  // We'll group ages into: "Under 25", "25 - 45", "45+"
  const ageGroups = [
    { name: "Under 25", min: 0, max: 24 },
    { name: "25 - 45", min: 25, max: 45 },
    { name: "45+", min: 46, max: 120 },
  ];

  const ageData = ageGroups.map((group) => {
    const dataPoint: { name: string; [key: string]: string | number } = { name: group.name };
    
    // Initialize count for all options to 0
    poll.options.forEach((opt) => {
      dataPoint[opt.text] = 0;
    });

    // Populate counts based on voter ages
    poll.votes.forEach((vote) => {
      const voterAge = vote.user?.age;
      const optionText = poll.options.find((o) => o.id === vote.optionId)?.text;
      
      if (voterAge && optionText) {
        if (voterAge >= group.min && voterAge <= group.max) {
          dataPoint[optionText] = (dataPoint[optionText] as number) + 1;
        }
      }
    });

    return ageDataPointConverter(dataPoint);
  });

  function ageDataPointConverter(dp: { name: string; [key: string]: string | number }) {
    return dp as any;
  }

  // 7. Compile Region Demographics data
  const regionCounts: { [regionName: string]: number } = {};
  poll.votes.forEach((vote) => {
    const rawAddress = vote.user?.address;
    if (rawAddress) {
      const region = rawAddress.trim().toLowerCase();
      // Capitalize first letter for display
      const formattedRegion = region.charAt(0).toUpperCase() + region.slice(1);
      regionCounts[formattedRegion] = (regionCounts[formattedRegion] || 0) + 1;
    }
  });

  const regionData = Object.entries(regionCounts).map(([name, value]) => ({
    name,
    value,
  })).sort((a, b) => b.value - a.value).slice(0, 6); // Limit to top 6 regions for readability

  return (
    <div className="max-w-4xl mx-auto my-12 px-4 sm:px-6">
      <Link
        href="/"
        className="inline-flex items-center space-x-1.5 text-sm font-medium text-slate-400 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Polls</span>
      </Link>

      <div className="bg-white border border-indigo-50 rounded-3xl shadow-xl overflow-hidden">
        {/* Category Header */}
        <div className="bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 p-6 text-white sm:px-8">
          <span className="bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider px-3 py-1 rounded-full">
            {poll.category}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-3 leading-tight">{poll.question}</h1>
          {poll.description && <p className="mt-2 text-indigo-100 text-sm leading-relaxed">{poll.description}</p>}
        </div>

        {/* Info badges */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex flex-wrap gap-4 text-xs font-semibold text-slate-500 sm:px-8">
          <div className="flex items-center space-x-1">
            <User className="h-3.5 w-3.5 text-indigo-500" />
            <span>Asked by {poll.creator.name || "Anonymous"}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="h-3.5 w-3.5 text-pink-500" />
            <span>Created on {new Date(poll.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-1 ml-auto">
            <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
            <span>{totalVotes} {totalVotes === 1 ? "response" : "responses"}</span>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {/* Main content body */}
          {!session ? (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-sm font-semibold">
                🔒 Cast your vote! Please sign in using the dashboard or homepage to participate in this poll.
              </div>
              <PollResults
                options={optionsResults}
                totalVotes={totalVotes}
                ageData={ageData}
                regionData={regionData}
              />
            </div>
          ) : hasVoted ? (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-sm font-bold flex items-center space-x-2">
                <span>✅ You voted on this poll! Here are the live results.</span>
              </div>
              <PollResults
                options={optionsResults}
                totalVotes={totalVotes}
                ageData={ageData}
                regionData={regionData}
              />
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
              <PollResults
                options={optionsResults}
                totalVotes={totalVotes}
                ageData={ageData}
                regionData={regionData}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-4">
                <h2 className="text-lg font-black text-slate-800">Cast Your Ballot</h2>
                <p className="text-xs text-slate-400">Make your choice. Your vote is anonymous and secure.</p>
                <PollVotingForm pollId={poll.id} options={poll.options} />
              </div>
              <div className="hidden lg:block lg:col-span-1 border-l border-slate-100" />
              <div className="lg:col-span-6 space-y-4">
                <h2 className="text-lg font-black text-slate-800 flex items-center space-x-1.5">
                  <BarChart className="h-5 w-5 text-indigo-600" />
                  <span>Current Demographics</span>
                </h2>
                <p className="text-xs text-slate-400">Vote to view full breakdowns.</p>
                <PollResults
                  options={optionsResults}
                  totalVotes={totalVotes}
                  ageData={ageData}
                  regionData={regionData}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
