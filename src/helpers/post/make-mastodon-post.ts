import { Tweet } from "@the-convocation/twitter-scraper";
import { mastodon } from "masto";

import { Platform } from "../../types/index.js";
import { MastodonPost } from "../../types/post.js";
import { getCache } from "../cache/index.js";
import { splitTextForMastodon } from "../tweet/split-tweet-text.js";

export const makeMastodonPost = async (
  client: mastodon.rest.Client,
  tweet: Tweet,
): Promise<MastodonPost> => {
  const cache = await getCache();

  const username = await client.v1.accounts
    .verifyCredentials()
    .then((account) => account.username);

  // Get post chunks (including quote in first one when needed)
  const chunks = await splitTextForMastodon(tweet, username);

  // Get in reply post references
  let inReplyToId = undefined;
  if (tweet.inReplyToStatus) {
    // Retrieve the potentially already synced post references
    const existingPost = cache[tweet.inReplyToStatus.id!]?.[Platform.MASTODON];
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
