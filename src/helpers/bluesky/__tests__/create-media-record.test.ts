import { createMediaRecord } from "../create-media-record";

describe("createMediaRecord", () => {
  const mockImageAttachments = [
    { alt_text: "Alt text 1", data: { blob: { original: "image1.jpg" } } },
    { alt_text: "Alt text 2", data: { blob: { original: "image2.jpg" } } },
  ];

  const mockVideoAttachment = [
    { alt_text: null, data: { blob: { original: "video.mp4" } } },
  ];

  test('returns an image media record for "image" mediaType', () => {
    const result = createMediaRecord("image", mockImageAttachments);
    expect(result).toEqual({
      media: {
        $type: "app.bsky.embed.images",
        images: [
          { alt: "Alt text 1", image: "image1.jpg" },
          { alt: "Alt text 2", image: "image2.jpg" },
        ],
      },
    });
  });

  test('returns a video media record for "video" mediaType', () => {
    const result = createMediaRecord("video", mockVideoAttachment);
    expect(result).toEqual({
      media: {
        $type: "app.bsky.embed.video",
        video: "video.mp4",
      },
    });
  });

  test("returns an empty object for undefined mediaType", () => {
    const result = createMediaRecord(undefined, []);
    expect(result).toEqual({});
  });

  test("returns an empty object for unhandled mediaType", () => {
    const result = createMediaRecord("audio", []);
    expect(result).toEqual({});
  });
});
