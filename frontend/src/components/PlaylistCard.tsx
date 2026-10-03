import { Link } from "react-router";
import type { Playlist } from "../api/types";
import { plural, timeAgo } from "../lib/format";
import { ListIcon } from "./icons";

export function PlaylistCard({ playlist }: { playlist: Playlist }) {
  const first = playlist.videos[0];
  const cover = typeof first === "object" ? first.thumbnail : null;

  return (
    <Link to={`/playlist/${playlist._id}`} className="group block">
      <div className="relative aspect-video overflow-hidden rounded-xl bg-surface-2">
        {cover ? (
          <img src={cover} alt="" className="size-full object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-muted">
            <ListIcon width={40} height={40} />
          </div>
        )}
        <span className="absolute right-1.5 bottom-1.5 flex items-center gap-1 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          <ListIcon width={14} height={14} /> {plural(playlist.videos.length, "video")}
        </span>
      </div>
      <p className="mt-2 font-medium group-hover:underline">{playlist.name}</p>
      <p className="text-sm text-muted">Updated {timeAgo(playlist.updatedAt)}</p>
    </Link>
  );
}
