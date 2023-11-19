import { LinkMetadata } from "../../types/link-metadata.js";

/**
 * Fetches metadata for a given URL.
 * @param {string} url - The URL for which to fetch metadata.
 * @returns {Promise<LinkMetadata> | null} - A promise that resolves with the fetched metadata or null if an error occurred.
 */
export const fetchLinkMetadata = (
  url: string,
): Promise<LinkMetadata | null> | null => {
  return fetch(`https://cardyb.bsky.app/v1/extract?url=${encodeURI(url)}`, {
    method: "GET",
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        return null;
      }
      return data as LinkMetadata;
    })
    .catch((e) => {
      console.error(`Error while fetching link metadata: ${e}`);
      return null;
    });
};
