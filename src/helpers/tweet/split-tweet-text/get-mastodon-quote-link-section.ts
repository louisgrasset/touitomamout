import { MASTODON_INSTANCE } from "../../../constants.js";
import { MastodonCacheChunk, Platform } from "../../../types/index.js";
import { getCachedPostChunk } from "../../post/get-cached-post-chunk.js";

export const getMastodonQuoteLinkSection = async (
  quotedTweetId?: string,
  mastodonUsername?: string,
) => {
  if (!quotedTweetId || !mastodonUsername) {
    return "";
  }

  const mastodonQuotedId = await getCachedPostChunk<MastodonCacheChunk>(
    Platform.MASTODON,
    "last",
    quotedTweetId,
  );

  return `\n\nhttps://${MASTODON_INSTANCE}/@${mastodonUsername}/${mastodonQuotedId}`;
};
