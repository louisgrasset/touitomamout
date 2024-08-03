import { MASTODON_INSTANCE } from "../../../constants";
import { MastodonCacheChunk, Platform } from "../../../types";
import { getCachedPostChunk } from "../../cache/get-cached-post-chunk";

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
