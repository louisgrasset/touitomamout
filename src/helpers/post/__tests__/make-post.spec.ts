import { AtpAgent } from "@atproto/api";
import { mastodon } from "masto";
import ora from "ora";

import { makeTweetMock } from "../../../services/__tests__/helpers/make-tweet-mock";
import { makeBlueskyPost } from "../make-bluesky-post";
import { makeMastodonPost } from "../make-mastodon-post";
import { makePost } from "../make-post";

vi.mock("../../../constants", () => ({}));
vi.mock("../make-mastodon-post", () => ({
  makeMastodonPost: vi.fn(),
}));
vi.mock("../make-bluesky-post", () => ({
  makeBlueskyPost: vi.fn(),
}));

const mastodonClient = {} as unknown as mastodon.rest.Client;
const blueskyClient = {} as unknown as AtpAgent;

const tweet = makeTweetMock();
const madePostMock = {
  tweet,
  chunks: [tweet.text],
  username: "username",
};

(makeMastodonPost as vi.Mock).mockResolvedValue(madePostMock);
(makeBlueskyPost as vi.Mock).mockResolvedValue(madePostMock);

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
