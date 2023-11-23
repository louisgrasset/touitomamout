import { AppBskyFeedPost, BskyAgent } from "@atproto/api";

import { makeTweetMock } from "../../../services/__tests__/helpers/make-tweet-mock.js";
import { getCachedPostChunk } from "../../cache/get-cached-post-chunk.js";
import { makeBlueskyPost } from "../make-bluesky-post.js";

jest.mock("../../../constants.js", () => ({
  MASTODON_MAX_POST_LENGTH: 500,
  BLUESKY_MAX_POST_LENGTH: 300,
}));

jest.mock("../../cache/get-cached-post-chunk.js", () => ({
  getCachedPostChunk: jest.fn().mockReturnValue({
    cid: "cid",
    rkey: "rkey",
  }),
}));

describe("makeBlueskyPost", () => {
  it("should build a post", async () => {
    const client = {
      getProfile: async () => ({ data: { handle: "username" } }),
    } as unknown as BskyAgent;
    const tweet = makeTweetMock({ id: "tweetId" });
    const result = await makeBlueskyPost(client, tweet);

    expect(result).toStrictEqual({
      tweet,
      chunks: [tweet.text],
      quotePost: undefined,
      replyPost: undefined,
      username: "username",
    });
  });

  // Verify that the post is built correctly when the tweet is a quote or reply (basically: same results, just some properties named differently)
  describe.each`
    postType   | tweetProperty        | quotePost                                | replyPost
    ${"quote"} | ${"quotedStatus"}    | ${{ uri: "uri", cid: "cid", value: {} }} | ${undefined}
    ${"reply"} | ${"inReplyToStatus"} | ${undefined}                             | ${{ uri: "uri", cid: "cid", value: {} }}
  `(
    "when the tweet is a '$postType')",
    ({ tweetProperty, quotePost, replyPost }) => {
      it("should build a post", async () => {
        const client = {
          getProfile: async () => ({ data: { handle: "username" } }),
          getPost: async () => ({
            uri: "uri",
            cid: "cid",
            value: {} as AppBskyFeedPost.Record,
          }),
        } as unknown as BskyAgent;

        const tweet = makeTweetMock({
          [tweetProperty + "Id"]: "quotedId",
          [tweetProperty]: makeTweetMock(),
        });
        const result = await makeBlueskyPost(client, tweet);

        expect(result).toStrictEqual({
          tweet,
          chunks: [tweet.text],
          username: "username",
          quotePost,
          replyPost,
        });
      });
    },
  );
});
