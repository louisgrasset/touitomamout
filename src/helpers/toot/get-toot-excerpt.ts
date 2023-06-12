/**
 * A utility method to get a post excerpt
 * @param toot
 */
export const getTootExcerpt = (toot: string) => `« ${toot.replaceAll('\n','').substring(0,25)}... »`;
