import { Tweet } from "@the-convocation/twitter-scraper";

import { isTweetCached } from "../is-tweet-cached";

describe("isTweetCached", () => {
  describe("when the tweet is cached", () => {
    it("should return true", () => {
      const result = isTweetCached(
        { id: "1234567890123456789" } as unknown as Tweet,
        {
          "1234567890123456789": {
            mastodon: ["mastodonId"],
            bluesky: [
              {
                cid: "cid",
                rkey: "rkey",
              },
            ],
          },
        },
      );

      expect(result).toBe(true);
    });
  });

  describe("when the tweet is not cached", () => {
    it("should return false", () => {
      const result = isTweetCached(
        { id: "1234567890123456789" } as unknown as Tweet,
        {},
      );

      expect(result).toBe(false);
    });
  });
});
