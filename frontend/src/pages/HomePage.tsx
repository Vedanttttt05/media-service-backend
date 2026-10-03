import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { errorMessage } from "../api/client";
import { videosApi, type VideoQuery } from "../api/endpoints";
import type { Video } from "../api/types";
import { VideoGrid } from "../components/VideoCard";
import { EmptyState, ErrorMessage, PageLoader, Spinner } from "../components/ui";

const PAGE_SIZE = 12;

const SORTS: Record<string, { label: string; sortBy: string; sortType: "asc" | "desc" }> = {
  latest: { label: "Latest", sortBy: "createdAt", sortType: "desc" },
  popular: { label: "Most viewed", sortBy: "views", sortType: "desc" },
  oldest: { label: "Oldest", sortBy: "createdAt", sortType: "asc" },
};

export function HomePage() {
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const sort = SORTS[params.get("sort") ?? ""] ? (params.get("sort") as string) : "latest";

  const [videos, setVideos] = useState<Video[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Reset to page 1 when the search or sort changes.
  useEffect(() => {
    setVideos([]);
    setPage(1);
  }, [q, sort]);

  useEffect(() => {
    let cancelled = false;
    const query: VideoQuery = {
      page,
      limit: PAGE_SIZE,
      query: q || undefined,
      sortBy: SORTS[sort].sortBy,
      sortType: SORTS[sort].sortType,
    };
    setLoading(true);
    setError(null);
    videosApi
      .list(query)
      .then((batch) => {
        if (cancelled) return;
        setVideos((prev) => (page === 1 ? batch : [...prev, ...batch]));
        setHasMore(batch.length === PAGE_SIZE);
      })
      .catch((err: unknown) => !cancelled && setError(errorMessage(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [q, sort, page, attempt]);

  function setSort(value: string) {
    const next = new URLSearchParams(params);
    if (value === "latest") next.delete("sort");
    else next.set("sort", value);
    setParams(next);
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold">{q ? `Results for “${q}”` : "Recommended"}</h1>
        <div className="flex gap-2" role="group" aria-label="Sort videos">
          {Object.entries(SORTS).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setSort(key)}
              className={key === sort ? "btn bg-fg text-bg" : "btn-secondary"}
              aria-pressed={key === sort}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && videos.length === 0 ? (
        <ErrorMessage message={error} onRetry={() => setAttempt((a) => a + 1)} />
      ) : loading && videos.length === 0 ? (
        <PageLoader />
      ) : videos.length === 0 ? (
        <EmptyState title={q ? "No videos match your search" : "No videos yet"}>
          {q ? "Try different keywords." : "Be the first to upload one."}
        </EmptyState>
      ) : (
        <>
          <VideoGrid videos={videos} />
          <div className="mt-10 flex justify-center">
            {loading ? (
              <Spinner />
            ) : error ? (
              <ErrorMessage message={error} onRetry={() => setAttempt((a) => a + 1)} />
            ) : (
              hasMore && (
                <button className="btn-secondary" onClick={() => setPage((p) => p + 1)}>
                  Load more
                </button>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
