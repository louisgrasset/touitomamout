import { BskyAgent } from "@atproto/api";
import Counter from "@pm2/io/build/main/utils/metrics/counter.js";
import { Scraper } from "@the-convocation/twitter-scraper";
import { mastodon } from "masto";

import { blueskySenderService } from "../bluesky-sender.service.js";
import { mastodonSenderService } from "../mastodon-sender.service.js";
import { postsSynchronizerService } from "../posts-synchronizer.service.js";
import { MockTwitterClient } from "./mocks/twitter-client.js";

jest.mock("../../constants.js", () => ({}));

jest.mock("../../helpers/cache/get-cached-posts.js", () => {
  return {
    getCachedPosts: jest.fn().mockResolvedValue({
      "1234567891234567891": {},
      "1234567891234567892": {},
      "1234567891234567893": {},
    }),
  };
});

jest.mock("../../helpers/post/make-post.js", () => ({
  makePost: jest.fn().mockImplementation((tweet) => ({
    mastodon: {
      tweet,
      chunks: [tweet.text],
      username: "username",
    },
    bluesky: {
      tweet,
      chunks: [tweet.text],
      username: "username",
    },
  })),
}));

jest.mock("../bluesky-sender.service.js", () => ({
  blueskySenderService: jest.fn(),
}));
jest.mock("../mastodon-sender.service.js", () => ({
  mastodonSenderService: jest.fn(),
}));

const mastodonSenderServiceMock = (
  mastodonSenderService as jest.Mock
).mockImplementation(() => Promise.resolve());
const blueskySenderServiceMock = (
  blueskySenderService as jest.Mock
).mockImplementation(() => Promise.resolve());

describe("postsSynchronizerService", () => {
  it("should return a response with the expected shape", async () => {
    const twitterClient = new MockTwitterClient(3) as unknown as Scraper;
    const mastodonClient = {} as mastodon.rest.Client;
    const blueskyClient = {} as BskyAgent;
    const synchronizedPostsCountThisRun = {
      inc: jest.fn(),
    } as unknown as Counter.default;

    const response = await postsSynchronizerService(
      twitterClient,
      mastodonClient,
      blueskyClient,
      synchronizedPostsCountThisRun,
    );

    expect(mastodonSenderServiceMock).toHaveBeenCalledTimes(3);
    expect(blueskySenderServiceMock).toHaveBeenCalledTimes(3);
    expect(response).toStrictEqual({
      twitterClient,
      mastodonClient,
      blueskyClient,
      metrics: {
        totalSynced: 3,
        justSynced: 3,
      },
    });
  });
});
