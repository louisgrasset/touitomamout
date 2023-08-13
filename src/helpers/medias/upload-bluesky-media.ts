import { BskyAgent } from '@atproto/api';

import { parseBlobForBluesky } from './parse-blob-for-bluesky.js';

/**
 * An async method to upload a media to Bluesky
 * @returns the bluesky media references
 */
export const uploadBlueskyMedia = async (mediaBlob: Blob, blueskyClient: BskyAgent | null) => {
    if (!blueskyClient) {
        return null;
    }
    const { mimeType, blobData } = await parseBlobForBluesky(mediaBlob);
    return await blueskyClient?.uploadBlob(blobData, { encoding: mimeType });
};
