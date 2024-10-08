import { SplitterEntry } from "../../../types/splitter";

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
    const entries: SplitterEntry[] = [];
    let remainingText = inputString;

    // Split text by urls
    urls.forEach((url) => {
      const [prefixChunk, suffixChunk] = remainingText.split(url);
      const chunksSplitByUrl = [prefixChunk, url, suffixChunk];

      for (const currentChunk of chunksSplitByUrl) {
        if (!currentChunk) {
          continue; // Skip empty chunks
        }
        entries.push({
          str: currentChunk,
          sep: getSeparator(remainingText, currentChunk),
        });
      }

      const processedString = chunksSplitByUrl.join("");
      remainingText = inputString.slice(
        processedString.length,
        inputString.length,
      );
    });
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
