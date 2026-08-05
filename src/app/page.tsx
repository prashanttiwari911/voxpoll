import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { db } from "@/lib/db";
import PollsList from "./PollsList";
import DevLoginConsole from "./DevLoginConsole";
import Link from "next/link";
import { ArrowRight, Sparkles, LayoutDashboard, PlusCircle, CheckCircle } from "lucide-react";

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
    <div className="flex-1 flex flex-col space-y-12 pb-16">
      {/* 1. Hero Banner */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white py-16 px-4 relative overflow-hidden rounded-b-[40px] shadow-lg">
        {/* Decorative Circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl transform translate-x-20 -translate-y-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-pink-500/15 rounded-full blur-3xl transform -translate-x-20 translate-y-20 pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-1 bg-white/10 backdrop-blur-sm border border-white/20 py-1.5 px-4 rounded-full text-xs font-extrabold text-amber-200">
            <Sparkles className="h-4 w-4 text-amber-300 animate-spin" />
            <span>Interactive Real-time Polling App</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Make Your Voice Heard on <span className="underline decoration-pink-400 decoration-wavy">VoTI</span>
          </h1>

          <p className="text-base sm:text-lg text-indigo-100 max-w-2xl mx-auto leading-relaxed">
            Create custom polls, cast anonymous votes, and view live geographic & age demographics.
            Explore polls about Education, Sports, Politics, and Books!
          </p>

          {session ? (
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                href="/polls/new"
                className="bg-pink-500 hover:bg-pink-600 text-white font-black px-6 py-3.5 rounded-2xl flex items-center space-x-2 text-sm shadow-lg shadow-pink-500/25 transform active:scale-95 transition-all"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Launch a Poll</span>
              </Link>
              <Link
                href="/dashboard"
                className="bg-white/10 hover:bg-white/20 border border-white/25 text-white font-black px-6 py-3.5 rounded-2xl flex items-center space-x-2 text-sm transform active:scale-95 transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>My Dashboard</span>
              </Link>
            </div>
          ) : (
            <div className="pt-4">
              <a
                href="#auth-section"
                className="bg-white text-indigo-700 hover:bg-indigo-50 font-black px-7 py-3.5 rounded-2xl inline-flex items-center space-x-2 text-sm shadow-lg shadow-black/10 transform active:scale-95 transition-all"
              >
                <span>Get Started Now</span>
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          )}
        </div>
      </section>

      {/* 2. Main Portal */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left panel: Polls List */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-slate-800">Explore Active Polls</h2>
              <span className="text-xs bg-indigo-50 text-indigo-600 font-extrabold py-1 px-3 rounded-full border border-indigo-100">
                {pollsWithStatus.length} Polls
              </span>
            </div>
            
            <PollsList initialPolls={pollsWithStatus} />
          </div>

          {/* Right panel: Authentication Portal */}
          {!session && (
            <div className="lg:col-span-4 lg:sticky lg:top-20">
              <DevLoginConsole />
            </div>
          )}

          {session && (
            <div className="lg:col-span-4 lg:sticky lg:top-20 bg-white border border-indigo-50 rounded-3xl p-6 shadow-md text-center space-y-4">
              <div className="flex justify-center">
                <div className="bg-emerald-100 text-emerald-800 p-3 rounded-full">
                  <CheckCircle className="h-6 w-6" />
                </div>
              </div>
              <h3 className="font-extrabold text-slate-800 text-lg">You are signed in!</h3>
              <p className="text-xs text-slate-500">
                Logged in as <strong>{session.user.name}</strong> ({session.user.email}). Complete your profile details to participate in analytics!
              </p>
              
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  href="/dashboard"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition-colors"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2.5 rounded-xl text-xs transition-colors"
                >
                  Edit Profile Details
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
