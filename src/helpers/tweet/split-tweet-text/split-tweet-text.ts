import { Tweet } from "@the-convocation/twitter-scraper";

import {
  BLUESKY_MAX_POST_LENGTH,
  MASTODON_MAX_POST_LENGTH,
} from "../../../constants";
import { Platform } from "../../../types";
import { buildChunksFromSplitterEntries } from "./build-chunks-from-splitter-entries";
import { extractWordsAndSpacers } from "./extract-words-and-spacers";
import { getMastodonQuoteLinkSection } from "./get-mastodon-quote-link-section";

const splitTweetText = async (
  { text, quotedStatusId, urls }: Tweet,
  platform: Platform,
  mastodonUsername?: string,
): Promise<string[]> => {
  const maxChunkSize =
    platform === Platform.MASTODON
      ? MASTODON_MAX_POST_LENGTH
      : BLUESKY_MAX_POST_LENGTH;

  const quotedStatusLinkSection = await getMastodonQuoteLinkSection(
    quotedStatusId,
    mastodonUsername,
  );

  // Small post optimization
  if (quotedStatusId) {
    if (platform === Platform.MASTODON) {
      // Specific optimization for Mastodon (it has to include a link to the quoted status)
      if (text!.length - quotedStatusLinkSection.length <= maxChunkSize) {
        return [text + quotedStatusLinkSection];
      }
    }
  } else if (text!.length <= maxChunkSize) {
    return [text!];
  }

  const entries = extractWordsAndSpacers(text!, urls);
  return buildChunksFromSplitterEntries(
    entries,
    platform,
    quotedStatusId,
    maxChunkSize,
    quotedStatusLinkSection,
  );
};

export const splitTextForMastodon = (tweet: Tweet, mastodonUsername: string) =>
  splitTweetText(tweet, Platform.MASTODON, mastodonUsername);

export const splitTextForBluesky = (tweet: Tweet) =>
  splitTweetText(tweet, Platform.BLUESKY);
