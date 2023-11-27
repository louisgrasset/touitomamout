import { parseBlobForBluesky } from "../parse-blob-for-bluesky.js";
import {
  makeBlobFromFile,
  makeUint8ArrayFromFile,
} from "./helpers/make-blob-from-file.js";

jest.mock("../../../constants.js", () => ({ DEBUG: false }));

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
      ${"video/mp4"}
      ${"image/webp"}
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
      ${"image/jpeg"}
      ${"image/jpg"}
      ${"image/png"}
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
