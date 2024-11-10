import { Tweet } from "@the-convocation/twitter-scraper";

import {
  BLUESKY_MAX_POST_LENGTH,
  MASTODON_MAX_POST_LENGTH,
} from "../../../constants";
import { Platform } from "../../../types";
import { MentionMapping } from "../../../types/mentionMapping";
import { buildChunksFromSplitterEntries } from "./build-chunks-from-splitter-entries";
import { extractWordsAndSpacers } from "./extract-words-and-spacers";
import { getMastodonQuoteLinkSection } from "./get-mastodon-quote-link-section";

const splitTweetText = async (
  { text, quotedStatusId, urls, mentions }: Tweet,
  platform: Platform,
  mentionsMapping: MentionMapping[],
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

  let tweetText = text!;

  if (mentions != null) {
    for (const tweetMention of mentions) {
      const mapped = mentionsMapping.find(
        (mapping) => tweetMention.username == mapping.twitter,
      );
      if (mapped == null) {
        continue;
      }
      const newMention =
        platform === Platform.MASTODON ? mapped!.mastodon : mapped!.bluesky;
      if (newMention != null) {
        tweetText = tweetText.replaceAll(
          `@${tweetMention.username}`,
          `@${newMention}`,
        );
      }
    }
  }

  // Small post optimization
  if (quotedStatusId) {
    if (platform === Platform.MASTODON) {
      // Specific optimization for Mastodon (it has to include a link to the quoted status)
      if (tweetText.length - quotedStatusLinkSection.length <= maxChunkSize) {
        return [tweetText + quotedStatusLinkSection];
      }
    }
  } else if (tweetText.length <= maxChunkSize) {
    return [tweetText];
  }

  const entries = extractWordsAndSpacers(tweetText, urls);
  return buildChunksFromSplitterEntries(
    entries,
    platform,
    quotedStatusId,
    maxChunkSize,
    quotedStatusLinkSection,
  );
};

export const splitTextForMastodon = (
  tweet: Tweet,
  mentionsMapping: MentionMapping[],
  mastodonUsername: string,
) =>
  splitTweetText(tweet, Platform.MASTODON, mentionsMapping, mastodonUsername);

export const splitTextForBluesky = (
  tweet: Tweet,
  mentionsMapping: MentionMapping[],
) => splitTweetText(tweet, Platform.BLUESKY, mentionsMapping);
