import { mediaDownloaderService } from "../media-downloader.service";

describe("mediaDownloaderService", () => {
  it("should download media", async () => {
    const url = "https://sample-videos.com/img/Sample-png-image-100kb.png";
    const result = await mediaDownloaderService(url);

    expect(result).toBeInstanceOf(Blob);
  });

  describe("when the media is not found", () => {
    it("should fail", async () => {
      await expect(mediaDownloaderService("")).rejects.toBeInstanceOf(Error);
    });
  });
});
