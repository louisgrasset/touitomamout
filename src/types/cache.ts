import { Platform } from "./platform.js";

export type MastodonCacheChunk = string;
export type BlueskyCacheChunk = {
  cid: string;
  rkey: string;
};

export type BlueskyCacheChunkWithUri = BlueskyCacheChunk & { uri: string };

export type MastodonCache = MastodonCacheChunk[];
export type BlueskyCache = BlueskyCacheChunk[];

export type Cache = Record<
  string,
  {
    [Platform.MASTODON]?: MastodonCache;
    [Platform.BLUESKY]?: BlueskyCache;
  }
>;

export type CompleteCache = Record<string, Cache>;
