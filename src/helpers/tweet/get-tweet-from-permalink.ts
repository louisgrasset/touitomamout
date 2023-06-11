export const getTweetIdFromPermalink = (url: string): string => url.match(/\d+$/)?.[0] || '';
