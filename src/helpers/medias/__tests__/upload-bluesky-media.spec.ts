import { BskyAgent } from "@atproto/api";

import { uploadBlueskyMedia } from "../upload-bluesky-media";
import { makeBlobFromFile } from "./helpers/make-blob-from-file";

vi.mock("../../../constants", () => ({ DEBUG: false }));

const uploadBlobResponseMock = {
  success: true,
  data: {
    blob: {
      original: "123456789",
    },
  },
};
const uploadBlobMock = vi.fn(() => uploadBlobResponseMock);

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
