import type { ReactNode } from "react";
import { Link } from "react-router";
import type { Video } from "../api/types";
import { formatCount, formatDuration, timeAgo } from "../lib/format";
import { Avatar } from "./ui";

export function VideoThumbnail({ video, className = "" }: { video: Video; className?: string }) {
  const duration = formatDuration(video.duration);
  return (
    <div className={`relative aspect-video overflow-hidden rounded-xl bg-surface-2 ${className}`}>
      <img src={video.thumbnail} alt="" loading="lazy" className="size-full object-cover" />
      {duration && (
        <span className="absolute right-1.5 bottom-1.5 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {duration}
        </span>
      )}
      {!video.isPublished && (
        <span className="absolute top-1.5 left-1.5 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          Private
        </span>
      )}
    </div>
  );
}

export function VideoCard({ video }: { video: Video }) {
  const owner = typeof video.owner === "object" ? video.owner : null;
  return (
    <div className="group">
      <Link to={`/watch/${video._id}`}>
        <VideoThumbnail video={video} className="transition-transform group-hover:scale-[1.02]" />
      </Link>
      <div className="mt-3 flex gap-3">
        {owner && (
          <Link to={`/c/${owner.username}`}>
            <Avatar src={owner.avatar} name={owner.username} />
          </Link>
        )}
        <div className="min-w-0">
          <Link to={`/watch/${video._id}`} className="line-clamp-2 font-medium leading-snug">
            {video.title}
          </Link>
          {owner && (
            <Link to={`/c/${owner.username}`} className="mt-1 block text-sm text-muted hover:text-fg">
              {owner.fullName ?? owner.username}
            </Link>
          )}
          <p className="text-sm text-muted">
            {formatCount(video.views)} views · {timeAgo(video.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function VideoGrid({ videos }: { videos: Video[] }) {
  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video._id} video={video} />
      ))}
    </div>
  );
}

/** Horizontal layout used in lists (history, playlists, "up next"). */
export function VideoRow({ video, actions }: { video: Video; actions?: ReactNode }) {
  const owner = typeof video.owner === "object" ? video.owner : null;
  return (
    <div className="flex gap-3">
      <Link to={`/watch/${video._id}`} className="w-40 shrink-0 sm:w-56">
        <VideoThumbnail video={video} />
      </Link>
      <div className="min-w-0 flex-1">
        <Link to={`/watch/${video._id}`} className="line-clamp-2 font-medium leading-snug">
          {video.title}
        </Link>
        {owner && (
          <Link to={`/c/${owner.username}`} className="mt-1 block text-sm text-muted hover:text-fg">
            {owner.fullName ?? owner.username}
          </Link>
        )}
        <p className="text-sm text-muted">
          {formatCount(video.views)} views · {timeAgo(video.createdAt)}
        </p>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
