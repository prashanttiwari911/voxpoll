"use client";

import { ChevronRight, BookOpen, ExternalLink, Play } from "lucide-react";
import { useState } from "react";

interface Tutorial {
  title: string;
  description: string;
  duration: string;
  thumbnail: string;       // AI-generated local image
  tag: string;
  tagColor: string;
  youtubeSearch: string;
}

const TUTORIALS: Tutorial[] = [
  {
    title: "How to Join a Live Poll",
    description: "Enter a 5-digit code, scan a QR code, and cast your vote in seconds.",
    duration: "~2 min",
    thumbnail: "/tutorial-join.png",
    tag: "Getting Started",
    tagColor: "bg-indigo-100 text-indigo-700",
    youtubeSearch: "how to join online poll tutorial",
  },
  {
    title: "Create Your First Poll in 60 Seconds",
    description: "Write a question, add options, choose a category, and go live instantly.",
    duration: "~1 min",
    thumbnail: "/tutorial-create.png",
    tag: "Creating Polls",
    tagColor: "bg-emerald-100 text-emerald-700",
    youtubeSearch: "how to create an online poll tutorial",
  },
  {
    title: "Share Polls & Read Live Analytics",
    description: "Use QR codes and poll codes to gather responses, then explore demographic charts.",
    duration: "~3 min",
    thumbnail: "/tutorial-analytics.png",
    tag: "Analytics",
    tagColor: "bg-violet-100 text-violet-700",
    youtubeSearch: "online poll analytics results tutorial",
  },
];

export default function TutorialsSection() {
  const [hovered, setHovered] = useState<number | null>(null);

  const openVideo = (search: string) => {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(search)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <section className="py-20 bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 text-xs font-black px-3 py-1.5 rounded-full mb-4 border border-indigo-500/20">
              <BookOpen className="h-3.5 w-3.5" />
              AI-ILLUSTRATED TUTORIALS
            </div>
            <h2 className="text-4xl font-black text-white">Learn VoTI in minutes</h2>
            <p className="text-zinc-400 font-medium mt-2 text-lg">
              Quick visual guides to get you voting, creating, and analyzing like a pro.
            </p>
          </div>
          <a
            href="https://www.youtube.com/results?search_query=online+poll+tutorial"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white border border-zinc-700 hover:border-zinc-500 px-4 py-2 rounded-full transition-all"
          >
            <ExternalLink className="h-4 w-4" />
            More on YouTube
          </a>
        </div>

        {/* Tutorial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TUTORIALS.map((tutorial, i) => (
            <div
              key={tutorial.title}
              className="group relative bg-zinc-800 rounded-3xl overflow-hidden border border-zinc-700 hover:border-indigo-500/60 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer"
              onClick={() => openVideo(tutorial.youtubeSearch)}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
            >
              {/* AI-Generated Thumbnail */}
              <div className="relative h-52 overflow-hidden bg-zinc-700">
                <img
                  src={tutorial.thumbnail}
                  alt={tutorial.title}
                  className={`w-full h-full object-cover transition-all duration-700 ${
                    hovered === i ? "scale-110 opacity-90" : "scale-100 opacity-70"
                  }`}
                  // Fallback to Unsplash if local image not yet copied
                  onError={(e) => {
                    const fallbacks = [
                      "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=70",
                      "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=70",
                      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=70",
                    ];
                    (e.target as HTMLImageElement).src = fallbacks[i];
                  }}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/20 to-transparent" />

                {/* AI Badge */}
                <div className="absolute top-3 left-3 bg-violet-600/90 text-white text-[9px] font-black px-2 py-1 rounded-lg backdrop-blur-sm flex items-center gap-1">
                  ✦ AI Illustrated
                </div>

                {/* Play Button */}
                <div className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${hovered === i ? "opacity-100" : "opacity-80"}`}>
                  <div className={`w-16 h-16 rounded-full bg-red-600 border-2 border-white/30 flex items-center justify-center shadow-xl transition-all duration-300 ${hovered === i ? "scale-110" : "scale-100"}`}>
                    <Play className="h-7 w-7 text-white fill-white ml-1" />
                  </div>
                </div>

                {/* Duration */}
                <div className="absolute bottom-3 right-3 bg-zinc-900/80 text-white text-xs font-bold px-2 py-1 rounded-lg backdrop-blur-sm">
                  {tutorial.duration}
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5">
                <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 ${tutorial.tagColor}`}>
                  {tutorial.tag}
                </span>
                <h3 className={`font-black text-lg leading-snug mb-2 transition-colors ${hovered === i ? "text-indigo-300" : "text-white"}`}>
                  {tutorial.title}
                </h3>
                <p className="text-zinc-400 text-sm font-medium leading-relaxed line-clamp-2">
                  {tutorial.description}
                </p>
                <div className={`mt-4 flex items-center text-sm font-bold transition-colors ${hovered === i ? "text-indigo-300" : "text-indigo-400"}`}>
                  <span>Watch tutorial</span>
                  <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${hovered === i ? "translate-x-1" : ""}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-zinc-600 text-xs font-semibold mt-8">
          Thumbnails are AI-generated. Clicking opens a YouTube search in a new tab.
        </p>
      </div>
    </section>
  );
}
