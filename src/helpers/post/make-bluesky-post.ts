import { AtpAgent, RichText } from "@atproto/api";
import { Tweet } from "@the-convocation/twitter-scraper";

import { BLUESKY_IDENTIFIER } from "../../constants";
import { BlueskyCacheChunk, Platform } from "../../types";
import { BlueskyPost } from "../../types/post";
import { getCachedPostChunk } from "../cache/get-cached-post-chunk";
import { splitTextForBluesky } from "../tweet/split-tweet-text";

export const makeBlueskyPost = async (
  client: AtpAgent,
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

  const post = new RichText({ text: tweet.text! });
  await post.detectFacets(client); // automatically detects mentions and links

  return {
    chunks: await splitTextForBluesky(tweet),
    username,
    replyPost,
    quotePost,
    tweet,
  };
};
