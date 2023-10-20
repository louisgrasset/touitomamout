export const getTweetIdFromPermalink = (url: string): string => url.match(/\d{19}$/)?.[0] || '';
