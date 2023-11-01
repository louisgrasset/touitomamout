import { AppBskyFeedPost } from "@atproto/api";
import { Tweet } from "@the-convocation/twitter-scraper";

export type MastodonPost = {
  tweet: Tweet;
  chunks: string[];
  username: string;
  inReplyToId: string | undefined;
};

export type BlueskyPost = {
  tweet: Tweet;
  chunks: string[];
  username: string;
  quotePost?: { uri: string; cid: string; value: AppBskyFeedPost.Record };
  replyPost?: { uri: string; cid: string; value: AppBskyFeedPost.Record };
};

export type Post = {
  mastodon: null | MastodonPost;
  bluesky: null | BlueskyPost;
};
