import { getTweetIdFromPermalink } from "../get-tweet-id-from-permalink.js";

describe("getTweetIdFromPermalink", () => {
  it("should return the tweet id", () => {
    const result = getTweetIdFromPermalink(
      "https://twitter.com/username/status/1234567890123456789",
    );
    expect(result).toBe("1234567890123456789");
  });
});
