import { useState, type FormEvent } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { errorMessage } from "../api/client";
import { playlistsApi, subscriptionsApi, tweetsApi, usersApi, videosApi } from "../api/endpoints";
import type { ChannelProfile, Tweet } from "../api/types";
import { useCurrentUser } from "../auth/AuthContext";
import { PlaylistCard } from "../components/PlaylistCard";
import { VideoGrid } from "../components/VideoCard";
import { Avatar, EmptyState, ErrorMessage, FormError, PageLoader } from "../components/ui";
import { formatCount, plural, timeAgo } from "../lib/format";
import { useAsync } from "../lib/useAsync";

const TABS = ["videos", "playlists", "posts"] as const;
type Tab = (typeof TABS)[number];

export function ChannelPage() {
  const { username = "" } = useParams();
  const me = useCurrentUser();
  const [params, setParams] = useSearchParams();
  const tab: Tab = TABS.includes(params.get("tab") as Tab) ? (params.get("tab") as Tab) : "videos";

  const { data: channel, error, loading, setData: setChannel, reload } = useAsync(
    () => usersApi.channel(username),
    [username],
  );
  const [busy, setBusy] = useState(false);

  if (loading) return <PageLoader />;
  if (error || !channel) return <ErrorMessage message={error ?? "Channel not found"} onRetry={reload} />;

  const isMe = channel._id === me._id;

  async function toggleSubscribe(current: ChannelProfile) {
    setBusy(true);
    try {
      await subscriptionsApi.toggle(current._id);
      const subscribed = !current.isSubscribedToChannel;
      setChannel({
        ...current,
        isSubscribedToChannel: subscribed,
        subscribersCount: current.subscribersCount + (subscribed ? 1 : -1),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="aspect-[6/1] min-h-28 overflow-hidden rounded-2xl bg-gradient-to-r from-accent/70 to-surface-2">
        {channel.coverImage && <img src={channel.coverImage} alt="" className="size-full object-cover" />}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-5">
        <Avatar src={channel.avatar} name={channel.username} size={96} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">{channel.fullName}</h1>
          <p className="text-sm text-muted">
            @{channel.username} · {plural(channel.subscribersCount, "subscriber")} ·{" "}
            {formatCount(channel.channelsSubscribedToCount)} subscribed
          </p>
        </div>
        {isMe ? (
          <div className="flex gap-2">
            <Link to="/settings" className="btn-secondary">Customize channel</Link>
            <Link to="/studio" className="btn-secondary">Manage videos</Link>
          </div>
        ) : (
          <button
            className={channel.isSubscribedToChannel ? "btn-secondary" : "btn bg-fg text-bg"}
            onClick={() => toggleSubscribe(channel)}
            disabled={busy}
          >
            {channel.isSubscribedToChannel ? "Subscribed" : "Subscribe"}
          </button>
        )}
      </div>

      <div className="mt-6 flex gap-6 border-b border-border" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setParams(t === "videos" ? {} : { tab: t })}
            className={`-mb-px border-b-2 pb-3 text-sm font-medium capitalize ${
              tab === t ? "border-fg text-fg" : "border-transparent text-muted hover:text-fg"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="py-6">
        {tab === "videos" && <ChannelVideos channelId={channel._id} />}
        {tab === "playlists" && <ChannelPlaylists channelId={channel._id} />}
        {tab === "posts" && <ChannelPosts channel={channel} isMe={isMe} />}
      </div>
    </div>
  );
}

function ChannelVideos({ channelId }: { channelId: string }) {
  const { data, error, loading, reload } = useAsync(
    () => videosApi.list({ userId: channelId, limit: 48 }),
    [channelId],
  );
  if (loading) return <PageLoader />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;
  if (!data?.length) return <EmptyState title="No videos yet" />;
  return <VideoGrid videos={data} />;
}

function ChannelPlaylists({ channelId }: { channelId: string }) {
  const { data, error, loading, reload } = useAsync(() => playlistsApi.byUser(channelId), [channelId]);
  if (loading) return <PageLoader />;
  if (error) return <ErrorMessage message={error} onRetry={reload} />;
  if (!data?.length) return <EmptyState title="No playlists yet" />;
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((p) => (
        <PlaylistCard key={p._id} playlist={p} />
      ))}
    </div>
  );
}

function ChannelPosts({ channel, isMe }: { channel: ChannelProfile; isMe: boolean }) {
  const { data, error, loading, setData, reload } = useAsync(() => tweetsApi.byUser(channel._id), [channel._id]);
  const [draft, setDraft] = useState("");
  const [postError, setPostError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  async function post(e: FormEvent) {
    e.preventDefault();
    setPosting(true);
    setPostError(null);
    try {
      const tweet = await tweetsApi.create(draft.trim());
      setData((prev) => [tweet, ...(prev ?? [])]);
      setDraft("");
    } catch (err) {
      setPostError(errorMessage(err));
    } finally {
      setPosting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      {isMe && (
        <form onSubmit={post} className="card mb-6 p-4">
          <textarea
            className="input min-h-24"
            placeholder="Share an update with your subscribers"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            aria-label="New post"
          />
          <FormError message={postError} />
          <div className="mt-3 flex justify-end">
            <button className="btn-primary" disabled={posting || !draft.trim()}>Post</button>
          </div>
        </form>
      )}
      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : !data?.length ? (
        <EmptyState title="No posts yet" />
      ) : (
        <ul className="flex flex-col gap-4">
          {data.map((tweet) => (
            <TweetItem
              key={tweet._id}
              tweet={tweet}
              channel={channel}
              isMe={isMe}
              onChange={(t) => setData((prev) => (prev ?? []).map((x) => (x._id === t._id ? t : x)))}
              onDelete={() => setData((prev) => (prev ?? []).filter((x) => x._id !== tweet._id))}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function TweetItem({
  tweet,
  channel,
  isMe,
  onChange,
  onDelete,
}: {
  tweet: Tweet;
  channel: ChannelProfile;
  isMe: boolean;
  onChange: (t: Tweet) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(tweet.content);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    try {
      await tweetsApi.update(tweet._id, text.trim());
      onChange({ ...tweet, content: text.trim() });
      setEditing(false);
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function remove() {
    if (!confirm("Delete this post?")) return;
    try {
      await tweetsApi.remove(tweet._id);
      onDelete();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <li className="card flex gap-3 p-4">
      <Avatar src={channel.avatar} name={channel.username} />
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-medium">{channel.fullName}</span>{" "}
          <span className="text-muted">{timeAgo(tweet.createdAt)}</span>
        </p>
        {editing ? (
          <div className="mt-2">
            <textarea className="input" value={text} onChange={(e) => setText(e.target.value)} aria-label="Edit post" />
            <div className="mt-2 flex justify-end gap-2">
              <button className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
              <button className="btn-primary" onClick={save} disabled={!text.trim()}>Save</button>
            </div>
          </div>
        ) : (
          <p className="mt-1 whitespace-pre-wrap break-words">{tweet.content}</p>
        )}
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
        {isMe && !editing && (
          <div className="mt-2 flex gap-3 text-xs text-muted">
            <button className="hover:text-fg" onClick={() => { setText(tweet.content); setEditing(true); }}>Edit</button>
            <button className="hover:text-danger" onClick={remove}>Delete</button>
          </div>
        )}
      </div>
    </li>
  );
}
