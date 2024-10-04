import {
  BlueskyCacheChunk,
  MastodonCacheChunk,
  Platform,
} from "../../../types";
import { getCachedPostChunk } from "../get-cached-post-chunk";

vi.mock("../get-cached-posts", () => {
  return {
    getCachedPosts: vi.fn().mockResolvedValue({
      "1234567891234567891": {
        mastodon: ["first", "last"],
        bluesky: [
          {
            cid: "cid_first",
            rkey: "rkey_first",
          },
          {
            cid: "cid_last",
            rkey: "rkey_last",
          },
        ],
      },
    }),
  };
});

const TWEET_ID = "1234567891234567891";

describe("getCachedPostChunk", () => {
  describe("when the post exists in the cache", () => {
    it.each`
      position
      ${"first"}
      ${"last"}
    `(
      "should return the right chunk (for position: '$position')",
      async ({ position }) => {
        const blueskyChunk = await getCachedPostChunk<BlueskyCacheChunk>(
          Platform.BLUESKY,
          position,
          TWEET_ID,
        );
        const mastodonChunk = await getCachedPostChunk<MastodonCacheChunk>(
          Platform.MASTODON,
          position,
          TWEET_ID,
        );

        expect(blueskyChunk).toStrictEqual({
          cid: `cid_${position}`,
          rkey: `rkey_${position}`,
        });
        expect(mastodonChunk).toStrictEqual(`${position}`);
      },
    );
  });

  describe("when the post does not exist in the cache", () => {
    it("should return undefined", async () => {
      const mastodonChunk = await getCachedPostChunk<MastodonCacheChunk>(
        Platform.MASTODON,
        "first",
        "potato-id",
      );
      expect(mastodonChunk).toStrictEqual(undefined);
    });
  });
});
