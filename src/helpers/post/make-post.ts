import { AtpAgent } from "@atproto/api";
import { Tweet } from "@the-convocation/twitter-scraper";
import { mastodon } from "masto";
import { Ora } from "ora";

import { VOID } from "../../constants";
import { BlueskyPost, MastodonPost, Post } from "../../types/post";
import { oraProgress } from "../logs";
import { getPostExcerpt } from "./get-post-excerpt";
import { makeBlueskyPost } from "./make-bluesky-post";
import { makeMastodonPost } from "./make-mastodon-post";

const format = (count: number, word: string) =>
  `${count} ${count === 1 ? word : word + "s"}`;

const chunkLogger = (
  log: Ora,
  chunksByPlatform: {
    mastodon: MastodonPost | null;
    bluesky: BlueskyPost | null;
  },
  postExcerpt: string,
) => {
  const mastodonLog = chunksByPlatform.mastodon?.chunks.length
    ? `🦣 ${format(chunksByPlatform.mastodon.chunks.length, "chunk")}`
    : "";
  const blueskyLog = chunksByPlatform.bluesky?.chunks.length
    ? `☁️ ${format(chunksByPlatform.bluesky.chunks.length, "chunk")}`
    : "";

  const chunksLogs = [mastodonLog, blueskyLog].filter((l) => !!l).join(" ");

  log.info(`post: → generated ${postExcerpt} → ${chunksLogs}`);
};

export const makePost = async (
  tweet: Tweet,
  mastodonClient: mastodon.rest.Client | null,
  blueskyClient: AtpAgent | null,
  log: Ora,
  counters: { current: number; total: number },
): Promise<Post> => {
  const postExcerpt = getPostExcerpt(tweet.text ?? VOID).padEnd(32, " ");
  log.color = "magenta";
  oraProgress(
    log,
    { before: "post: → generating", after: postExcerpt },
    counters.current,
    counters.total,
  );

  // Mastodon post
  let mastodonPost = null;
  if (mastodonClient) {
    mastodonPost = await makeMastodonPost(mastodonClient, tweet);
  }

  // Bluesky post
  let blueskyPost = null;
  if (blueskyClient) {
    blueskyPost = await makeBlueskyPost(blueskyClient, tweet);
  }

  const chunksByPlatform = {
    mastodon: mastodonPost,
    bluesky: blueskyPost,
  };
  chunkLogger(log, chunksByPlatform, postExcerpt);

  return chunksByPlatform;
};
