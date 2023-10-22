import { AppBskyFeedPost, Facet } from "@atproto/api";
import { Tweet } from "@the-convocation/twitter-scraper";

export type MastodonPost = {
  tweet: Tweet;
  status: string;
  username: string;
  inReplyToId: string | undefined;
};

export type BlueskyPost = {
  tweet: Tweet;
  status: string;
  username: string;
  facets?: Facet[];
  quotePost?: { uri: string; cid: string; value: AppBskyFeedPost.Record };
  replyPost?: { uri: string; cid: string; value: AppBskyFeedPost.Record };
};

export type Post = {
  mastodon: null | MastodonPost;
  bluesky: null | BlueskyPost;
};
