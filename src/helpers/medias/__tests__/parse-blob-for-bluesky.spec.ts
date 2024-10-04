import { parseBlobForBluesky } from "../parse-blob-for-bluesky";
import {
  makeBlobFromFile,
  makeUint8ArrayFromFile,
} from "./helpers/make-blob-from-file";

let imageBlob: Blob;
let bskyBlobData: Uint8Array;
const initBlobsForMime = async (mimeType: string) => {
  const [type, extension] = mimeType.split("/");
  const fileName = `${type}-${extension}.${extension}`;

  bskyBlobData = await makeUint8ArrayFromFile(fileName, mimeType);
  imageBlob = await makeBlobFromFile(fileName, mimeType);
};

describe("parseBlobForBluesky", () => {
  describe("when the mime type is not supported", () => {
    it.each`
      mimeType
      ${"image/tiff"}
    `("should reject for $mimeType", async ({ mimeType }) => {
      await initBlobsForMime(mimeType);

      await expect(parseBlobForBluesky(imageBlob)).rejects.toContain(
        "not supported",
      );
    });
  });

  describe("when the mime type is supported", () => {
    it.each`
      mimeType
      ${"image/gif"}
      ${"image/png"}
      ${"image/jpg"}
      ${"image/jpeg"}
      ${"image/webp"}
    `(
      "should resolve bluesky compatible blob for $mimeType",
      async ({ mimeType }) => {
        await initBlobsForMime(mimeType);

        const result = await parseBlobForBluesky(imageBlob);
        expect(result).toStrictEqual({
          blobData: bskyBlobData,
          mimeType,
        });
      },
    );
  });
});
