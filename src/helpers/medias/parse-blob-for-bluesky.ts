import { BLUESKY_MEDIA_MAX_SIZE_BYTES } from "../../constants.js";
import { compressMedia } from "./compress-media.js";

interface BlueskyBlob {
  mimeType: string;
  blobData: Uint8Array;
}

/**
 * An async method to convert a Blob to an upload-compatible Bluesky Blob.
 * @returns BlueskyBlob
 */
export const parseBlobForBluesky = async (
  inputBlob: Blob,
): Promise<BlueskyBlob> => {
  const blob = await compressMedia(
    inputBlob,
    BLUESKY_MEDIA_MAX_SIZE_BYTES,
  ).catch(() => inputBlob);

  return new Promise<BlueskyBlob>((resolve, reject) => {
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
    const mimeType = blob.type;

    blob.arrayBuffer().then((ab) => {
      const buffer = Buffer.from(ab);
      const data = new Uint8Array(buffer);

      if (!mimeType || !allowedMimeTypes.includes(mimeType)) {
        reject(`Media type not supported (${mimeType})`);
      } else {
        resolve({ mimeType, blobData: data });
      }
    });
  });
};
