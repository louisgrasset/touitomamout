import { BskyAgent } from "@atproto/api";

import { getBlueskyLinkMetadata } from "../get-bluesky-link-metadata";
import { METADATA_MOCK } from "./mocks/metadata";

vi.mock("../../../services/index", () => ({
  mediaDownloaderService: vi.fn(() => ({
    blobData: "blobData",
    mimeType: "mimeType",
  })),
}));

vi.mock("../../medias/parse-blob-for-bluesky", () => ({
  parseBlobForBluesky: vi.fn(() => ({
    blobData: "blobData",
    mimeType: "mimeType",
  })),
}));

vi.mock("../../../constants", () => {
  return {
    TWITTER_HANDLE: "username",
    MASTODON_INSTANCE: "mastodon.social",
    MASTODON_MAX_POST_LENGTH: 500,
    BLUESKY_MAX_POST_LENGTH: 300,
  };
});

const uploadBlobMock = vi.fn(() => ({
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

  describe("when no image if found", () => {
    it("should return the metadata without image property", async () => {
      const result = await getBlueskyLinkMetadata("https://github.com", {
        uploadBlob: uploadBlobMock,
      } as unknown as BskyAgent);

      expect(result).toStrictEqual({
        ...METADATA_MOCK,
        image: {
          data: {
            blob: {
              original: "123456789",
            },
          },
          success: true,
        },
        title: "GitHub: Let’s build from here",
        url: "https://github.com/",
        description:
          "GitHub is where over 100 million developers shape the future of software, together. Contribute to the open source community, manage your Git repositories, review code like a pro, track bugs and fea...",
      });
    });
  });

  it("should return null if not data is found", async () => {
    const result = await getBlueskyLinkMetadata(
      "https://thisturldoesnotexist.example.com",
      {
        uploadBlob: uploadBlobMock,
      } as unknown as BskyAgent,
    );
    expect(result).toBeNull();
  });
});
