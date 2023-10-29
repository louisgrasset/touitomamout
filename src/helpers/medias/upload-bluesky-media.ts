import { BskyAgent } from "@atproto/api";

import { DEBUG } from "../../constants.js";
import { parseBlobForBluesky } from "./parse-blob-for-bluesky.js";

/**
 * An async method to upload a media to Bluesky.
 * @returns the bluesky media references
 */
export const uploadBlueskyMedia = async (
  mediaBlob: Blob,
  blueskyClient: BskyAgent | null,
) => {
  if (!blueskyClient) {
    return null;
  }
  return await parseBlobForBluesky(mediaBlob)
    .then(
      ({ blobData, mimeType }) =>
        blueskyClient?.uploadBlob(blobData, {
          encoding: mimeType,
        }),
    )
    .catch((err) => {
      if (DEBUG) {
        console.log(err);
      }
      return null;
    });
};
