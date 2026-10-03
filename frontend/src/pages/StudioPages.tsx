import { useState, type FormEvent } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { errorMessage } from "../api/client";
import { dashboardApi, videosApi } from "../api/endpoints";
import type { Video } from "../api/types";
import { UploadIcon } from "../components/icons";
import { VideoThumbnail } from "../components/VideoCard";
import { EmptyState, ErrorMessage, FormError, PageHeader, PageLoader } from "../components/ui";
import { formatCount } from "../lib/format";
import { useAsync } from "../lib/useAsync";

export function StudioPage() {
  const stats = useAsync(() => dashboardApi.stats(), []);
  const videos = useAsync(() => dashboardApi.videos(), []);
  const [rowError, setRowError] = useState<string | null>(null);

  async function togglePublish(video: Video) {
    setRowError(null);
    try {
      const updated = await videosApi.togglePublish(video._id);
      videos.setData((list) => (list ?? []).map((v) => (v._id === video._id ? { ...v, isPublished: updated.isPublished } : v)));
    } catch (err) {
      setRowError(errorMessage(err));
    }
  }

  async function remove(video: Video) {
    if (!confirm(`Delete “${video.title}”? This can't be undone.`)) return;
    setRowError(null);
    try {
      await videosApi.remove(video._id);
      videos.setData((list) => (list ?? []).filter((v) => v._id !== video._id));
      stats.reload();
    } catch (err) {
      setRowError(errorMessage(err));
    }
  }

  const tiles: ({ label: string; value: number } | null)[] = stats.data
    ? [
        { label: "Videos", value: stats.data.totalVideos },
        { label: "Total views", value: stats.data.totalViews },
        { label: "Subscribers", value: stats.data.totalSubscribers },
        { label: "Likes", value: stats.data.totalLikes },
      ]
    : [null, null, null, null]; // placeholders while loading

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Channel dashboard"
        actions={
          <Link to="/upload" className="btn-primary">
            <UploadIcon /> Upload video
          </Link>
        }
      />

      {stats.error ? (
        <ErrorMessage message={stats.error} onRetry={stats.reload} />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {tiles.map((tile, i) => (
            <div key={tile?.label ?? i} className="card p-5">
              <p className="text-sm text-muted">{tile?.label ?? " "}</p>
              <p className="mt-1 text-3xl font-semibold tabular-nums">{tile ? formatCount(tile.value) : "–"}</p>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-10 mb-4 text-lg font-semibold">Your videos</h2>
      <FormError message={rowError} />
      {videos.loading ? (
        <PageLoader />
      ) : videos.error ? (
        <ErrorMessage message={videos.error} onRetry={videos.reload} />
      ) : !videos.data?.length ? (
        <EmptyState title="You haven't uploaded anything yet">
          <Link to="/upload" className="font-medium text-accent hover:underline">Upload your first video</Link>
        </EmptyState>
      ) : (
        <div className="card mt-3 divide-y divide-border">
          {videos.data.map((video) => (
            <div key={video._id} className="flex flex-wrap items-center gap-4 p-4">
              <Link to={`/watch/${video._id}`} className="w-36 shrink-0">
                <VideoThumbnail video={video} />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/watch/${video._id}`} className="line-clamp-1 font-medium">{video.title}</Link>
                <p className="line-clamp-1 text-sm text-muted">{video.description || "No description"}</p>
                <p className="mt-1 text-xs text-muted">
                  {formatCount(video.views)} views · {new Date(video.createdAt).toLocaleDateString()}
                </p>
              </div>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={video.isPublished}
                  onChange={() => togglePublish(video)}
                />
                <span className="relative h-5 w-9 rounded-full bg-border transition-colors peer-checked:bg-accent peer-focus-visible:ring-2 peer-focus-visible:ring-accent/40 after:absolute after:top-0.5 after:left-0.5 after:size-4 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-4" />
                {video.isPublished ? "Public" : "Private"}
              </label>
              <div className="flex gap-2">
                <Link to={`/studio/${video._id}/edit`} className="btn-secondary">Edit</Link>
                <button className="btn-ghost text-danger" onClick={() => remove(video)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FileField({
  id,
  label,
  accept,
  required,
  onFile,
}: {
  id: string;
  label: string;
  accept: string;
  required?: boolean;
  onFile?: (file: File | null) => void;
}) {
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        type="file"
        accept={accept}
        required={required}
        onChange={(e) => onFile?.(e.target.files?.[0] ?? null)}
        className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-4 file:py-2 file:text-sm file:text-fg hover:file:bg-border"
      />
    </div>
  );
}

export function UploadPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setUploading(true);
    try {
      const video = await videosApi.publish(new FormData(e.currentTarget));
      navigate(`/watch/${video._id}`);
    } catch (err) {
      setError(errorMessage(err));
      setUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Upload video" />
      <form onSubmit={submit} className="card flex flex-col gap-5 p-6">
        <FileField id="videoFile" label="Video file" accept="video/*" required />
        <FileField
          id="thumbnail"
          label="Thumbnail"
          accept="image/*"
          required
          onFile={(f) => setThumbPreview(f ? URL.createObjectURL(f) : null)}
        />
        {thumbPreview && <img src={thumbPreview} alt="Thumbnail preview" className="aspect-video w-64 rounded-lg object-cover" />}
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" name="title" className="input" required maxLength={120} />
        </div>
        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" name="description" className="input min-h-32" />
        </div>
        <FormError message={error} />
        <div className="flex items-center justify-end gap-3">
          {uploading && <span className="text-sm text-muted">Uploading — large files can take a while…</span>}
          <button className="btn-primary" disabled={uploading}>
            <UploadIcon /> {uploading ? "Uploading…" : "Publish"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function EditVideoPage() {
  const { videoId = "" } = useParams();
  const navigate = useNavigate();
  // Load from the dashboard list rather than GET /videos/:id, which would count a view.
  const { data: video, error, loading, reload } = useAsync(
    async () => (await dashboardApi.videos()).find((v) => v._id === videoId) ?? null,
    [videoId],
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [thumbPreview, setThumbPreview] = useState<string | null>(null);

  if (loading) return <PageLoader />;
  if (error || !video) return <ErrorMessage message={error ?? "Video not found"} onRetry={reload} />;

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const thumb = form.get("thumbnail");
    if (thumb instanceof File && thumb.size === 0) form.delete("thumbnail");

    setSaveError(null);
    setSaving(true);
    try {
      await videosApi.update(videoId, form);
      navigate("/studio");
    } catch (err) {
      setSaveError(errorMessage(err));
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Edit video" />
      <form onSubmit={submit} className="card flex flex-col gap-5 p-6">
        <img src={thumbPreview ?? video.thumbnail} alt="Current thumbnail" className="aspect-video w-64 rounded-lg object-cover" />
        <FileField
          id="thumbnail"
          label="Replace thumbnail"
          accept="image/*"
          onFile={(f) => setThumbPreview(f ? URL.createObjectURL(f) : null)}
        />
        <div>
          <label className="label" htmlFor="title">Title</label>
          <input id="title" name="title" className="input" required defaultValue={video.title} />
        </div>
        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" name="description" className="input min-h-32" defaultValue={video.description} />
        </div>
        <FormError message={saveError} />
        <div className="flex justify-end gap-2">
          <Link to="/studio" className="btn-ghost">Cancel</Link>
          <button className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Save changes"}</button>
        </div>
      </form>
    </div>
  );
}
