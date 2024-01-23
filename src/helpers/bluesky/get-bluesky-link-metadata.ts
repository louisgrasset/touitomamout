import bsky from "@atproto/api";

import { mediaDownloaderService } from "../../services/index.js";
import { BlueskyLinkMetadata } from "../../types/link-metadata.js";
import { parseBlobForBluesky } from "../medias/parse-blob-for-bluesky.js";
import { fetchLinkMetadata } from "./fetch-link-metadata.js";

/**
 * Retrieves Bluesky Link metadata asynchronously.
 *
 * @param {string} url - The URL of the link for which metadata is to be retrieved.
 * @param {bsky.BskyAgent} client - The bsky.BskyAgent client used for uploading the media.
 * @returns {Promise<BlueskyLinkMetadata | null>} - A promise that resolves to the Bluesky Link metadata or null if not found.
 */
export const getBlueskyLinkMetadata = async (
  url: string,
  client: bsky.BskyAgent,
): Promise<BlueskyLinkMetadata | null> => {
  const data = await fetchLinkMetadata(url);

  // Without metadata, stop
  if (!data) {
    return null;
  }

  // Metadata without image
  if (!data.image) {
    return {
      ...data,
      image: undefined,
    };
  }

  const mediaBlob = await mediaDownloaderService(data.image);

  const blueskyBlob = await parseBlobForBluesky(mediaBlob);

  const media = await client.uploadBlob(blueskyBlob.blobData, {
    encoding: blueskyBlob.mimeType,
  });

  return {
    ...data,
    image: blueskyBlob ? media : undefined,
  };
};
