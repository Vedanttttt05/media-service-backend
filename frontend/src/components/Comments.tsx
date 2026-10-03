import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router";
import { errorMessage } from "../api/client";
import { commentsApi } from "../api/endpoints";
import type { Comment } from "../api/types";
import { useCurrentUser } from "../auth/AuthContext";
import { timeAgo } from "../lib/format";
import { Avatar, Spinner } from "./ui";

const PAGE_SIZE = 10;

export function Comments({ videoId }: { videoId: string }) {
  const me = useCurrentUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    setComments([]);
    setPage(1);
  }, [videoId]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    commentsApi
      .list(videoId, page, PAGE_SIZE)
      .then((batch) => {
        if (cancelled) return;
        setComments((prev) => (page === 1 ? batch : [...prev, ...batch]));
        setHasMore(batch.length === PAGE_SIZE);
      })
      .catch((err: unknown) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [videoId, page]);

  async function post(e: FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    setPosting(true);
    setError(null);
    try {
      const created = await commentsApi.add(videoId, content);
      // The create endpoint returns the owner as an id; fill it in from the current user.
      setComments((prev) => [{ ...created, owner: me }, ...prev]);
      setDraft("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setPosting(false);
    }
  }

  return (
    <section className="mt-6" aria-label="Comments">
      <h2 className="mb-4 font-semibold">Comments</h2>
      <form onSubmit={post} className="mb-6 flex gap-3">
        <Avatar src={me.avatar} name={me.username} />
        <div className="flex-1">
          <textarea
            className="input min-h-[44px] resize-y"
            rows={1}
            placeholder="Add a comment…"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="Add a comment"
          />
          {draft && (
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setDraft("")}>
                Cancel
              </button>
              <button className="btn-primary" disabled={posting || !draft.trim()}>
                Comment
              </button>
            </div>
          )}
        </div>
      </form>

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      <ul className="flex flex-col gap-5">
        {comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            isMine={comment.owner?._id === me._id}
            onChange={(updated) =>
              setComments((prev) => prev.map((c) => (c._id === updated._id ? updated : c)))
            }
            onDelete={() => setComments((prev) => prev.filter((c) => c._id !== comment._id))}
          />
        ))}
      </ul>

      {loading ? (
        <Spinner className="mx-auto mt-6" />
      ) : hasMore ? (
        <button className="btn-ghost mt-4" onClick={() => setPage((p) => p + 1)}>
          Show more comments
        </button>
      ) : (
        comments.length === 0 && <p className="text-sm text-muted">No comments yet. Start the conversation.</p>
      )}
    </section>
  );
}

function CommentItem({
  comment,
  isMine,
  onChange,
  onDelete,
}: {
  comment: Comment;
  isMine: boolean;
  onChange: (c: Comment) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(comment.content);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const owner = comment.owner;

  async function save() {
    setBusy(true);
    setError(null);
    try {
      await commentsApi.update(comment._id, text.trim());
      onChange({ ...comment, content: text.trim() });
      setEditing(false);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!confirm("Delete this comment?")) return;
    setBusy(true);
    try {
      await commentsApi.remove(comment._id);
      onDelete();
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <li className="flex gap-3">
      <Link to={owner ? `/c/${owner.username}` : "#"}>
        <Avatar src={owner?.avatar} name={owner?.username ?? "?"} />
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-medium">@{owner?.username ?? "unknown"}</span>{" "}
          <span className="text-muted">{timeAgo(comment.createdAt)}</span>
        </p>
        {editing ? (
          <div className="mt-1">
            <textarea className="input" value={text} onChange={(e) => setText(e.target.value)} aria-label="Edit comment" />
            <div className="mt-2 flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn-primary" onClick={save} disabled={busy || !text.trim()}>Save</button>
            </div>
          </div>
        ) : (
          <p className="mt-0.5 text-sm whitespace-pre-wrap break-words">{comment.content}</p>
        )}
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        {isMine && !editing && (
          <div className="mt-1 flex gap-3 text-xs text-muted">
            <button className="hover:text-fg" onClick={() => { setText(comment.content); setEditing(true); }}>Edit</button>
            <button className="hover:text-danger" onClick={remove} disabled={busy}>Delete</button>
          </div>
        )}
      </div>
    </li>
  );
}
