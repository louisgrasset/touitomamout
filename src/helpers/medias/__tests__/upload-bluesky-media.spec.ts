import { BskyAgent } from "@atproto/api";

import { uploadBlueskyMedia } from "../upload-bluesky-media.js";
import { makeBlobFromFile } from "./helpers/make-blob-from-file.js";

jest.mock("../../../constants.js", () => ({ DEBUG: false }));

const uploadBlobResponseMock = {
  success: true,
  data: {
    blob: {
      original: "123456789",
    },
  },
};
const uploadBlobMock = jest.fn(() => uploadBlobResponseMock);

describe("uploadBlueskyMedia", () => {
  it("should return the bluesky media reference", async () => {
    const mediaBlob = await makeBlobFromFile("image-png.png", "image/png");
    const blueskyClient = {
      uploadBlob: uploadBlobMock,
    } as unknown as BskyAgent;

    const result = await uploadBlueskyMedia(mediaBlob, blueskyClient);

    expect(result).toBe(uploadBlobResponseMock);
  });

  describe("when the bluesky client is null", () => {
    it("should return null", async () => {
      const mediaBlob = await makeBlobFromFile("image-png.png", "image/png");
      const blueskyClient = null;

      const result = await uploadBlueskyMedia(mediaBlob, blueskyClient);

      expect(result).toBe(null);
    });
  });

  describe("when the blob is malformed", () => {
    it("should return null", async () => {
      const mediaBlob = new Blob();
      const blueskyClient = {
        uploadBlob: uploadBlobMock,
      } as unknown as BskyAgent;

      const result = await uploadBlueskyMedia(mediaBlob, blueskyClient);

      expect(result).toBe(null);
    });
  });
});
