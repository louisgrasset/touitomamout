import { getRedirectedUrl } from "./get-redirection";

/**
 * A utility method to replace t.co urls with the original url.
 */
export const shortenedUrlsReplacer = async (text: string): Promise<string> => {
  const TWITTER_URL_SHORTENER = /https:\/\/t\.co\/\w+/g;

  const matches = Array.from(text.matchAll(TWITTER_URL_SHORTENER));

  if (!matches.length) {
    return text;
  }
  // Get all original urls
  const replacedItems = await Promise.all(
    matches.map(async (match) => await getRedirectedUrl(match[0])),
  );

  // Replace shortened urls to original ones, remove non-resolved ones.
  return matches.reduce((description, match, index) => {
    const resolvedUrl = replacedItems[index];
    return resolvedUrl
      ? description.replace(match[0], resolvedUrl)
      : description;
  }, text);
};
