import { Tweet } from "@the-convocation/twitter-scraper";

import { keepSelfQuotes } from "../keep-self-quotes.js";

jest.mock("../../../constants.js", () => {
  return {
    TWITTER_HANDLE: "username",
  };
});

describe("keepSelfQuotes", () => {
  describe("when the tweet is a quote", () => {
    it("should return true when is from the same user", async () => {
      const result = await keepSelfQuotes({
        isQuoted: true,
        quotedStatus: { username: "username" },
      } as unknown as Tweet);

      expect(result).toBe(true);
    });

    it("should return false when is from a different user", async () => {
      const result = await keepSelfQuotes({
        isQuoted: true,
        quotedStatus: { username: "potatoinc" },
      } as unknown as Tweet);

      expect(result).toBe(false);
    });
  });

  describe("when the tweet is not a quote", () => {
    it("should return true when is from the same user", async () => {
      const result = await keepSelfQuotes({} as unknown as Tweet);

      expect(result).toBe(true);
    });
  });

  describe("when the tweet is a quote from a unavailable tweet", () => {
    it("should return true when is from the same user", async () => {
      const result = await keepSelfQuotes({
        isQuoted: true,
        quotedStatus: undefined,
      } as unknown as Tweet);

      expect(result).toBe(false);
    });
  });
});
