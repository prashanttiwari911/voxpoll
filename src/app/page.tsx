import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import PollsList from "./PollsList";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const session = await getServerSession(authOptions);
  const resolvedParams = await searchParams;
  const pageNumber = parseInt(resolvedParams.page || "1", 10);
  const take = 10;
  const skip = (pageNumber - 1) * take;

  const polls = await db.poll.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { createdAt: "desc" },
    include: { creator: { select: { name: true } }, options: true, _count: { select: { votes: true } } },
    take,
    skip,
  });

  const totalPolls = await db.poll.count({ where: { status: "PUBLISHED", deletedAt: null } });
  const hasNextPage = skip + take < totalPolls;
  const hasPrevPage = pageNumber > 1;
  const now = new Date();

  const pollsWithStatus = polls.map((p) => {
    let currentStatus = p.status ?? "PUBLISHED";
    if (p.closesAt && p.closesAt < now && currentStatus === "PUBLISHED") {
      currentStatus = "CLOSED";
      db.poll.update({ where: { id: p.id }, data: { status: "CLOSED" } }).catch(console.error);
    }
    return { ...p, status: currentStatus };
  });

  return (
    <div className="flex-1 flex flex-col pb-16 bg-transparent transition-colors">
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-8">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-zinc-900 dark:text-white leading-[1.1] drop-shadow-sm">
              YOUR VOICE.<br />
              <span className="bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-md">YOUR VOTE.</span>
            </h1>
            <p className="text-xl sm:text-2xl text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Ask questions, collect opinions, and discover what people think in real time.
            </p>
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 pt-6">
              <Link href="/polls/new" className="w-full sm:w-auto bg-linear-to-r from-indigo-600 via-purple-600 to-pink-500 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-400 text-white font-black px-8 py-4 rounded-2xl flex items-center justify-center space-x-2 text-lg transition-all active:scale-95 shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 hover:-translate-y-1">
                <span>Create a Poll</span>
                <ArrowRight className="h-5 w-5 ml-1" />
              </Link>
              <a href="#explore" className="w-full sm:w-auto bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-600 text-zinc-900 dark:text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center space-x-2 text-lg transition-all active:scale-95 hover:-translate-y-1 hover:shadow-lg">
                <span>Explore Polls</span>
              </a>
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-linear-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
            <div className="relative group perspective-1000">
              <img src="/feature_analytics.jpg" alt="VoTI Analytics" className="relative z-10 w-full h-125 object-cover rounded-3xl shadow-2xl border border-white/10 dark:border-zinc-800 transform transition-all duration-700 hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(99,102,241,0.2)]" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-100 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white">How VoTI Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { num: "1", title: "Create", desc: "Create a question and add your voting options in seconds.", borderColor: "border-zinc-200 dark:border-zinc-700", textColor: "text-zinc-400 dark:text-zinc-500" },
              { num: "2", title: "Share & Vote", desc: "Share a link, poll code, or QR code and collect votes instantly.", borderColor: "border-indigo-100 dark:border-indigo-900/30", textColor: "text-indigo-400 dark:text-indigo-500" },
              { num: "3", title: "Discover", desc: "See live results update in real-time with demographic insights.", borderColor: "border-emerald-100 dark:border-emerald-900/30", textColor: "text-emerald-400 dark:text-emerald-500" },
            ].map((step) => (
              <div key={step.num} className="space-y-4">
                <div className={`mx-auto w-16 h-16 bg-white dark:bg-zinc-800 border-2 ${step.borderColor} rounded-2xl flex items-center justify-center shadow-sm text-2xl font-black ${step.textColor}`}>
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{step.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium px-4">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-20">
        <div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-zinc-900 flex items-center gap-2">
              Live Now
              <span className="relative flex h-3 w-3 ml-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </h2>
            <p className="text-zinc-500 font-medium mt-1">Join the conversation</p>
          </div>
        </div>
        
        <div id="explore" className="scroll-mt-24">
          <PollsList initialPolls={pollsWithStatus} />
        </div>
        
        <div className="mt-8 flex items-center justify-center gap-4">
          {hasPrevPage ? (
            <Link href={`/?page=${pageNumber - 1}`} className="px-4 py-2 bg-white border-2 border-zinc-200 hover:border-indigo-500 hover:text-indigo-600 rounded-xl font-bold text-zinc-600 transition-colors">Previous</Link>
          ) : (
            <span className="px-4 py-2 bg-zinc-50 border-2 border-zinc-100 rounded-xl font-bold text-zinc-300 cursor-not-allowed">Previous</span>
          )}
          <span className="text-sm font-bold text-zinc-500">Page {pageNumber} of {Math.max(1, Math.ceil(totalPolls / take))}</span>
          {hasNextPage ? (
            <Link href={`/?page=${pageNumber + 1}`} className="px-4 py-2 bg-white border-2 border-zinc-200 hover:border-indigo-500 hover:text-indigo-600 rounded-xl font-bold text-zinc-600 transition-colors">Next</Link>
          ) : (
            <span className="px-4 py-2 bg-zinc-50 border-2 border-zinc-100 rounded-xl font-bold text-zinc-300 cursor-not-allowed">Next</span>
          )}
        </div>
      </section>

      <section className="py-24 text-center px-4">
        <h2 className="text-3xl font-black text-zinc-900 mb-8">Ready to ask your audience?</h2>
        <Link href="/polls/new" className="inline-flex bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-full items-center justify-center space-x-2 text-lg transition-transform active:scale-95 shadow-md shadow-indigo-200">
          <Sparkles className="h-5 w-5" />
          <span>Create your own poll</span>
        </Link>
      </section>

      {!session && (
        <section className="max-w-3xl mx-auto px-4 pb-12 w-full opacity-60 hover:opacity-100 transition-opacity">
          <div className="pt-8 border-t border-zinc-100">
            <p className="text-center text-xs text-zinc-400 font-bold mb-4 uppercase tracking-widest">Developer Access</p>
          </div>
        </section>
      )}
    </div>
  );
}
