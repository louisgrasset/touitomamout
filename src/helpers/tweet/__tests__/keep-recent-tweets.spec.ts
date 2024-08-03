import { Tweet } from "@the-convocation/twitter-scraper";

import { keepRecentTweets } from "../keep-recent-tweets";

describe("keepRecentTweets", () => {
  describe("when the tweet is recent", () => {
    it("should return true", () => {
      const result = keepRecentTweets({
        timestamp: Date.now(),
      } as unknown as Tweet);
      expect(result).toBe(true);
    });
  });

  describe("when the tweet is old", () => {
    it("should return false", () => {
      const result = keepRecentTweets({
        timestamp: new Date("1997-01-01").getTime(),
      } as unknown as Tweet);
      expect(result).toBe(false);
    });
  });
});
