export interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  coverImage?: string;
  createdAt: string;
}

/** The subset of user fields the backend populates onto videos and comments. */
export interface UserSummary {
  _id: string;
  username: string;
  avatar: string;
  fullName?: string;
}

export interface Video {
  _id: string;
  title: string;
  description: string;
  videoFile: string;
  thumbnail: string;
  duration?: number;
  views: number;
  likes?: number;
  isLiked?: boolean;
  isPublished: boolean;
  /** Populated on some endpoints, a bare id on others. */
  owner: UserSummary | string;
  createdAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  video: string;
  owner: UserSummary;
  createdAt: string;
  updatedAt: string;
}

export interface Playlist {
  _id: string;
  name: string;
  description?: string;
  /** Ids from the list endpoint, full videos from the detail endpoint. */
  videos: (string | Video)[];
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface Tweet {
  _id: string;
  content: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChannelProfile {
  _id: string;
  fullName: string;
  username: string;
  email: string;
  avatar: string;
  coverImage?: string;
  subscribersCount: number;
  channelsSubscribedToCount: number;
  isSubscribedToChannel: boolean;
  createdAt: string;
}

export interface ChannelStats {
  totalVideos: number;
  totalViews: number;
  totalSubscribers: number;
  totalLikes: number;
}

export interface ChannelSummary {
  _id: string;
  username: string;
  avatar: string;
  createdAt: string;
}
