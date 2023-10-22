export const getTweetIdFromPermalink = (url: string): string => {
  return url.match(/\d{19}$/)?.[0] ?? "";
};
