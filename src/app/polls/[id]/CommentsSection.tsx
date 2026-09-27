"use client";

import { useState, useTransition } from "react";
import { addComment, deleteComment, toggleCommentLike } from "@/app/actions/comment";
import {
  MessageCircle, Send, AlertCircle, UserCircle2,
  Clock, Heart, Reply, Trash2, ChevronDown, ChevronUp,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export interface CommentData {
  id: string;
  text: string;
  likes: number;
  createdAt: Date | string;
  parentId: string | null;
  user: { name: string | null; image?: string | null; id?: string };
  replies?: CommentData[];
  likedByMe?: boolean;
  sentimentLabel?: string | null;
  sentimentScore?: number | null;
}

interface CommentsSectionProps {
  pollId: string;
  initialComments: CommentData[];
  isLoggedIn: boolean;
  currentUserId?: string;
  currentUserRole?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function timeAgo(date: Date | string): string {
  const diff = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

/** Nest flat comments into a tree (one level deep for display) */
function buildTree(flat: CommentData[]): CommentData[] {
  const map = new Map<string, CommentData>();
  const roots: CommentData[] = [];
  flat.forEach((c) => map.set(c.id, { ...c, replies: [] }));
  map.forEach((c) => {
    if (c.parentId && map.has(c.parentId)) {
      map.get(c.parentId)!.replies!.push(c);
    } else {
      roots.push(c);
    }
  });
  return roots;
}

// ---------------------------------------------------------------------------
// Single comment card (recursive for replies)
// ---------------------------------------------------------------------------
function CommentCard({
  comment,
  pollId,
  isLoggedIn,
  currentUserId,
  currentUserRole,
  depth = 0,
  onOptimisticReply,
  onDelete,
  onLikeToggle,
}: {
  comment: CommentData;
  pollId: string;
  isLoggedIn: boolean;
  currentUserId?: string;
  currentUserRole?: string;
  depth?: number;
  onOptimisticReply: (parentId: string, text: string) => void;
  onDelete: (id: string) => void;
  onLikeToggle: (id: string, liked: boolean, likes: number) => void;
}) {
  const [state, setState] = useState({ showReplyBox: false, showReplies: true, replyText: "", replyError: null as string | null, liked: comment.likedByMe ?? false, likeCount: comment.likes });
  const [isPending, startTransition] = useTransition();

  const canDelete =
    currentUserId === comment.user.id ||
    currentUserRole === "ADMIN" ||
    currentUserRole === "MODERATOR";

  const handleLike = () => {
    if (!isLoggedIn) return;
    const newLiked = !state.liked;
    const newCount = newLiked ? state.likeCount + 1 : state.likeCount - 1;
    setState(s => ({ ...s, liked: newLiked }));
    setState(s => ({ ...s, likeCount: newCount }));
    onLikeToggle(comment.id, newLiked, newCount);
    startTransition(async () => {
      const res = await toggleCommentLike(comment.id);
      if (!res.success) {
        // revert on failure
        setState(s => ({ ...s, liked: !newLiked }));
        setState(s => ({ ...s, likeCount: state.likeCount }));
      }
    });
  };

  const handleReply = async () => {
    if (!state.replyText.trim()) return;
    const res = await addComment(pollId, state.replyText, comment.id);
    if (res.success) {
      onOptimisticReply(comment.id, state.replyText.trim());
      setState(s => ({ ...s, replyText: "" }));
      setState(s => ({ ...s, showReplyBox: false }));
      setState(s => ({ ...s, showReplies: true }));
    } else {
      setState(s => ({ ...s, replyError: res.error || "Could not post reply." }));
    }
  };

  const handleDelete = async () => {
    const res = await deleteComment(comment.id);
    if (res.success) onDelete(comment.id);
  };

  const replyCount = comment.replies?.length ?? 0;

  return (
    <div className={`${depth > 0 ? "ml-8 border-l-2 border-indigo-50 pl-4" : ""}`}>
      <div className="flex items-start space-x-3 bg-white border border-slate-100 rounded-2xl p-3 shadow-sm">
        
        <div className="shrink-0 mt-0.5">
          {comment.user.image ? (
            <img
              src={comment.user.image}
              alt={comment.user.name || "User"}
              className="h-7 w-7 rounded-full border border-slate-100"
            />
          ) : (
            <UserCircle2 className="h-7 w-7 text-slate-300" />
          )}
        </div>

        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-bold text-slate-700">
              {comment.user.name || "Anonymous"}
            </span>
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
              <Clock className="h-2.5 w-2.5" />
              {timeAgo(comment.createdAt)}
            </span>
            {comment.sentimentLabel && (
              <span
                className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  comment.sentimentLabel === "POSITIVE"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : comment.sentimentLabel === "NEGATIVE"
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : "bg-slate-100 text-slate-500 border border-slate-200"
                }`}
                title={`Score: ${comment.sentimentScore}`}
              >
                {comment.sentimentLabel === "POSITIVE" && "😊 Positive"}
                {comment.sentimentLabel === "NEGATIVE" && "😔 Negative"}
                {comment.sentimentLabel === "NEUTRAL" && "😐 Neutral"}
              </span>
            )}
          </div>
          <p className="text-sm text-slate-600 leading-relaxed break-words">{comment.text}</p>

          
          <div className="flex items-center gap-3 mt-2">
            
            <button
              onClick={handleLike}
              disabled={!isLoggedIn || isPending}
              title={isLoggedIn ? (state.liked ? "Unlike" : "Like") : "Sign in to like"}
              className={`flex items-center gap-1 text-[11px] font-semibold transition-colors ${
                state.liked ? "text-rose-500" : "text-slate-400 hover:text-rose-400"
              } disabled:opacity-40`}
            >
              <Heart className={`h-3.5 w-3.5 ${state.liked ? "fill-rose-500" : ""}`} />
              {state.likeCount > 0 && <span>{state.likeCount}</span>}
            </button>

            
            {depth === 0 && isLoggedIn && (
              <button
                onClick={() => setState(s => ({ ...s, showReplyBox: !s.showReplyBox }))}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-indigo-500 transition-colors"
              >
                <Reply className="h-3.5 w-3.5" />
                Reply
              </button>
            )}

            
            {canDelete && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-red-500 transition-colors ml-auto"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          
          {state.showReplyBox && (
            <div className="mt-3 space-y-1.5">
              {state.replyError && (
                <p className="text-[10px] text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {state.replyError}
                </p>
              )}
              <div className="flex gap-2">
                <textarea
                  value={state.replyText}
                  onChange={(e) => setState(s => ({ ...s, replyText: e.target.value }))}
                  placeholder="Write a reply..."
                  maxLength={500}
                  rows={2}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
                />
                <button
                  onClick={handleReply}
                  disabled={!state.replyText.trim()}
                  className="self-end p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-40 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      
      {replyCount > 0 && (
        <div className="mt-2 space-y-2">
          <button
            onClick={() => setState(s => ({ ...s, showReplies: !s.showReplies }))}
            className="flex items-center gap-1 text-[11px] font-semibold text-indigo-500 hover:text-indigo-700 ml-8 mb-1"
          >
            {state.showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {state.showReplies ? "Hide" : "Show"} {replyCount} {replyCount === 1 ? "reply" : "replies"}
          </button>
          {state.showReplies && comment.replies?.map((reply) => (
            <CommentCard
              key={reply.id}
              comment={reply}
              pollId={pollId}
              isLoggedIn={isLoggedIn}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              depth={depth + 1}
              onOptimisticReply={onOptimisticReply}
              onDelete={onDelete}
              onLikeToggle={onLikeToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main CommentsSection
// ---------------------------------------------------------------------------
export default function CommentsSection({
  pollId,
  initialComments,
  isLoggedIn,
  currentUserId,
  currentUserRole,
}: CommentsSectionProps) {
  const [secState, setSecState] = useState({ flatComments: initialComments, text: "", loading: false, error: null as string | null });

  const tree = buildTree(secState.flatComments);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!secState.text.trim()) return;
    setSecState(s => ({ ...s, loading: true }));
    setSecState(s => ({ ...s, error: null }));
    const result = await addComment(pollId, secState.text);
    setSecState(s => ({ ...s, loading: false }));
    if (result.success) {
      const newComment: CommentData = {
        id: result.commentId ?? `temp-${Date.now()}`,
        text: secState.text.trim(),
        createdAt: new Date(),
        likes: 0,
        parentId: null,
        user: { name: "You", id: currentUserId },
        replies: [],
      };
      setSecState(s => ({ ...s, flatComments: [newComment, ...s.flatComments] }));
      setSecState(s => ({ ...s, text: "" }));
    } else {
      setSecState(s => ({ ...s, error: result.error || "Could not post comment." }));
    }
  };

  const handleOptimisticReply = (parentId: string, replyText: string) => {
    const newReply: CommentData = {
      id: `temp-reply-${Date.now()}`,
      text: replyText,
      createdAt: new Date(),
      likes: 0,
      parentId,
      user: { name: "You", id: currentUserId },
    };
    setSecState(s => ({ ...s, flatComments: [...s.flatComments, newReply] }));
  };

  const handleDelete = (id: string) => {
    setSecState(s => ({ ...s, flatComments: s.flatComments.filter((c) => c.id !== id && c.parentId !== id) }));
  };

  const handleLikeToggle = (id: string, liked: boolean, likes: number) => {
    setSecState(s => ({ ...s, flatComments: s.flatComments.map((c) => (c.id === id ? { ...c, likes, likedByMe: liked } : c)) }));
  };

  const totalVisible = secState.flatComments.filter((c) => !c.parentId).length;

  return (
    <section className="space-y-4 mt-8 pt-8 border-t border-slate-100">
      
      <div className="flex items-center space-x-2">
        <MessageCircle className="h-5 w-5 text-indigo-500" />
        <h2 className="text-lg font-black text-slate-800">
          Discussion
          {totalVisible > 0 && (
            <span className="ml-2 text-sm font-semibold text-slate-400">({totalVisible})</span>
          )}
        </h2>
      </div>

      
      {isLoggedIn ? (
        <form onSubmit={handleSubmit} className="space-y-2">
          {secState.error && (
            <div className="flex items-start space-x-2 bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-xl text-xs">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{secState.error}</span>
            </div>
          )}
          <div className="flex gap-2">
            <textarea
              id="comment-input"
              value={secState.text}
              onChange={(e) => setSecState(s => ({ ...s, text: e.target.value }))}
              placeholder="Share your thoughts on this poll..."
              maxLength={500}
              rows={2}
              disabled={secState.loading}
              className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 text-sm text-slate-800 resize-none transition-all"
            />
            <button
              id="comment-submit-btn"
              type="submit"
              disabled={secState.loading || !secState.text.trim()}
              className="self-end flex items-center justify-center p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              title="Post comment"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="text-[10px] text-slate-400 text-right">{secState.text.length}/500</p>
        </form>
      ) : (
        <p className="text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
          🔒 Sign in to join the discussion.
        </p>
      )}

      
      {tree.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-6">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-3">
          {tree.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              pollId={pollId}
              isLoggedIn={isLoggedIn}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              onOptimisticReply={handleOptimisticReply}
              onDelete={handleDelete}
              onLikeToggle={handleLikeToggle}
            />
          ))}
        </div>
      )}
    </section>
  );
}
