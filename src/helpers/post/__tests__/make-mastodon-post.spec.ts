import { mastodon } from "masto";

import { makeTweetMock } from "../../../services/__tests__/helpers/make-tweet-mock.js";
import { makeMastodonPost } from "../make-mastodon-post.js";

jest.mock("../../../constants.js", () => ({
  MASTODON_MAX_POST_LENGTH: 500,
  BLUESKY_MAX_POST_LENGTH: 300,
}));

describe("makeMastodonPost", () => {
  it("should build a post", async () => {
    const client = {
      v1: {
        accounts: {
          verifyCredentials: async () => ({ username: "username" }),
        },
      },
    } as unknown as mastodon.rest.Client;
    const tweet = makeTweetMock();
    const result = await makeMastodonPost(client, tweet);

    expect(result).toStrictEqual({
      tweet,
      chunks: [tweet.text],
      inReplyToId: undefined,
      username: "username",
    });
  });
});
