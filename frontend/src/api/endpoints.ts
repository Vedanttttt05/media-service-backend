import { api } from "./client";
import type {
  ChannelProfile,
  ChannelStats,
  ChannelSummary,
  Comment,
  Playlist,
  Tweet,
  User,
  Video,
} from "./types";

export const usersApi = {
  register: (form: FormData) => api<User>("/users/register", { method: "POST", body: form }),
  // The backend matches either field, so send the identifier as both.
  login: (identifier: string, password: string) =>
    api<{ user: User }>("/users/login", {
      method: "POST",
      body: { email: identifier, username: identifier, password },
    }),
  logout: () => api<unknown>("/users/logout", { method: "POST" }),
  current: () => api<User>("/users/current-user"),
  updateDetails: (details: { fullName: string; email: string; username: string }) =>
    api<User>("/users/update-account", { method: "PATCH", body: details }),
  changePassword: (currentPassword: string, newPassword: string) =>
    api<unknown>("/users/change-password", {
      method: "POST",
      body: { currentPassword, newPassword },
    }),
  updateAvatar: (form: FormData) => api<User>("/users/avatar", { method: "PATCH", body: form }),
  updateCoverImage: (form: FormData) =>
    api<User>("/users/cover-image", { method: "PATCH", body: form }),
  channel: (username: string) => api<ChannelProfile>(`/users/c/${encodeURIComponent(username)}`),
  history: () => api<Video[]>("/users/history"),
};

export interface VideoQuery {
  page?: number;
  limit?: number;
  query?: string;
  sortBy?: string;
  sortType?: "asc" | "desc";
  userId?: string;
}

export const videosApi = {
  list: (query: VideoQuery = {}) => api<Video[]>("/videos", { query: { ...query } }),
  get: (videoId: string) => api<Video>(`/videos/${videoId}`),
  publish: (form: FormData) => api<Video>("/videos", { method: "POST", body: form }),
  update: (videoId: string, form: FormData) =>
    api<Video>(`/videos/${videoId}`, { method: "PATCH", body: form }),
  remove: (videoId: string) => api<unknown>(`/videos/${videoId}`, { method: "DELETE" }),
  togglePublish: (videoId: string) =>
    api<Video>(`/videos/toggle/publish/${videoId}`, { method: "PATCH" }),
};

export const commentsApi = {
  list: (videoId: string, page = 1, limit = 10) =>
    api<Comment[]>(`/comments/video/${videoId}`, { query: { page, limit } }),
  add: (videoId: string, content: string) =>
    api<Comment>(`/comments/video/${videoId}`, { method: "POST", body: { content } }),
  update: (commentId: string, content: string) =>
    api<Comment>(`/comments/${commentId}`, { method: "PATCH", body: { content } }),
  remove: (commentId: string) => api<unknown>(`/comments/${commentId}`, { method: "DELETE" }),
};

export const likesApi = {
  toggleVideo: (videoId: string) =>
    api<{ liked: boolean }>(`/likes/toggle/v/${videoId}`, { method: "POST" }),
  likedVideos: () => api<Video[]>("/likes/videos"),
};

export const subscriptionsApi = {
  toggle: (channelId: string) => api<unknown>(`/subscriptions/c/${channelId}`, { method: "POST" }),
  subscribedChannels: (subscriberId: string) =>
    api<{ subscribedChannel: ChannelSummary }[]>(`/subscriptions/u/${subscriberId}`),
};

export const playlistsApi = {
  create: (name: string, description: string) =>
    api<Playlist>("/playlist", { method: "POST", body: { name, description } }),
  byUser: (userId: string) => api<Playlist[]>(`/playlist/user/${userId}`),
  get: (playlistId: string) => api<Playlist>(`/playlist/${playlistId}`),
  update: (playlistId: string, name: string, description: string) =>
    api<Playlist>(`/playlist/${playlistId}`, { method: "PATCH", body: { name, description } }),
  remove: (playlistId: string) => api<unknown>(`/playlist/${playlistId}`, { method: "DELETE" }),
  addVideo: (videoId: string, playlistId: string) =>
    api<Playlist>(`/playlist/add/${videoId}/${playlistId}`, { method: "PATCH" }),
  removeVideo: (videoId: string, playlistId: string) =>
    api<Playlist>(`/playlist/remove/${videoId}/${playlistId}`, { method: "PATCH" }),
};

export const tweetsApi = {
  byUser: (userId: string, page = 1, limit = 20) =>
    api<Tweet[]>(`/tweets/user/${userId}`, { query: { page, limit } }),
  create: (content: string) => api<Tweet>("/tweets", { method: "POST", body: { content } }),
  update: (tweetId: string, content: string) =>
    api<Tweet>(`/tweets/${tweetId}`, { method: "PATCH", body: { content } }),
  remove: (tweetId: string) => api<unknown>(`/tweets/${tweetId}`, { method: "DELETE" }),
};

export const dashboardApi = {
  stats: () => api<ChannelStats>("/dashboard/stats"),
  videos: (page = 1, limit = 50) => api<Video[]>("/dashboard/videos", { query: { page, limit } }),
};
