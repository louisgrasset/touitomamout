import { Tweet } from "@the-convocation/twitter-scraper";
import { mastodon } from "masto";

import { Platform } from "../../types";
import { MastodonPost } from "../../types/post";
import { getCachedPosts } from "../cache/get-cached-posts";
import { splitTextForMastodon } from "../tweet/split-tweet-text";

export const makeMastodonPost = async (
  client: mastodon.rest.Client,
  tweet: Tweet,
): Promise<MastodonPost> => {
  const cachedPosts = await getCachedPosts();

  const username = await client.v1.accounts
    .verifyCredentials()
    .then((account) => account.username);

  // Get post chunks (including quote in first one when needed)
  const chunks = await splitTextForMastodon(tweet, username);

  // Get in reply post references
  let inReplyToId = undefined;
  if (tweet.inReplyToStatusId) {
    // Retrieve the potentially already synced post references
    const existingPost =
      cachedPosts[tweet.inReplyToStatusId]?.[Platform.MASTODON];
    // Set inReplyToId to the last chunk reference of the existing post
    inReplyToId = existingPost
      ? existingPost[existingPost.length - 1]
      : undefined;
  }

  return {
    username,
    chunks,
    inReplyToId,
    tweet,
  };
};
