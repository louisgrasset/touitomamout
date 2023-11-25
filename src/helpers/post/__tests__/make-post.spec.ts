import { BskyAgent } from "@atproto/api";
import { mastodon } from "masto";
import ora from "ora";

import { makeTweetMock } from "../../../services/__tests__/helpers/make-tweet-mock.js";
import { makeBlueskyPost } from "../make-bluesky-post.js";
import { makeMastodonPost } from "../make-mastodon-post.js";
import { makePost } from "../make-post.js";

jest.mock("../../../constants.js", () => ({}));
jest.mock("../make-mastodon-post.js", () => ({
  makeMastodonPost: jest.fn(),
}));
jest.mock("../make-bluesky-post.js", () => ({
  makeBlueskyPost: jest.fn(),
}));

const mastodonClient = {} as unknown as mastodon.rest.Client;
const blueskyClient = {} as unknown as BskyAgent;

const tweet = makeTweetMock();
const madePostMock = {
  tweet,
  chunks: [tweet.text],
  username: "username",
};

(makeMastodonPost as jest.Mock).mockResolvedValue(madePostMock);
(makeBlueskyPost as jest.Mock).mockResolvedValue(madePostMock);

describe("makePost", () => {
  it("should make a post", async () => {
    const result = await makePost(tweet, mastodonClient, blueskyClient, ora(), {
      current: 0,
      total: 0,
    });

    expect(result).toStrictEqual({
      mastodon: madePostMock,
      bluesky: madePostMock,
    });
  });
});
