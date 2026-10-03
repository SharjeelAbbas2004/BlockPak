'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  MessageCircle,
  ThumbsUp,
  Flag,
  Reply,
  Loader2,
  Clock3,
  CheckCircle2,
  X,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

export interface CommentNode {
  id: string;
  content: string;
  likes: number;
  createdAt: string;
  userName: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  replies: CommentNode[];
}

interface CommentsSectionProps {
  articleId: string;
  articleSlug: string;
}

function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase() || 'R';
}

function CommentCard({
  comment,
  depth,
  onReply,
  onLike,
  onReport,
  liked,
  reported,
}: {
  comment: CommentNode;
  depth: number;
  onReply: (id: string) => void;
  onLike: (id: string) => void;
  onReport: (id: string) => void;
  liked: boolean;
  reported: boolean;
}) {
  const pending = comment.status === 'PENDING';
  return (
    <div className={cn('flex gap-3', depth > 0 && 'ml-4 border-l-2 border-border pl-4 sm:ml-6')}>
      <div
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent/15 text-sm font-bold text-accent"
      >
        {initials(comment.userName)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-zinc-100">{comment.userName}</span>
          <time className="text-xs text-muted" dateTime={comment.createdAt}>
            {formatDate(comment.createdAt)}
          </time>
          {pending && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-300">
              <Clock3 className="h-3 w-3" /> Awaiting moderation
            </span>
          )}
        </div>
        <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-relaxed text-zinc-300">
          {comment.content}
        </p>
        {!pending && (
          <div className="mt-2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => onLike(comment.id)}
              disabled={liked}
              aria-label={liked ? 'You liked this comment' : 'Like this comment'}
              aria-pressed={liked}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors disabled:opacity-70',
                liked ? 'text-accent' : 'text-muted hover:bg-surface hover:text-zinc-200',
              )}
            >
              <ThumbsUp className={cn('h-3.5 w-3.5', liked && 'fill-current')} />
              {comment.likes > 0 && comment.likes}
            </button>
            {depth === 0 && (
              <button
                type="button"
                onClick={() => onReply(comment.id)}
                aria-label="Reply to this comment"
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface hover:text-zinc-200"
              >
                <Reply className="h-3.5 w-3.5" /> Reply
              </button>
            )}
            <button
              type="button"
              onClick={() => onReport(comment.id)}
              disabled={reported}
              aria-label={reported ? 'Comment reported' : 'Report this comment'}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors disabled:opacity-70',
                reported ? 'text-emerald-400' : 'text-muted hover:bg-surface hover:text-zinc-200',
              )}
            >
              {reported ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Flag className="h-3.5 w-3.5" />}
              {reported ? 'Reported' : 'Report'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentsSection({ articleId, articleSlug }: CommentsSectionProps) {
  void articleId;
  const { status } = useSession();
  const [comments, setComments] = useState<CommentNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [content, setContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [replying, setReplying] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/articles/${encodeURIComponent(articleSlug)}/comments`)
      .then((res) => {
        if (!res.ok) throw new Error('failed');
        return res.json() as Promise<{ comments: CommentNode[] }>;
      })
      .then((data) => {
        if (!cancelled) setComments(data.comments);
      })
      .catch(() => {
        if (!cancelled) setLoadError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [articleSlug]);

  function insertComment(node: CommentNode) {
    if (node.status === 'PENDING' || !node.replies) {
      // Pending comments (or replies) show at the top of the thread so the
      // author sees them immediately with the moderation note.
      setComments((prev) => [{ ...node, replies: node.replies ?? [] }, ...prev]);
      return;
    }
    setComments((prev) => [...prev, node]);
  }

  async function submitComment(e: FormEvent) {
    e.preventDefault();
    const text = content.trim();
    if (!text || posting) return;
    setPosting(true);
    setPostError('');
    try {
      const res = await fetch(`/api/articles/${encodeURIComponent(articleSlug)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      });
      const data = (await res.json()) as { comment?: CommentNode; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Could not post your comment.');
      if (data.comment) insertComment(data.comment);
      setContent('');
    } catch (err) {
      setPostError(err instanceof Error ? err.message : 'Could not post your comment.');
    } finally {
      setPosting(false);
    }
  }

  async function submitReply(e: FormEvent) {
    e.preventDefault();
    const text = replyContent.trim();
    if (!text || !replyTo || replying) return;
    setReplying(true);
    try {
      const res = await fetch(`/api/articles/${encodeURIComponent(articleSlug)}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text, parentId: replyTo }),
      });
      const data = (await res.json()) as { comment?: CommentNode; error?: string };
      if (!res.ok) throw new Error(data.error ?? 'Could not post your reply.');
      if (data.comment) {
        const reply = { ...data.comment, replies: [] };
        setComments((prev) =>
          prev.map((c) => (c.id === replyTo ? { ...c, replies: [...c.replies, reply] } : c)),
        );
      }
      setReplyContent('');
      setReplyTo(null);
    } catch {
      setReplyContent('');
      setReplyTo(null);
    } finally {
      setReplying(false);
    }
  }

  async function likeComment(id: string) {
    if (likedIds.has(id)) return;
    setLikedIds((prev) => new Set(prev).add(id));
    try {
      const res = await fetch(`/api/comments/${encodeURIComponent(id)}/like`, { method: 'POST' });
      if (!res.ok) throw new Error('failed');
      const data = (await res.json()) as { likes: number };
      const bump = (list: CommentNode[]): CommentNode[] =>
        list.map((c) => ({
          ...c,
          likes: c.id === id ? data.likes : c.likes,
          replies: bump(c.replies),
        }));
      setComments((prev) => bump(prev));
    } catch {
      setLikedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  async function reportComment(id: string) {
    if (reportedIds.has(id)) return;
    setReportedIds((prev) => new Set(prev).add(id));
    try {
      await fetch(`/api/comments/${encodeURIComponent(id)}/report`, { method: 'POST' });
    } catch {
      // The report was still recorded locally; the button stays "Reported".
    }
  }

  const totalCount = comments.reduce((n, c) => n + 1 + c.replies.length, 0);
  const replyTarget = replyTo ? comments.find((c) => c.id === replyTo) : undefined;

  return (
    <div>
      <h2 className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-zinc-100">
        <MessageCircle className="h-5 w-5 text-accent" />
        Comments{totalCount > 0 && <span className="text-sm font-medium text-muted">({totalCount})</span>}
      </h2>

      {status === 'unauthenticated' && (
        <div className="mt-4 rounded-xl border border-border bg-surface/60 p-5 text-center">
          <p className="text-sm text-muted">Join the conversation — sign in to leave a comment.</p>
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(`/news/${articleSlug}`)}`}
            className="mt-3 inline-flex items-center justify-center rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-cyan-300"
          >
            Sign in to comment
          </Link>
        </div>
      )}

      {status === 'authenticated' && (
        <form onSubmit={submitComment} className="mt-4">
          <label htmlFor="new-comment" className="sr-only">
            Write a comment
          </label>
          <textarea
            id="new-comment"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="Share your thoughts…"
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-zinc-100 placeholder:text-muted focus:border-accent focus:outline-none"
          />
          {postError && <p className="mt-2 text-sm text-red-300">{postError}</p>}
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-muted">Comments are reviewed before they appear publicly.</p>
            <button
              type="submit"
              disabled={posting || !content.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-black transition-colors hover:bg-cyan-300 disabled:opacity-60"
            >
              {posting && <Loader2 className="h-4 w-4 animate-spin" />}
              {posting ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6 space-y-6">
        {loading && (
          <p className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading comments…
          </p>
        )}
        {loadError && <p className="text-sm text-muted">Comments are unavailable right now.</p>}
        {!loading && !loadError && comments.length === 0 && (
          <p className="text-sm text-muted">No comments yet — be the first to share your thoughts.</p>
        )}
        {comments.map((comment) => (
          <div key={comment.id} className="space-y-4">
            <CommentCard
              comment={comment}
              depth={0}
              onReply={(id) => {
                setReplyTo(id);
                setReplyContent('');
              }}
              onLike={likeComment}
              onReport={reportComment}
              liked={likedIds.has(comment.id)}
              reported={reportedIds.has(comment.id)}
            />
            {comment.replies.map((reply) => (
              <CommentCard
                key={reply.id}
                comment={reply}
                depth={1}
                onReply={() => {}}
                onLike={likeComment}
                onReport={reportComment}
                liked={likedIds.has(reply.id)}
                reported={reportedIds.has(reply.id)}
              />
            ))}
            {replyTo === comment.id && status === 'authenticated' && (
              <form onSubmit={submitReply} className="ml-4 border-l-2 border-border pl-4 sm:ml-6">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-muted">
                    Replying to <span className="text-zinc-300">{replyTarget?.userName}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setReplyTo(null)}
                    aria-label="Cancel reply"
                    className="rounded p-1 text-muted hover:text-zinc-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <label htmlFor={`reply-${comment.id}`} className="sr-only">
                  Write a reply
                </label>
                <textarea
                  id={`reply-${comment.id}`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  rows={2}
                  maxLength={2000}
                  autoFocus
                  placeholder="Write a reply…"
                  className="mt-2 w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-sm text-zinc-100 placeholder:text-muted focus:border-accent focus:outline-none"
                />
                <div className="mt-2 text-right">
                  <button
                    type="submit"
                    disabled={replying || !replyContent.trim()}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-cyan-300 disabled:opacity-60"
                  >
                    {replying && <Loader2 className="h-4 w-4 animate-spin" />}
                    {replying ? 'Posting…' : 'Post reply'}
                  </button>
                </div>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
