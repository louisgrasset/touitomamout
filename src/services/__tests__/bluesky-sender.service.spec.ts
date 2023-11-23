import { BskyAgent } from "@atproto/api";
import ora from "ora";

import { makeBlobFromFile } from "../../helpers/medias/__tests__/helpers/make-blob-from-file.js";
import { Media } from "../../types/index.js";
import { BlueskyPost } from "../../types/post.js";
import { blueskySenderService } from "../bluesky-sender.service.js";
import { mediaDownloaderService } from "../media-downloader.service.js";
import { makeTweetMock } from "./helpers/make-tweet-mock.js";

jest.mock("ora");
jest.mock("../../constants.js", () => {
  return {};
});
jest.mock("../../helpers/cache/save-post-to-cache.js", () => ({
  savePostToCache: jest.fn().mockImplementation(() => Promise.resolve()),
}));
jest.mock("../../helpers/tweet/is-tweet-cached.js");

jest.mock("../media-downloader.service.js", () => ({
  mediaDownloaderService: jest.fn(),
}));
const mediaDownloaderServiceMock = mediaDownloaderService as jest.Mock;
const client = new BskyAgent({
  service: `https://bsky.social`,
});

const postSpy = jest
  .fn()
  .mockImplementation(() => Promise.resolve({ uri: "uri", cid: "cid" }));
client.post = postSpy;

const uploadBlobSpy = jest.fn().mockImplementation(() =>
  Promise.resolve({
    data: {
      blob: {
        original: {
          $type: "blob",
          ref: "blobRef",
          mimeType: "image/png",
          size: "1024",
        },
      },
    },
  }),
);
client.uploadBlob = uploadBlobSpy;

const log = ora();

const post = {
  tweet: makeTweetMock({ text: "Tweet text" }),
  chunks: ["Tweet text"],
  username: "username",
  quotePost: undefined,
  replyPost: undefined,
} as BlueskyPost;

const media: Media = {
  type: "image",
  id: "id",
  url: "https://sample-videos.com/img/Sample-png-image-100kb.png",
  alt_text: "alt text",
};

const embedMedia = {
  alt: "alt text",
  image: {
    $type: "blob",
    mimeType: "image/png",
    ref: "blobRef",
    size: "1024",
  },
};

describe("blueskySenderService", () => {
  beforeEach(() => {
    postSpy.mockClear();
    uploadBlobSpy.mockClear();
  });

  it("should send the post", async () => {
    await blueskySenderService(client, post, [], log);

    expect(postSpy).toHaveBeenCalledTimes(1);
  });

  describe("when the post has some media", () => {
    beforeAll(() => {
      mediaDownloaderServiceMock.mockResolvedValue(
        makeBlobFromFile("image-png.png", "image/png"),
      );
    });

    it("should send the post with its media ", async () => {
      const media: Media = {
        type: "image",
        id: "id",
        url: "https://avatars.githubusercontent.com/u/9489181",
        alt_text: "alt text",
      };
      await blueskySenderService(client, post, [media], log);

      expect(uploadBlobSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith({
        $type: "app.bsky.feed.post",
        createdAt: new Date(post.tweet.timestamp!).toISOString(),
        text: "Tweet text",
        facets: undefined,
        embed: {
          $type: "app.bsky.embed.images",
          images: [embedMedia],
        },
      });
    });
  });

  describe("when the tweet as more than 4 images", () => {
    it("should send the post with only the first 4 images", async () => {
      await blueskySenderService(
        client,
        post,
        [media, media, media, media, media],
        log,
      );
      expect(uploadBlobSpy).toHaveBeenCalledTimes(4);
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith({
        $type: "app.bsky.feed.post",
        createdAt: new Date(post.tweet.timestamp!).toISOString(),
        text: "Tweet text",
        facets: undefined,
        embed: {
          $type: "app.bsky.embed.images",
          images: [embedMedia, embedMedia, embedMedia, embedMedia],
        },
      });
    });
  });

  describe("when the tweet as a video", () => {
    beforeAll(() => {
      mediaDownloaderServiceMock.mockResolvedValue(
        makeBlobFromFile("video-mp4.mp4", "video/mp4"),
      );
    });

    it("should send the post without media ", async () => {
      const mediaVideo: Media = {
        type: "video",
        id: "id",
        preview: "preview",
        url: "https://sample-videos.com/video123/mp4/360/big_buck_bunny_360p_1mb.mp4",
      };
      await blueskySenderService(client, post, [mediaVideo], log);

      expect(uploadBlobSpy).toHaveBeenCalledTimes(0);
      expect(postSpy).toHaveBeenCalledTimes(1);
      expect(postSpy).toHaveBeenCalledWith({
        $type: "app.bsky.feed.post",
        createdAt: new Date(post.tweet.timestamp!).toISOString(),
        text: "Tweet text",
        facets: undefined,
        embed: undefined,
      });
    });
  });

  describe("when no post is given", () => {
    it("should skip", async () => {
      await blueskySenderService(client, null, [], log);

      expect(postSpy).toHaveBeenCalledTimes(0);
    });
  });
});
