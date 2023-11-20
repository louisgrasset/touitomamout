import { BskyAgent } from "@atproto/api";

import { getBlueskyLinkMetadata } from "../get-bluesky-link-metadata.js";
import { METADATA_MOCK } from "./mocks/metadata.js";

jest.mock("../../../services/index.js", () => ({
  mediaDownloaderService: jest.fn(() => ({
    blobData: "blobData",
    mimeType: "mimeType",
  })),
}));

jest.mock("../../medias/parse-blob-for-bluesky.js", () => ({
  parseBlobForBluesky: jest.fn(() => ({
    blobData: "blobData",
    mimeType: "mimeType",
  })),
}));

jest.mock("../../../constants.js", () => {
  return {
    TWITTER_HANDLE: "username",
    MASTODON_INSTANCE: "mastodon.social",
    MASTODON_MAX_POST_LENGTH: 500,
    BLUESKY_MAX_POST_LENGTH: 300,
  };
});

const uploadBlobMock = jest.fn(() => ({
  success: true,
  data: {
    blob: {
      original: "123456789",
    },
  },
}));

describe("getBlueskyLinkMetadata", () => {
  it("should return the metadata if data is found", async () => {
    const result = await getBlueskyLinkMetadata("https://bsky.app", {
      uploadBlob: uploadBlobMock,
    } as unknown as BskyAgent);
    expect(result).toStrictEqual({
      ...METADATA_MOCK,
      image: {
        success: true,
        data: {
          blob: {
            original: "123456789",
          },
        },
      },
    });
  });

  it("should return the metadata if data is found", async () => {
    const result = await getBlueskyLinkMetadata(
      "https://thisturldoesnotexist.example.com",
      {
        uploadBlob: uploadBlobMock,
      } as unknown as BskyAgent,
    );
    expect(result).toBeNull();
  });
});
