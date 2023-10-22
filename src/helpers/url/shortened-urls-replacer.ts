import { getRedirectedUrl } from './get-redirection.js';

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
        matches.map(async (match) => await getRedirectedUrl(match[0]) ?? '')
    );

    // Replace shortened urls to original ones
    return matches.reduce((description, match, index) => {
        return description.replace(TWITTER_URL_SHORTENER, replacedItems[index]);
    }, text);
};
