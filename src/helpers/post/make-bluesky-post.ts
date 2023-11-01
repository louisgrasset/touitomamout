import bsky, { BskyAgent } from "@atproto/api";
import { Tweet } from "@the-convocation/twitter-scraper";

import { BLUESKY_IDENTIFIER } from "../../constants.js";
import { BlueskyCacheChunk, Platform } from "../../types/index.js";
import { BlueskyPost } from "../../types/post.js";
import { splitTextForBluesky } from "../tweet/split-tweet-text.js";
import { getCachedPostChunk } from "./get-cached-post-chunk.js";

export const makeBlueskyPost = async (
  client: BskyAgent,
  tweet: Tweet,
): Promise<BlueskyPost> => {
  const username = await client
    .getProfile({ actor: BLUESKY_IDENTIFIER })
    .then((account) => account.data.handle);

  // Get quoted post references
  let quotePost = undefined;
  if (tweet.quotedStatus) {
    const quoteData = await getCachedPostChunk<BlueskyCacheChunk>(
      Platform.BLUESKY,
      "first",
      tweet.quotedStatus.id,
    );

    quotePost = quoteData
      ? await client.getPost({
          cid: quoteData.cid,
          rkey: quoteData.rkey,
          repo: username,
        })
      : undefined;
  }

  // Get in reply post references
  let replyPost = undefined;
  if (tweet.inReplyToStatus) {
    const replyData = await getCachedPostChunk<BlueskyCacheChunk>(
      Platform.BLUESKY,
      "last",
      tweet.inReplyToStatus.id,
    );
    replyPost = replyData
      ? await client
          .getPost({
            cid: replyData.cid,
            rkey: replyData.rkey,
            repo: username,
          })
          .then((p) => p)
          .catch(() => undefined)
      : undefined;
  }

  const post = new bsky.RichText({ text: tweet.text! });
  await post.detectFacets(client); // automatically detects mentions and links

  return {
    chunks: await splitTextForBluesky(tweet),
    username,
    replyPost,
    quotePost,
    tweet,
  };
};
