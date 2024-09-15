import { SplitterEntry } from "../../../types/splitter.js";

/**
 * Splits the given string into chunks based on a list of URLs and whitespace detection.
 *
 * @param {string} inputString - The input string to split.
 * @param {string[]} urls - An array of URLs used for splitting the input string.
 * @returns {SplitterEntry[]} An array of SplitterEntry objects representing the split chunks.
 */
export const extractWordsAndSpacers = (
  inputString: string,
  urls: string[],
): SplitterEntry[] => {
function extractUrlChunks() {
  const entries = [];
  let remainingText = inputString;

  urls.forEach((url) => {
    const index = remainingText.indexOf(url);
    if (index === -1) {
      // URL not found; skip to the next URL
      return;
    }

    const prefixChunk = remainingText.slice(0, index);
    const suffixChunk = remainingText.slice(index + url.length);

    if (prefixChunk) {
      entries.push({
        str: prefixChunk,
        sep: getSeparator(remainingText, prefixChunk),
      });
    }

    entries.push({
      str: url,
      sep: getSeparator(remainingText, url),
    });

    remainingText = suffixChunk;
  });

  if (remainingText.length > 0) {
    entries.push({
      str: remainingText,
      sep: '',
    });
  }

  return entries;
}
  // Split text by urls (if any)
  let entries: SplitterEntry[] = extractUrlChunks();
  // Or start with the original string.
  if (entries.length === 0) {
    entries = [{ str: inputString, sep: "" }];
  }

  // Split each chunk by whitespace
  const newEntries: SplitterEntry[] = [];
  entries.forEach((entry) => {
    const result = entry.str.matchAll(
      /(?<word>\S*(\s?[!?;:.=+])?)(?<spacer>(\s|\\n)*)/gm,
    );

    for (const match of result) {
      const { word, spacer } = match.groups!;
      newEntries.push({ str: word, sep: spacer });
    }
  });

  return newEntries;
};

const getSeparator = (inputString: string, currentChunk: string) => {
  const SEPARATOR = /\s/;

  const previousCharIndex = inputString.indexOf(currentChunk) - 1;
  const previousChar = inputString.substring(
    previousCharIndex,
    previousCharIndex + 1,
  );
  return SEPARATOR.exec(previousChar) ? previousChar : "";
};
