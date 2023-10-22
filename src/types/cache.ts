import { Platform } from "./platform.js";

export type Cache = Record<
  string,
  {
    [Platform.MASTODON]?: MastodonCache;
    [Platform.BLUESKY]?: BlueskyCache;
  }
>;

export type MastodonCache = string;
export type BlueskyCache = {
  cid: string;
  rkey: string;
};
export type CompleteCache = Record<string, Cache>;
