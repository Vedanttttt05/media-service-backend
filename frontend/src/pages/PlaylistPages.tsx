import { useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { errorMessage } from "../api/client";
import { playlistsApi } from "../api/endpoints";
import type { Video } from "../api/types";
import { useCurrentUser } from "../auth/AuthContext";
import { CloseIcon, PlusIcon } from "../components/icons";
import { PlaylistCard } from "../components/PlaylistCard";
import { VideoRow } from "../components/VideoCard";
import { EmptyState, ErrorMessage, FormError, PageHeader, PageLoader } from "../components/ui";
import { plural, timeAgo } from "../lib/format";
import { useAsync } from "../lib/useAsync";

export function PlaylistsPage() {
  const me = useCurrentUser();
  const { data, error, loading, setData, reload } = useAsync(() => playlistsApi.byUser(me._id), [me._id]);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function create(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      const playlist = await playlistsApi.create(name.trim(), description.trim());
      setData((prev) => [playlist, ...(prev ?? [])]);
      setName("");
      setDescription("");
      setCreating(false);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Your playlists"
        actions={
          !creating && (
            <button className="btn-primary" onClick={() => setCreating(true)}>
              <PlusIcon /> New playlist
            </button>
          )
        }
      />
      {creating && (
        <form onSubmit={create} className="card mb-8 flex max-w-lg flex-col gap-3 p-4">
          <div>
            <label className="label" htmlFor="pl-name">Name</label>
            <input id="pl-name" className="input" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label" htmlFor="pl-desc">Description</label>
            <textarea id="pl-desc" className="input" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <FormError message={formError} />
          <div className="flex justify-end gap-2">
            <button type="button" className="btn-ghost" onClick={() => setCreating(false)}>Cancel</button>
            <button className="btn-primary" disabled={saving || !name.trim()}>Create</button>
          </div>
        </form>
      )}
      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : !data?.length ? (
        <EmptyState title="No playlists yet">Create one, or use “Save” on any video.</EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {data.map((p) => (
            <PlaylistCard key={p._id} playlist={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export function PlaylistDetailPage() {
  const { playlistId = "" } = useParams();
  const me = useCurrentUser();
  const navigate = useNavigate();
  const { data: playlist, error, loading, setData, reload } = useAsync(
    () => playlistsApi.get(playlistId),
    [playlistId],
  );
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);

  if (loading) return <PageLoader />;
  if (error || !playlist) return <ErrorMessage message={error ?? "Playlist not found"} onRetry={reload} />;

  const isMine = playlist.owner === me._id;
  const videos = playlist.videos.filter((v): v is Video => typeof v === "object");

  async function save(e: FormEvent) {
    e.preventDefault();
    setActionError(null);
    try {
      await playlistsApi.update(playlistId, name.trim(), description.trim());
      setData((p) => ({ ...p!, name: name.trim(), description: description.trim() }));
      setEditing(false);
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  async function remove() {
    if (!confirm(`Delete the playlist “${playlist!.name}”?`)) return;
    try {
      await playlistsApi.remove(playlistId);
      navigate("/playlists");
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  async function removeVideo(videoId: string) {
    setActionError(null);
    try {
      await playlistsApi.removeVideo(videoId, playlistId);
      setData((p) => ({
        ...p!,
        videos: p!.videos.filter((v) => (typeof v === "string" ? v : v._id) !== videoId),
      }));
    } catch (err) {
      setActionError(errorMessage(err));
    }
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 lg:flex-row">
      <div className="card h-fit w-full shrink-0 overflow-hidden lg:sticky lg:top-20 lg:w-80">
        <div className="aspect-video bg-surface-2">
          {videos[0] && <img src={videos[0].thumbnail} alt="" className="size-full object-cover" />}
        </div>
        <div className="p-4">
          {editing ? (
            <form onSubmit={save} className="flex flex-col gap-3">
              <input className="input" required value={name} onChange={(e) => setName(e.target.value)} aria-label="Playlist name" />
              <textarea className="input" value={description} onChange={(e) => setDescription(e.target.value)} aria-label="Playlist description" />
              <div className="flex justify-end gap-2">
                <button type="button" className="btn-ghost" onClick={() => setEditing(false)}>Cancel</button>
                <button className="btn-primary" disabled={!name.trim()}>Save</button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="text-xl font-semibold">{playlist.name}</h1>
              <p className="mt-1 text-sm text-muted">
                {plural(videos.length, "video")} · Updated {timeAgo(playlist.updatedAt)}
              </p>
              {playlist.description && <p className="mt-3 text-sm whitespace-pre-wrap">{playlist.description}</p>}
              {isMine && (
                <div className="mt-4 flex gap-2">
                  <button
                    className="btn-secondary"
                    onClick={() => {
                      setName(playlist.name);
                      setDescription(playlist.description ?? "");
                      setEditing(true);
                    }}
                  >
                    Edit
                  </button>
                  <button className="btn-ghost text-danger" onClick={remove}>Delete</button>
                </div>
              )}
            </>
          )}
          <div className="mt-3">
            <FormError message={actionError} />
          </div>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        {videos.length === 0 ? (
          <EmptyState title="This playlist is empty">Use “Save” on a video to add it here.</EmptyState>
        ) : (
          <ol className="flex flex-col gap-4">
            {videos.map((video, i) => (
              <li key={video._id} className="flex items-center gap-3">
                <span className="w-5 text-right text-sm text-muted">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <VideoRow
                    video={video}
                    actions={
                      isMine && (
                        <button
                          className="btn-ghost size-9 p-0"
                          onClick={() => removeVideo(video._id)}
                          aria-label={`Remove ${video.title} from playlist`}
                        >
                          <CloseIcon />
                        </button>
                      )
                    }
                  />
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
