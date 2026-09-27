"use client";

import { useState } from "react";
import {
  HelpCircle, MessageSquare, Mail, Send, ChevronDown, ChevronUp,
  CheckCircle, BookOpen, Zap, Shield, LifeBuoy, Star, AlertCircle, PhoneCall,
} from "lucide-react";

// ── FAQ Data ──────────────────────────────────────────────────────────────────
const FAQS = [
  {
    question: "How do I join a poll?",
    answer: "Simply click on any direct poll link shared with you, or scan the QR code provided by the presenter. You will be taken directly to the voting screen.",
  },
  {
    question: "Do I need an account to vote?",
    answer: "Yes, a free account is required to vote. This ensures each person can only vote once and allows us to provide accurate demographic analytics. Sign in via the homepage.",
  },
  {
    question: "Why do I need to complete my profile before voting?",
    answer: "VoTI collects anonymous demographic data (age and region) to power the insights charts. Your data is never shared publicly — it only appears as aggregate statistics in the poll results.",
  },
  {
    question: "How do I create a poll?",
    answer: "Click 'Create Poll' in the navbar (you must be signed in). Fill in your question, add 2–10 options, choose a category, and optionally set a closing date. Click 'Create Poll' to publish it live instantly.",
  },
  {
    question: "Can I edit my poll after publishing?",
    answer: "You can edit the question, description, and closing date of polls that have zero votes. Once votes are cast, editing is disabled to protect data integrity.",
  },
  {
    question: "What is Presenter Mode?",
    answer: "Presenter Mode opens a fullscreen view designed for projectors and large displays. It shows the live results, the poll code, and a QR code simultaneously — perfect for live events and classrooms.",
  },
  {
    question: "How does the QR Code sharing work?",
    answer: "Click the 'Share' button on any poll page to see the QR code. Audience members can scan it with their phone camera to jump straight to the voting screen.",
  },
  {
    question: "Is my vote anonymous?",
    answer: "Yes. Votes are stored and shown in aggregate only. The poll creator can never see who voted for which option — only the totals and anonymous demographic breakdowns.",
  },
];

// ── Contact Methods ────────────────────────────────────────────────────────────
const CONTACT_METHODS = [
  {
    icon: Mail,
    title: "Email Support",
    detail: "support@voti.app",
    description: "Get a response within 24–48 hours on working days.",
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    action: "mailto:support@voti.app",
    actionLabel: "Send Email",
  },
  {
    icon: PhoneCall,
    title: "Community Forum",
    detail: "community.voti.app",
    description: "Ask questions, share tips, and connect with other VoTI users.",
    color: "bg-violet-50 text-violet-600 border-violet-100",
    action: "#",
    actionLabel: "Visit Forum",
  },
  {
    icon: LifeBuoy,
    title: "Live Chat",
    detail: "Mon–Fri, 9am–6pm IST",
    description: "Chat with our support team in real time for urgent queries.",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    action: "#",
    actionLabel: "Start Chat",
  },
];

// ── FAQ Accordion Item ─────────────────────────────────────────────────────────
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-2xl transition-all ${open ? "border-indigo-200 bg-indigo-50/30" : "border-zinc-200 bg-white"}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-left px-6 py-5 gap-4"
      >
        <span className={`font-bold text-base ${open ? "text-indigo-700" : "text-zinc-800"}`}>{question}</span>
        {open
          ? <ChevronUp className="h-5 w-5 text-indigo-500 shrink-0" />
          : <ChevronDown className="h-5 w-5 text-zinc-400 shrink-0" />
        }
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-zinc-600 font-medium leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

// ── Feedback Form ──────────────────────────────────────────────────────────────
function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [type, setType] = useState("general");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitted(true);
      setSubmitting(false);
    }, 1200);
  };

  if (submitted) {
    return (
      <div className="text-center py-16 px-4 space-y-4">
        <div className="mx-auto w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </div>
        <h3 className="text-2xl font-black text-zinc-900">Thank you! 🙏</h3>
        <p className="text-zinc-500 font-medium max-w-sm mx-auto">Your feedback has been submitted. We read every message and use it to improve VoTI for everyone.</p>
        <button
          onClick={() => { setSubmitted(false); setRating(0); setMessage(""); setEmail(""); }}
          className="mt-4 text-sm font-bold text-indigo-600 hover:underline"
        >
          Submit another response
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {/* Star Rating */}
      <div>
        <label className="block text-sm font-black text-zinc-800 mb-3">How would you rate your VoTI experience?</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110 active:scale-95"
            >
              <Star
                className={`h-10 w-10 transition-colors ${
                  star <= (hoverRating || rating)
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-200"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* Feedback Type */}
      <div>
        <label className="block text-sm font-black text-zinc-800 mb-3">Type of feedback</label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "general", label: "💬 General" },
            { value: "bug", label: "🐛 Bug Report" },
            { value: "feature", label: "💡 Feature Request" },
            { value: "compliment", label: "❤️ Compliment" },
          ].map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => setType(t.value)}
              className={`text-sm font-bold px-4 py-2 rounded-full border-2 transition-all ${
                type === t.value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                  : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-black text-zinc-800 mb-2">Your message <span className="text-red-500">*</span></label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what you think, what you'd like to see, or any issue you encountered..."
          rows={5}
          required
          className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-200 focus:outline-none focus:border-indigo-500 transition-all text-zinc-800 font-medium resize-none"
        />
        <p className="text-xs text-zinc-400 mt-1 text-right">{message.length}/1000</p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-black text-zinc-800 mb-2">Email <span className="text-zinc-400 font-normal">(optional, for follow-up)</span></label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-200 focus:outline-none focus:border-indigo-500 transition-all text-zinc-800 font-medium"
        />
      </div>

      <button
        type="submit"
        disabled={submitting || !message.trim()}
        className="w-full bg-zinc-900 hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-base transition-all active:scale-[0.98]"
      >
        {submitting ? (
          <span>Submitting…</span>
        ) : (
          <>
            <Send className="h-5 w-5" />
            <span>Submit Feedback</span>
          </>
        )}
      </button>
    </form>
  );
}

// ── Contact Form ──────────────────────────────────────────────────────────────
function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => { setSubmitted(true); setSubmitting(false); }, 1200);
  };

  if (submitted) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="mx-auto w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-10 w-10 text-indigo-600" />
        </div>
        <h3 className="text-2xl font-black text-zinc-900">Message Sent! ✉️</h3>
        <p className="text-zinc-500 font-medium max-w-sm mx-auto">We've received your message and will get back to you within 24–48 hours.</p>
        <button onClick={() => setSubmitted(false)} className="text-sm font-bold text-indigo-600 hover:underline">Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-black text-zinc-800 mb-2">Name <span className="text-red-500">*</span></label>
          <input required value={name} onChange={e => setName(e.target.value)} placeholder="Your full name"
            className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-200 focus:outline-none focus:border-indigo-500 font-medium text-zinc-800 transition-all" />
        </div>
        <div>
          <label className="block text-sm font-black text-zinc-800 mb-2">Email <span className="text-red-500">*</span></label>
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
            className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-200 focus:outline-none focus:border-indigo-500 font-medium text-zinc-800 transition-all" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-black text-zinc-800 mb-2">Subject <span className="text-red-500">*</span></label>
        <input required value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Issue with my poll, Feature request..."
          className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-200 focus:outline-none focus:border-indigo-500 font-medium text-zinc-800 transition-all" />
      </div>
      <div>
        <label className="block text-sm font-black text-zinc-800 mb-2">Message <span className="text-red-500">*</span></label>
        <textarea required value={message} onChange={e => setMessage(e.target.value)} rows={5} placeholder="Describe your issue or question in detail..."
          className="w-full px-4 py-3 rounded-2xl border-2 border-zinc-200 focus:outline-none focus:border-indigo-500 font-medium text-zinc-800 resize-none transition-all" />
      </div>
      <button type="submit" disabled={submitting}
        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 text-base transition-all active:scale-[0.98]">
        {submitting ? <span>Sending…</span> : <><Mail className="h-5 w-5" /><span>Send Message</span></>}
      </button>
    </form>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
type TabKey = "help" | "contact" | "feedback";

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: "help",     label: "Help Center", icon: HelpCircle },
  { key: "contact",  label: "Contact Us",  icon: Mail },
  { key: "feedback", label: "Feedback",    icon: MessageSquare },
];

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("help");
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Hero Banner */}
      <section className="bg-linear-to-br from-zinc-900 to-indigo-950 text-white py-20 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-1/4 w-64 h-64 rounded-full bg-indigo-500 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-violet-500 blur-3xl" />
        </div>
        <div className="relative max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest text-indigo-300 mb-4">
            <LifeBuoy className="h-4 w-4" /> Support Center
          </div>
          <h1 className="text-5xl sm:text-6xl font-black leading-tight">How can we help?</h1>
          <p className="text-xl text-zinc-300 font-medium">Find answers, get support, or share your thoughts with us.</p>
        </div>
      </section>

      {/* Tab Navigation */}
      <div className="border-b border-zinc-200 bg-white sticky top-16 z-40">
        <div className="max-w-5xl mx-auto px-4 flex gap-0">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-black border-b-2 transition-all ${
                  activeTab === tab.key
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-zinc-500 hover:text-zinc-800 hover:border-zinc-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-12">

        {/* ── Help Center ── */}
        {activeTab === "help" && (
          <div className="space-y-12">
            {/* Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
              {[
                { 
                  icon: Zap,      
                  title: "Quick Start",   
                  desc: "Get up and running in under 2 minutes.",            
                  color: "bg-amber-50 border-amber-100 text-amber-600",
                  content: "To get started, simply click 'Sign In' at the top right of the page. You can create a free account or use our 1-click Demo Login. Once signed in, click 'Create Poll' to ask your first question. Share the direct URL link or QR code with your audience to instantly start gathering real-time feedback!" 
                },
                { 
                  icon: BookOpen, 
                  title: "User Guide",    
                  desc: "Full documentation on every VoTI feature.",         
                  color: "bg-indigo-50 border-indigo-100 text-indigo-600",
                  content: "1. Creating Polls: Use the rich text editor to format your questions. Add up to 10 options.\n2. Analytics: The dashboard provides real-time geographic and age-based insights.\n3. Moderation: As a creator, you can close polls early or delete them from the admin panel." 
                },
                { 
                  icon: Shield,   
                  title: "Privacy & Data", 
                  desc: "How we collect and protect your information.",     
                  color: "bg-emerald-50 border-emerald-100 text-emerald-600",
                  content: "We take your privacy seriously. VoTI only collects basic demographic data (such as Age and Region) to generate aggregated poll insights. We never sell your personal information to third parties, and all geographic data is strictly anonymized before being plotted on the demographic maps." 
                },
              ].map((card) => {
                const Icon = card.icon;
                const isExpanded = expandedCard === card.title;
                return (
                  <div 
                    key={card.title} 
                    onClick={() => setExpandedCard(isExpanded ? null : card.title)}
                    className={`rounded-3xl border p-6 ${card.color} cursor-pointer hover:shadow-md transition-all ${isExpanded ? 'ring-2 ring-indigo-400 bg-white dark:bg-zinc-800' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Icon className="h-7 w-7" />
                      {isExpanded ? <ChevronUp className="h-5 w-5 opacity-50" /> : <ChevronDown className="h-5 w-5 opacity-50" />}
                    </div>
                    <h3 className="font-black text-zinc-900 text-lg mb-1">{card.title}</h3>
                    <p className="text-zinc-500 text-sm font-medium mb-3">{card.desc}</p>
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-black/10 animate-in slide-in-from-top-2">
                        <p className="text-zinc-800 text-sm font-medium whitespace-pre-wrap leading-relaxed">
                          {card.content}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* FAQ */}
            <div>
              <h2 className="text-2xl font-black text-zinc-900 mb-6 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-indigo-500" /> Frequently Asked Questions
              </h2>
              <div className="space-y-3">
                {FAQS.map((faq) => (
                  <FAQItem key={faq.question} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Contact Us ── */}
        {activeTab === "contact" && (
          <div className="space-y-12">
            {/* Contact Methods */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {CONTACT_METHODS.map((method) => {
                const Icon = method.icon;
                return (
                  <div key={method.title} className={`rounded-3xl border-2 p-6 ${method.color} flex flex-col gap-3`}>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-white/60">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="font-black text-zinc-900 text-lg">{method.title}</h3>
                    </div>
                    <p className="font-black text-zinc-800 text-sm">{method.detail}</p>
                    <p className="text-zinc-600 text-sm font-medium flex-1">{method.description}</p>
                    <a href={method.action} className="inline-block mt-2 text-sm font-black underline underline-offset-2 hover:no-underline transition-all">
                      {method.actionLabel} →
                    </a>
                  </div>
                );
              })}
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-black text-zinc-900 mb-8 flex items-center gap-2">
                <Mail className="h-6 w-6 text-indigo-500" /> Send us a message
              </h2>
              <ContactForm />
            </div>
          </div>
        )}

        {/* ── Feedback ── */}
        {activeTab === "feedback" && (
          <div className="space-y-8">
            <div className="text-center max-w-xl mx-auto">
              <div className="mx-auto w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-amber-500 fill-amber-400" />
              </div>
              <h2 className="text-3xl font-black text-zinc-900 mb-2">Share your thoughts</h2>
              <p className="text-zinc-500 font-medium">Your feedback directly shapes the future of VoTI. We read every submission.</p>
            </div>
            <FeedbackForm />
          </div>
        )}
      </div>
    </div>
  );
}
