import { Link } from "react-router";
import { likesApi, subscriptionsApi, usersApi } from "../api/endpoints";
import { useCurrentUser } from "../auth/AuthContext";
import { VideoGrid, VideoRow } from "../components/VideoCard";
import { Avatar, EmptyState, ErrorMessage, PageHeader, PageLoader } from "../components/ui";
import { useAsync } from "../lib/useAsync";

export function LikedVideosPage() {
  const { data, error, loading, reload } = useAsync(() => likesApi.likedVideos(), []);

  return (
    <div>
      <PageHeader title="Liked videos" />
      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : !data?.length ? (
        <EmptyState title="No liked videos yet">Videos you like will show up here.</EmptyState>
      ) : (
        <VideoGrid videos={data} />
      )}
    </div>
  );
}

export function HistoryPage() {
  const { data, error, loading, reload } = useAsync(() => usersApi.history(), []);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Watch history" />
      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : !data?.length ? (
        <EmptyState title="Nothing watched yet">Videos you watch will show up here.</EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          {data.map((video) => (
            <VideoRow key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}

export function SubscriptionsPage() {
  const user = useCurrentUser();
  const { data, error, loading, reload } = useAsync(
    () => subscriptionsApi.subscribedChannels(user._id),
    [user._id],
  );

  return (
    <div>
      <PageHeader title="Subscriptions" />
      {loading ? (
        <PageLoader />
      ) : error ? (
        <ErrorMessage message={error} onRetry={reload} />
      ) : !data?.length ? (
        <EmptyState title="You haven't subscribed to anyone">
          Subscribe to channels to find them here.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {data.map(({ subscribedChannel: channel }) => (
            <Link
              key={channel._id}
              to={`/c/${channel.username}`}
              className="card flex flex-col items-center gap-3 p-5 text-center hover:bg-surface-2"
            >
              <Avatar src={channel.avatar} name={channel.username} size={72} />
              <span className="w-full truncate font-medium">@{channel.username}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
