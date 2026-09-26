import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import PollsList from "./PollsList";
import DevLoginConsole from "./DevLoginConsole";
import TutorialsSection from "./TutorialsSection";
import LiveDemo from "./LiveDemo";
import Link from "next/link";
import { ArrowRight, Sparkles, LayoutDashboard, PlusCircle, CheckCircle, Newspaper } from "lucide-react";

// Auto-seed function to ensure the developer has sample polls on initial load
async function seedPollsIfNeeded() {
  try {
    const pollCount = await db.poll.count();
    if (pollCount > 0) return;

    // Create system seed creator
    let systemUser = await db.user.findUnique({
      where: { email: "system@voti.com" },
    });

    if (!systemUser) {
      systemUser = await db.user.create({
        data: {
          email: "system@voti.com",
          name: "VoTI System",
          age: 28,
          address: "Delhi",
        },
      });
    }

    // 1. Education Poll
    await db.poll.create({
      data: {
        question: "Which educational path is most crucial for students in the next decade?",
        description: "As technology evolves, which discipline will shape the job market and global progress?",
        category: "EDUCATION",
        creatorId: systemUser.id,
        options: {
          create: [
            { text: "Artificial Intelligence & Data Science" },
            { text: "Climate Change Adaptation & Green Tech" },
            { text: "Bioinformatics & Advanced Healthcare" },
            { text: "Creative Writing, Ethics & Humanities" },
          ],
        },
      },
    });

    // 2. Sports Poll
    await db.poll.create({
      data: {
        question: "Which sport is expanding fastest in terms of popularity across India?",
        description: "Beyond Cricket, which athletic event is capturing the nation's passion?",
        category: "SPORTS",
        creatorId: systemUser.id,
        options: {
          create: [
            { text: "Football (ISL / International)" },
            { text: "Kabaddi (Pro Kabaddi League)" },
            { text: "Badminton & Racket Sports" },
            { text: "Athletics & Olympic Sports" },
          ],
        },
      },
    });

    // 3. Politics Poll
    await db.poll.create({
      data: {
        question: "What should be the primary focus of urban development policies?",
        description: "With growing cities, where should local budgets be prioritized first?",
        category: "POLITICS",
        creatorId: systemUser.id,
        options: {
          create: [
            { text: "Massive public transit expansion (Metro, EV Buses)" },
            { text: "Affordable housing projects & slum rehabilitation" },
            { text: "Green belts, public parks & lake rejuvenation" },
            { text: "Smart city grid integrations & sanitation" },
          ],
        },
      },
    });

    // 4. Books Poll
    await db.poll.create({
      data: {
        question: "What is your absolute favorite reading format?",
        description: "From reading before bed to listening during commutes, how do you digest books?",
        category: "BOOKS",
        creatorId: systemUser.id,
        options: {
          create: [
            { text: "Physical Hardcovers & Paperbacks 📖" },
            { text: "E-Readers (Kindle, Kobo) 📱" },
            { text: "Audiobooks (Audible, Spotify) 🎧" },
            { text: "Summaries & Articles 📝" },
          ],
        },
      },
    });
  } catch (err) {
    console.error("Seeding failed: ", err);
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const session = await getServerSession(authOptions);
  
  const resolvedParams = await searchParams;
  const pageNumber = parseInt(resolvedParams.page || "1", 10);
  const take = 10;
  const skip = (pageNumber - 1) * take;

  // Seed the database if empty
  await seedPollsIfNeeded();

  const polls = await db.poll.findMany({
    where: { status: "PUBLISHED", deletedAt: null }, // Only show published polls on home page
    orderBy: { createdAt: "desc" },
    include: {
      creator: { select: { name: true } },
      options: true,
      _count: { select: { votes: true } },
    },
    take,
    skip,
  });

  const totalPolls = await db.poll.count({
    where: { status: "PUBLISHED", deletedAt: null },
  });
  const hasNextPage = skip + take < totalPolls;
  const hasPrevPage = pageNumber > 1;

  // Prepare polls with status for PollsList (Lazy Evaluation for expired polls)
  const now = new Date();
  const pollsWithStatus = polls.map((p) => {
    let currentStatus = p.status ?? "PUBLISHED";
    
    // Auto-close logic
    if (p.closesAt && p.closesAt < now && currentStatus === "PUBLISHED") {
      currentStatus = "CLOSED";
      // Fire-and-forget DB update to sync the database
      db.poll.update({ where: { id: p.id }, data: { status: "CLOSED" } }).catch(console.error);
    }
    
    return { ...p, status: currentStatus };
  });

  return (
    <div className="flex-1 flex flex-col pb-16 bg-white dark:bg-zinc-950 transition-colors">
      {/* 1. Clean Hero Section with Image */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-8">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-zinc-900 dark:text-white leading-[1.1]">
              YOUR VOICE.<br />
              <span className="text-indigo-600 dark:text-indigo-400">YOUR VOTE.</span>
            </h1>

            <p className="text-xl sm:text-2xl text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Ask questions, collect opinions, and discover what people think in real time.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 pt-6">
              <Link
                href="/polls/new"
                className="w-full sm:w-auto bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 font-bold px-8 py-4 rounded-full flex items-center justify-center space-x-2 text-lg transition-transform active:scale-95 shadow-lg shadow-zinc-900/20 dark:shadow-zinc-100/10"
              >
                <span>Create a Poll</span>
                <ArrowRight className="h-5 w-5 ml-1" />
              </Link>
              <Link
                href="/join"
                className="w-full sm:w-auto bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white font-bold px-8 py-4 rounded-full flex items-center justify-center space-x-2 text-lg transition-all active:scale-95"
              >
                <span>Join a Poll</span>
              </Link>
            </div>
          </div>
          
          <div className="relative hidden md:block">
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
            <img 
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=2070" 
              alt="People looking at analytics on screen" 
              className="relative z-10 w-full h-[500px] object-cover rounded-3xl shadow-2xl border-4 border-white dark:border-zinc-800 transform hover:scale-[1.02] transition-transform duration-500"
            />
            {/* Floating UI Elements for interactivity feel */}
            <div className="absolute -left-8 top-12 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-xl z-20 animate-bounce border border-zinc-100 dark:border-zinc-800" style={{ animationDuration: '3s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">👍</div>
                <div>
                  <div className="h-2 w-16 bg-slate-200 dark:bg-zinc-700 rounded-full mb-2"></div>
                  <div className="h-2 w-10 bg-slate-200 dark:bg-zinc-700 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="absolute -right-8 bottom-24 bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-xl z-20 animate-bounce border border-zinc-100 dark:border-zinc-800" style={{ animationDuration: '4s', animationDelay: '1s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">📊</div>
                <div>
                  <div className="h-2 w-20 bg-slate-200 dark:bg-zinc-700 rounded-full mb-2"></div>
                  <div className="h-2 w-12 bg-slate-200 dark:bg-zinc-700 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Three-Step Workflow */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-900/50 border-y border-zinc-100 dark:border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white">How VoTI Works</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              {
                num: "1",
                title: "Create",
                desc: "Create a question and add your voting options in seconds.",
                borderColor: "border-zinc-200 dark:border-zinc-700",
                textColor: "text-zinc-400 dark:text-zinc-500",
              },
              {
                num: "2",
                title: "Share & Vote",
                desc: "Share a link, poll code, or QR code and collect votes instantly.",
                borderColor: "border-indigo-100 dark:border-indigo-900/30",
                textColor: "text-indigo-400 dark:text-indigo-500",
              },
              {
                num: "3",
                title: "Discover",
                desc: "See live results update in real-time with demographic insights.",
                borderColor: "border-emerald-100 dark:border-emerald-900/30",
                textColor: "text-emerald-400 dark:text-emerald-500",
              },
            ].map((step) => (
              <div key={step.num} className="space-y-4">
                <div className={`mx-auto w-16 h-16 bg-white dark:bg-zinc-800 border-2 ${step.borderColor} rounded-2xl flex items-center justify-center shadow-sm text-2xl font-black ${step.textColor}`}>
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{step.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium px-4">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Live Interactive Demo */}
      <LiveDemo />

      {/* 4. Tutorial Videos */}
      <TutorialsSection />

      {/* 4. Live Polls Feed */}
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
        
        <PollsList initialPolls={pollsWithStatus} />
        
        {/* Pagination Controls */}
        <div className="mt-8 flex items-center justify-center gap-4">
          {hasPrevPage ? (
            <Link
              href={`/?page=${pageNumber - 1}`}
              className="px-4 py-2 bg-white border-2 border-zinc-200 hover:border-indigo-500 hover:text-indigo-600 rounded-xl font-bold text-zinc-600 transition-colors"
            >
              Previous
            </Link>
          ) : (
            <span className="px-4 py-2 bg-zinc-50 border-2 border-zinc-100 rounded-xl font-bold text-zinc-300 cursor-not-allowed">
              Previous
            </span>
          )}
          
          <span className="text-sm font-bold text-zinc-500">
            Page {pageNumber} of {Math.max(1, Math.ceil(totalPolls / take))}
          </span>

          {hasNextPage ? (
            <Link
              href={`/?page=${pageNumber + 1}`}
              className="px-4 py-2 bg-white border-2 border-zinc-200 hover:border-indigo-500 hover:text-indigo-600 rounded-xl font-bold text-zinc-600 transition-colors"
            >
              Next
            </Link>
          ) : (
            <span className="px-4 py-2 bg-zinc-50 border-2 border-zinc-100 rounded-xl font-bold text-zinc-300 cursor-not-allowed">
              Next
            </span>
          )}
        </div>
      </section>

      {/* 4. Final CTA */}
      <section className="py-24 text-center px-4">
        <h2 className="text-3xl font-black text-zinc-900 mb-8">Ready to ask your audience?</h2>
        <Link
          href="/polls/new"
          className="inline-flex bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-full items-center justify-center space-x-2 text-lg transition-transform active:scale-95 shadow-md shadow-indigo-200"
        >
          <Sparkles className="h-5 w-5" />
          <span>Create your own poll</span>
        </Link>
      </section>

      {/* Developer Login Console - Moved to bottom, less prominent */}
      {!session && (
        <section className="max-w-3xl mx-auto px-4 pb-12 w-full opacity-60 hover:opacity-100 transition-opacity">
          <div className="pt-8 border-t border-zinc-100">
            <p className="text-center text-xs text-zinc-400 font-bold mb-4 uppercase tracking-widest">Developer Access</p>
            <DevLoginConsole />
          </div>
        </section>
      )}
    </div>
  );
}
