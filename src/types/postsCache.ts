import { Platform } from "./platform.js";

export type MastodonCacheChunk = string;
export type BlueskyCacheChunk = {
  cid: string;
  rkey: string;
};

export type BlueskyCacheChunkWithUri = BlueskyCacheChunk & { uri: string };

export type MastodonCache = MastodonCacheChunk[];
export type BlueskyCache = BlueskyCacheChunk[];

export type PostsCache = Record<
  string,
  {
    [Platform.MASTODON]?: MastodonCache;
    [Platform.BLUESKY]?: BlueskyCache;
  }
>;
export type ProfileCache = {
  avatar: string;
  banner: string;
};

export type InstanceCache = {
  id: string;
};

export type Cache = {
  version: string;
  instance: InstanceCache;
  profile: ProfileCache;
  posts: PostsCache;
};
