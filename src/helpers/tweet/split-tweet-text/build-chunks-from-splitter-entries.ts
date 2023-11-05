import { Platform } from "../../../types/index.js";
import { SplitterEntry } from "../../../types/splitter.js";

const addWordToChunk = (chunk: string, word: SplitterEntry) =>
  chunk + word.str + word.sep;

/**
 * Builds chunks from the given splitter entries based on the specified criteria.
 *
 * @param {SplitterEntry[]} entries - The splitter entries to build chunks from.
 * @param {Platform} platform - The platform where the chunks will be used.
 * @param {string | undefined} quotedStatusId - The ID of the quoted status, if available.
 * @param {number} maxChunkSize - The maximum size of each chunk.
 * @param {string} quotedStatusLinkSection - The section of the quote link.
 * @returns {string[]} - An array of chunks generated from the splitter entries.
 */
export const buildChunksFromSplitterEntries = (
  entries: SplitterEntry[],
  platform: Platform,
  quotedStatusId: string | undefined,
  maxChunkSize: number,
  quotedStatusLinkSection: string,
): string[] => {
  const chunks: string[] = [];
  let currentChunk = "";

  for (const entry of entries) {
    const currentChunkWithAddedWord = addWordToChunk(currentChunk, entry);
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
        shouldAppendQuoteLink
          ? `${currentChunk.trim()}${quotedStatusLinkSection}`
          : currentChunk.trim(),
      );
      currentChunk = addWordToChunk("", entry);
    }
  }

  // Push any remaining content in currentChunk
  if (currentChunk.trim() !== "") {
    chunks.push(currentChunk);
  }

  return chunks;
};
