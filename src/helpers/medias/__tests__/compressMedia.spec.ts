import { compressMedia } from "../compress-media";
import { areBlobsEqual } from "./helpers/are-blobs-equals";
import { getBlobSize } from "./helpers/get-blob-size";
import { makeBlobFromFile } from "./helpers/make-blob-from-file";

const MEDIA_MAX_SIZE_BYTES = 200000;
vi.mock("../../../constants", () => ({
  DEBUG: false,
}));

describe("compressMedia", () => {
  describe("when the media is smaller than the max size", () => {
    it("returns the original media", async () => {
      // 70 bytes image
      const originalBlob = await makeBlobFromFile("image-png.png", "image/png");
      const compressedBlob = await compressMedia(originalBlob, 100);

      expect(await getBlobSize(compressedBlob)).toEqual(70);
      expect(await areBlobsEqual(compressedBlob, originalBlob)).toBe(true);
    });
  });

  describe("when the media is larger than the max size", () => {
    it("returns a compressed version of the given media", async () => {
      // 229,039 bytes image
      const originalBlob = await makeBlobFromFile(
        "image-large-jpg.jpg",
        "image/jpg",
      );
      const compressedBlob = await compressMedia(
        originalBlob,
        MEDIA_MAX_SIZE_BYTES,
      );

      expect(await getBlobSize(compressedBlob)).toBeLessThanOrEqual(
        MEDIA_MAX_SIZE_BYTES,
      );
      expect(await areBlobsEqual(compressedBlob, originalBlob)).toBe(false);
    });
  });
});
