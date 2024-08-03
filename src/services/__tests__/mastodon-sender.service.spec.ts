import { mastodon } from "masto";
import ora from "ora";

import { makeBlobFromFile } from "../../helpers/medias/__tests__/helpers/make-blob-from-file";
import { Media } from "../../types";
import { MastodonPost } from "../../types/post";
import { mastodonSenderService } from "../mastodon-sender.service";
import { mediaDownloaderService } from "../media-downloader.service";
import { makeTweetMock } from "./helpers/make-tweet-mock";

vi.mock("ora");
vi.mock("../../constants", () => {
  return {};
});
vi.mock("../../helpers/cache/save-post-to-cache", () => ({
  savePostToCache: vi.fn().mockImplementation(() => Promise.resolve()),
}));
vi.mock("../../helpers/tweet/is-tweet-cached");

vi.mock("../media-downloader.service", () => ({
  mediaDownloaderService: vi.fn(),
}));
const mediaDownloaderServiceMock = mediaDownloaderService as vi.Mock;
const client = {
  v1: {
    accounts: {
      verifyCredentials: async () => ({ username: "username" }),
    },
    statuses: {},
  },
  v2: {
    media: {},
  },
} as unknown as mastodon.rest.Client;

const postCreateSpy = vi.fn().mockImplementation(() =>
  Promise.resolve({
    id: "id",
    uri: "https://mastodon.social/@touitomamout/id",
    createdAt: new Date().toISOString(),
    editedAt: null,
    accountId: "accountId",
    content: "Tweet text",
    visibility: "public",
    sensitive: false,
    spoilerText: "",
    mediaAttachments: [],
    inReplyToId: null,
  }),
);

client.v1.statuses.create = postCreateSpy;

const mediaCreateSpy = vi.fn().mockImplementation(() =>
  Promise.resolve({
    id: "mediaId",
    type: "image",
    url: "https://files.mastodon.social/media_attachments/files/image.png",
    previewUrl:
      "https://files.mastodon.social/media_attachments/files/image.png",
    remoteUrl:
      "https://files.mastodon.social/media_attachments/files/image.png",
    previewRemoteUrl:
      "https://files.mastodon.social/media_attachments/files/image.png",
    textUrl: "https://files.mastodon.social/media_attachments/files/image.png",
  }),
);

client.v2.media.create = mediaCreateSpy;

const log = ora();

const post = {
  tweet: makeTweetMock({ text: "Tweet text" }),
  chunks: ["Tweet text"],
  username: "username",
  inReplyToId: undefined,
} as MastodonPost;

const media: Media = {
  type: "image",
  id: "id",
  url: "https://sample-videos.com/img/Sample-png-image-100kb.png",
  alt_text: "alt text",
};

describe("mastodonSenderService", () => {
  beforeEach(() => {
    postCreateSpy.mockClear();
    mediaCreateSpy.mockClear();
  });

  it("should send the post", async () => {
    await mastodonSenderService(client, post, [], log);

    expect(postCreateSpy).toHaveBeenCalledTimes(1);
    expect(mediaCreateSpy).toHaveBeenCalledTimes(0);
  });

  describe("when the post has some media", () => {
    let expectedBlob: Blob;
    beforeAll(async () => {
      (expectedBlob = await makeBlobFromFile("image-png.png", "image/png")),
        mediaDownloaderServiceMock.mockResolvedValue(expectedBlob);
    });

    it("should send the post with its media ", async () => {
      const media: Media = {
        type: "image",
        id: "id",
        url: "https://avatars.githubusercontent.com/u/9489181",
        alt_text: "alt text",
      };
      await mastodonSenderService(client, post, [media], log);

      expect(postCreateSpy).toHaveBeenCalledTimes(1);
      expect(mediaCreateSpy).toHaveBeenCalledTimes(1);
      expect(mediaCreateSpy).toHaveBeenCalledWith({
        description: "alt text",
        file: expectedBlob,
      });
    });
  });

  describe("when the tweet as more than 4 images", () => {
    it("should send the post with only the first 4 images", async () => {
      await mastodonSenderService(
        client,
        post,
        [media, media, media, media, media],
        log,
      );
      expect(mediaCreateSpy).toHaveBeenCalledTimes(4);
      expect(postCreateSpy).toHaveBeenCalledTimes(1);
      expect(postCreateSpy).toHaveBeenCalledWith({
        inReplyToId: undefined,
        mediaIds: ["mediaId", "mediaId", "mediaId", "mediaId"],
        status: "Tweet text",
        visibility: "public",
      });
    });
  });

  describe("when the tweet as a video", () => {
    let expectedBlob: Blob;
    beforeAll(async () => {
      (expectedBlob = await makeBlobFromFile("video-mp4.mp4", "video/mp4")),
        mediaDownloaderServiceMock.mockResolvedValue(expectedBlob);
    });

    it("should send the post with media ", async () => {
      const mediaVideo: Media = {
        type: "video",
        id: "id",
        preview: "preview",
        url: "https://sample-videos.com/video123/mp4/360/big_buck_bunny_360p_1mb.mp4",
      };
      await mastodonSenderService(client, post, [mediaVideo], log);
      const expectedBlob = await makeBlobFromFile("video-mp4.mp4", "video/mp4");
      expect(mediaCreateSpy).toHaveBeenCalledTimes(1);
      expect(mediaCreateSpy).toHaveBeenCalledWith({ file: expectedBlob });
      expect(postCreateSpy).toHaveBeenCalledTimes(1);
      expect(postCreateSpy).toHaveBeenCalledWith({
        inReplyToId: undefined,
        mediaIds: ["mediaId"],
        status: "Tweet text",
        visibility: "public",
      });
    });
  });

  describe("when no post is given", () => {
    it("should skip", async () => {
      await mastodonSenderService(client, null, [], log);

      expect(mediaCreateSpy).toHaveBeenCalledTimes(0);
    });
  });
});
