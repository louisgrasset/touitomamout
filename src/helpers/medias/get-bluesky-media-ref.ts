import { BskyAgent } from '@atproto/api';

import { mediaBlobParser } from './media-blob-parser.js';

export const getBlueskyMediaRef = async (mediaBlob: Blob, blueskyClient: BskyAgent | null) => {
    if (!blueskyClient) {
        return null;
    }
    const { mimeType, blobData } = await mediaBlobParser(mediaBlob);
    return await blueskyClient?.uploadBlob(blobData, { encoding: mimeType });
};
