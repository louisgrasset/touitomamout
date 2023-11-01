import { Tweet } from "@the-convocation/twitter-scraper";

import {
  BLUESKY_MAX_POST_LENGTH,
  MASTODON_INSTANCE,
  MASTODON_MAX_POST_LENGTH,
} from "../../constants.js";
import { MastodonCacheChunk, Platform } from "../../types/index.js";
import { getCachedPostChunk } from "../post/get-cached-post-last-chunk.js";

export const splitTextForMastodon = (tweet: Tweet, mastodonUsername: string) =>
  splitTweetText(tweet, Platform.MASTODON, mastodonUsername);
export const splitTextForBluesky = (tweet: Tweet) =>
  splitTweetText(tweet, Platform.BLUESKY);

const splitTweetText = async (
  { text, quotedStatusId }: Tweet,
  platform: Platform,
  mastodonUsername?: string,
): Promise<string[]> => {
  const maxChunkSize =
    platform === Platform.MASTODON
      ? MASTODON_MAX_POST_LENGTH
      : BLUESKY_MAX_POST_LENGTH;

  const quoteData = await getCachedPostChunk<MastodonCacheChunk>(
    quotedStatusId,
    Platform.MASTODON,
    "last",
  );
  const quotedStatusLinkSection = `\n\nhttps://${MASTODON_INSTANCE}/@${
    mastodonUsername ?? ""
  }/${quoteData}`;

  // Small post optimization
  if (quotedStatusId) {
    if (platform === Platform.MASTODON) {
      // Specific optimization for Mastodon (it has to include a link to the quoted status)
      if (text!.length - quotedStatusLinkSection.length <= maxChunkSize) {
        return [text + quotedStatusLinkSection];
      }
    }
  } else {
    if (text!.length <= maxChunkSize) {
      return [text!];
    }
  }

  // Splitting the post
  const words = text!.split(" ");
  const chunks: string[] = [];
  let currentChunk = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];

    const currentChunkWithAddedWord = (currentChunk + " " + word).trim();
    const shouldAppendQuoteLink =
      chunks.length === 0 && platform === Platform.MASTODON && !!quotedStatusId;
    const currentMaxChunkSize = shouldAppendQuoteLink
      ? maxChunkSize - quotedStatusLinkSection.length
      : maxChunkSize;

    if (currentChunkWithAddedWord.length <= currentMaxChunkSize) {
      currentChunk = currentChunkWithAddedWord;
    } else {
      // Either push the current chunk or push the current chunk with the quote link (if mastodon + initial thread chunk)
      chunks.push(
        currentChunk + (shouldAppendQuoteLink ? quotedStatusLinkSection : ""),
      );
      currentChunk = word;
    }
  }

  // Push any remaining content in currentChunk
  if (currentChunk.trim() !== "") {
    chunks.push(currentChunk);
  }

  return chunks;
};
