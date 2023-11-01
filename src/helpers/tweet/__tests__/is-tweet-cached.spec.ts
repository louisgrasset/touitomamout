import { Tweet } from "@the-convocation/twitter-scraper";

import { isTweetCached } from "../is-tweet-cached.js";

describe("isTweetCached", () => {
  it("should return true if the tweet is cached", () => {
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
