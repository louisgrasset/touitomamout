import { BskyAgent } from "@atproto/api";

import { mediaDownloaderService } from "../../services";
import { BlueskyLinkMetadata } from "../../types/link-metadata";
import { parseBlobForBluesky } from "../medias/parse-blob-for-bluesky";
import { fetchLinkMetadata } from "./fetch-link-metadata";

/**
 * Retrieves Bluesky Link metadata asynchronously.
 *
 * @param {string} url - The URL of the link for which metadata is to be retrieved.
 * @param {BskyAgent} client - The BskyAgent client used for uploading the media.
 * @returns {Promise<BlueskyLinkMetadata | null>} - A promise that resolves to the Bluesky Link metadata or null if not found.
 */
export const getBlueskyLinkMetadata = async (
  url: string,
  client: BskyAgent,
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
