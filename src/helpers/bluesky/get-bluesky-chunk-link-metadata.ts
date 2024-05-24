import { BskyAgent, RichText } from "@atproto/api";

import { BlueskyLinkMetadata } from "../../types/link-metadata.js";
import { getBlueskyLinkMetadata } from "./get-bluesky-link-metadata.js";

/**
 * Retrieves the metadata of the first link found in the given richtext.
 *
 * @param {RichText} richText - The richtext to search for links.
 * @param {BskyAgent} client - The BskyAgent client for making API calls.
 * @returns {Promise<BlueskyLinkMetadata | null>} A promise that resolves to the metadata of the first link found, or null if no link is found.
 */
export const getBlueskyChunkLinkMetadata = async (
  richText: RichText,
  client: BskyAgent,
): Promise<BlueskyLinkMetadata | null> => {
  let card = null;
  for (const seg of richText.segments()) {
    if (seg.isLink()) {
      const link = seg.link?.uri;
      if (link) {
        card = await getBlueskyLinkMetadata(link, client);
        break;
      }
    }
  }
  return card;
};
