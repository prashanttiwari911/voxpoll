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

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Seed the database if empty
  await seedPollsIfNeeded();

  const polls = await db.poll.findMany({
    where: { status: "PUBLISHED" }, // Only show published polls on home page
    orderBy: { createdAt: "desc" },
    include: {
      creator: { select: { name: true } },
      options: true,
      _count: { select: { votes: true } },
    },
    take: 100,
  });

  // Prepare polls with status for PollsList
  const pollsWithStatus = polls.map((p) => ({ ...p, status: p.status ?? "PUBLISHED" }));

  return (
    <div className="flex-1 flex flex-col pb-16 bg-white">
      {/* 1. Clean Hero Section with Image */}
      <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left space-y-8">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-zinc-900 leading-[1.1]">
              YOUR VOICE.<br />
              <span className="text-indigo-600">YOUR VOTE.</span>
            </h1>

            <p className="text-xl sm:text-2xl text-zinc-500 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
              Ask questions, collect opinions, and discover what people think in real time.
            </p>

            <div className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-4 pt-6">
              <Link
                href="/polls/new"
                className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-8 py-4 rounded-full flex items-center justify-center space-x-2 text-lg transition-transform active:scale-95 shadow-lg shadow-zinc-900/20"
              >
                <span>Create a Poll</span>
                <ArrowRight className="h-5 w-5 ml-1" />
              </Link>
              <Link
                href="/join"
                className="w-full sm:w-auto bg-white border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 text-zinc-900 font-bold px-8 py-4 rounded-full flex items-center justify-center space-x-2 text-lg transition-all active:scale-95"
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
              className="relative z-10 w-full h-[500px] object-cover rounded-3xl shadow-2xl border-4 border-white transform hover:scale-[1.02] transition-transform duration-500"
            />
            {/* Floating UI Elements for interactivity feel */}
            <div className="absolute -left-8 top-12 bg-white p-4 rounded-2xl shadow-xl z-20 animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">👍</div>
                <div>
                  <div className="h-2 w-16 bg-slate-200 rounded-full mb-2"></div>
                  <div className="h-2 w-10 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="absolute -right-8 bottom-24 bg-white p-4 rounded-2xl shadow-xl z-20 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">📊</div>
                <div>
                  <div className="h-2 w-20 bg-slate-200 rounded-full mb-2"></div>
                  <div className="h-2 w-12 bg-slate-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Three-Step Workflow */}
      <section className="py-20 bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-zinc-900">How VoTI Works</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {/* Step 1 */}
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-white border-2 border-zinc-200 rounded-2xl flex items-center justify-center shadow-sm text-2xl font-black text-zinc-400">
                1
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Create</h3>
              <p className="text-zinc-500 font-medium px-4">
                Create a question and add your voting options in seconds.
              </p>
            </div>
            
            {/* Step 2 */}
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-white border-2 border-indigo-100 rounded-2xl flex items-center justify-center shadow-sm text-2xl font-black text-indigo-400">
                2
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Share & Vote</h3>
              <p className="text-zinc-500 font-medium px-4">
                Share a link, poll code, or QR code and collect votes instantly.
              </p>
            </div>
            
            {/* Step 3 */}
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-white border-2 border-emerald-100 rounded-2xl flex items-center justify-center shadow-sm text-2xl font-black text-emerald-400">
                3
              </div>
              <h3 className="text-xl font-bold text-zinc-900">Discover</h3>
              <p className="text-zinc-500 font-medium px-4">
                See live results update in real-time with demographic insights.
              </p>
            </div>
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
