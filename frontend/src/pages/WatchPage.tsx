import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { errorMessage } from "../api/client";
import { likesApi, playlistsApi, subscriptionsApi, usersApi, videosApi } from "../api/endpoints";
import type { Playlist, UserSummary } from "../api/types";
import { useCurrentUser } from "../auth/AuthContext";
import { Comments } from "../components/Comments";
import { CheckIcon, ListIcon, PlusIcon, ThumbUpIcon } from "../components/icons";
import { VideoRow } from "../components/VideoCard";
import { Avatar, ErrorMessage, PageLoader, Spinner } from "../components/ui";
import { formatCount, plural, timeAgo } from "../lib/format";
import { useAsync } from "../lib/useAsync";

export function WatchPage() {
  const { videoId = "" } = useParams();
  const { data: video, error, loading, setData: setVideo, reload } = useAsync(
    () => videosApi.get(videoId),
    [videoId],
  );
  const [descriptionOpen, setDescriptionOpen] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);

  useEffect(() => setDescriptionOpen(false), [videoId]);

  if (loading) return <PageLoader />;
  if (error || !video) return <ErrorMessage message={error ?? "Video not found"} onRetry={reload} />;

  const owner = typeof video.owner === "object" ? video.owner : null;

  async function toggleLike() {
    setLikeBusy(true);
    try {
      const { liked } = await likesApi.toggleVideo(videoId);
      setVideo((v) => ({ ...v!, isLiked: liked, likes: (v!.likes ?? 0) + (liked ? 1 : -1) }));
    } finally {
      setLikeBusy(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-[1600px] flex-col gap-6 xl:flex-row">
      <div className="min-w-0 flex-1">
        <video
          key={video._id}
          src={video.videoFile}
          poster={video.thumbnail}
          controls
          autoPlay
          className="aspect-video w-full rounded-xl bg-black"
        />
        <h1 className="mt-4 text-xl font-semibold">{video.title}</h1>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          {owner && <ChannelBadge owner={owner} />}
          <div className="flex gap-2">
            <button
              className={video.isLiked ? "btn bg-fg text-bg" : "btn-secondary"}
              onClick={toggleLike}
              disabled={likeBusy}
              aria-pressed={!!video.isLiked}
            >
              <ThumbUpIcon /> {formatCount(video.likes)}
            </button>
            <SaveToPlaylist videoId={video._id} />
          </div>
        </div>

        <div className="mt-4 rounded-xl bg-surface-2 p-3 text-sm">
          <p className="font-medium">
            {plural(video.views, "view")} · {timeAgo(video.createdAt)}
          </p>
          {video.description && (
            <>
              <p className={`mt-2 whitespace-pre-wrap ${descriptionOpen ? "" : "line-clamp-2"}`}>
                {video.description}
              </p>
              {video.description.length > 150 && (
                <button className="mt-1 font-medium" onClick={() => setDescriptionOpen((o) => !o)}>
                  {descriptionOpen ? "Show less" : "Show more"}
                </button>
              )}
            </>
          )}
        </div>

        <Comments videoId={video._id} />
      </div>

      <aside className="w-full shrink-0 xl:w-[400px]">
        <h2 className="mb-3 font-medium">More videos</h2>
        <UpNext currentId={video._id} />
      </aside>
    </div>
  );
}

function ChannelBadge({ owner }: { owner: UserSummary }) {
  const me = useCurrentUser();
  const { data: channel, setData: setChannel } = useAsync(
    () => usersApi.channel(owner.username),
    [owner.username],
  );
  const [busy, setBusy] = useState(false);
  const isMe = me._id === owner._id;

  async function toggleSubscribe() {
    if (!channel) return;
    setBusy(true);
    try {
      await subscriptionsApi.toggle(channel._id);
      const subscribed = !channel.isSubscribedToChannel;
      setChannel({
        ...channel,
        isSubscribedToChannel: subscribed,
        subscribersCount: channel.subscribersCount + (subscribed ? 1 : -1),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Link to={`/c/${owner.username}`}>
        <Avatar src={owner.avatar} name={owner.username} size={40} />
      </Link>
      <div>
        <Link to={`/c/${owner.username}`} className="font-medium">
          {channel?.fullName ?? owner.username}
        </Link>
        <p className="text-xs text-muted">
          {channel ? plural(channel.subscribersCount, "subscriber") : " "}
        </p>
      </div>
      {!isMe && channel && (
        <button
          className={channel.isSubscribedToChannel ? "btn-secondary ml-2" : "btn ml-2 bg-fg text-bg"}
          onClick={toggleSubscribe}
          disabled={busy}
        >
          {channel.isSubscribedToChannel ? "Subscribed" : "Subscribe"}
        </button>
      )}
    </div>
  );
}

function SaveToPlaylist({ videoId }: { videoId: string }) {
  const me = useCurrentUser();
  const [open, setOpen] = useState(false);
  const [playlists, setPlaylists] = useState<Playlist[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    playlistsApi.byUser(me._id).then(setPlaylists, (err) => setError(errorMessage(err)));
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open, me._id]);

  const contains = (p: Playlist) => p.videos.some((v) => (typeof v === "string" ? v : v._id) === videoId);

  async function toggle(p: Playlist) {
    setBusyId(p._id);
    setError(null);
    try {
      const updated = contains(p)
        ? await playlistsApi.removeVideo(videoId, p._id)
        : await playlistsApi.addVideo(videoId, p._id);
      setPlaylists((list) => list?.map((x) => (x._id === p._id ? updated : x)) ?? null);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  async function create() {
    const name = newName.trim();
    if (!name) return;
    setBusyId("new");
    setError(null);
    try {
      const created = await playlistsApi.create(name, "");
      const updated = await playlistsApi.addVideo(videoId, created._id);
      setPlaylists((list) => [...(list ?? []), updated]);
      setNewName("");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button className="btn-secondary" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <ListIcon /> Save
      </button>
      {open && (
        <div className="card absolute right-0 z-10 mt-2 w-72 p-3 shadow-lg">
          <p className="mb-2 text-sm font-medium">Save to playlist</p>
          {error && <p className="mb-2 text-xs text-danger">{error}</p>}
          {!playlists ? (
            <Spinner className="mx-auto my-3" />
          ) : (
            <ul className="max-h-60 overflow-y-auto">
              {playlists.map((p) => (
                <li key={p._id}>
                  <button
                    className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-surface-2 disabled:opacity-50"
                    onClick={() => toggle(p)}
                    disabled={busyId !== null}
                  >
                    <span
                      className={`flex size-5 shrink-0 items-center justify-center rounded border ${
                        contains(p) ? "border-accent bg-accent text-white" : "border-border"
                      }`}
                    >
                      {contains(p) && <CheckIcon width={14} height={14} />}
                    </span>
                    <span className="truncate">{p.name}</span>
                  </button>
                </li>
              ))}
              {playlists.length === 0 && <li className="px-2 py-1 text-sm text-muted">No playlists yet.</li>}
            </ul>
          )}
          <form
            className="mt-2 flex gap-2 border-t border-border pt-3"
            onSubmit={(e) => {
              e.preventDefault();
              void create();
            }}
          >
            <input
              className="input py-1.5"
              placeholder="New playlist name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              aria-label="New playlist name"
            />
            <button className="btn-primary px-3" disabled={!newName.trim() || busyId !== null} aria-label="Create playlist">
              <PlusIcon />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function UpNext({ currentId }: { currentId: string }) {
  const { data, loading } = useAsync(() => videosApi.list({ limit: 12 }), []);
  if (loading) return <Spinner className="mx-auto" />;
  const others = (data ?? []).filter((v) => v._id !== currentId);
  if (!others.length) return <p className="text-sm text-muted">No other videos yet.</p>;
  return (
    <div className="flex flex-col gap-3">
      {others.map((video) => (
        <VideoRow key={video._id} video={video} />
      ))}
    </div>
  );
}
