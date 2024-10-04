import { mediaDownloaderService } from "../media-downloader.service";

describe("mediaDownloaderService", () => {
  it("should download media", async () => {
    const url = "https://placehold.co/10x10.png";
    const result = await mediaDownloaderService(url);

    expect(result).toBeInstanceOf(Blob);
  });

  describe("when the media is not found", () => {
    it("should fail", async () => {
      await expect(mediaDownloaderService("")).rejects.toBeInstanceOf(Error);
    });
  });
});
