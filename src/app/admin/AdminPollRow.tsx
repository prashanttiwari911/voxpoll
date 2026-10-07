"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import Link from "next/link";
import { Trash2, ExternalLink } from "lucide-react";
import { adminDeletePoll } from "./actions";

interface AdminPollRowProps {
  poll: {
    id: string;
    question: string;
    category: string;
    status: string;
    createdAt: Date;
    creator: { name: string | null; email: string | null };
    _count: { votes: number; comments: number };
  };
}

const STATUS_STYLES: Record<string, string> = {
  PUBLISHED: "bg-emerald-100 text-emerald-700",
  DRAFT: "bg-slate-100 text-slate-500",
  CLOSED: "bg-red-100 text-red-600",
};

export default function AdminPollRow({ poll }: AdminPollRowProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState({ confirmDelete: false, error: null as string | null });
  const handleDelete = () => {
    if (!state.confirmDelete) return setState({ ...state, confirmDelete: true });
    startTransition(async () => {
      const res = await adminDeletePoll(poll.id);
      if (!res.success) setState({ ...state, error: res.error || "Failed.", confirmDelete: false });
      else router.refresh();
    });
  };
  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-6 py-3 max-w-xs">
        <Link href={`/polls/${poll.id}`} className="font-semibold text-slate-800 hover:text-indigo-600 transition-colors line-clamp-2 flex items-start gap-1.5 group">
          {poll.question}
          <ExternalLink className="h-3 w-3 mt-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Link>
        <span className="text-[11px] text-slate-400">{poll.category} · {new Date(poll.createdAt).toLocaleDateString()}</span>
        {state.error && <span className="block text-[11px] text-red-500 mt-0.5">{state.error}</span>}
      </td>
      <td className="px-4 py-3 text-xs text-slate-500">
        <span className="font-semibold text-slate-700">{poll.creator.name || "—"}</span>
        <span className="block text-[10px]">{poll.creator.email}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[poll.status] ?? STATUS_STYLES.DRAFT}`}>{poll.status}</span>
      </td>
      <td className="px-4 py-3 text-center text-xs font-bold text-slate-600">{poll._count.votes}</td>
      <td className="px-4 py-3 text-center text-xs font-bold text-slate-600">{poll._count.comments}</td>
      <td className="px-4 py-3 text-center">
        <button onClick={handleDelete} disabled={isPending} className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all disabled:opacity-50 ${state.confirmDelete ? "bg-red-600 text-white hover:bg-red-700" : "bg-red-50 text-red-600 hover:bg-red-100"}`}>
          {isPending ? "Deleting…" : state.confirmDelete ? "Confirm" : <span className="flex items-center gap-1"><Trash2 className="h-3 w-3" /> Delete</span>}
        </button>
        {state.confirmDelete && !isPending && <button onClick={() => setState({ ...state, confirmDelete: false })} className="text-[10px] text-slate-400 hover:text-slate-600 block mx-auto mt-1">Cancel</button>}
      </td>
    </tr>
  );
}
