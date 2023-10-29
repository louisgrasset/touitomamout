import { Tweet } from "@the-convocation/twitter-scraper";

import { tweetFormatter } from "../tweet-formatter.js";

jest.mock("../format-tweet-text.js", () => {
  return {
    formatTweetText: jest
      .fn()
      .mockImplementation((t: Tweet) => `formatted:${t.text}`),
  };
});

describe("tweetFormatter", () => {
  it("should properly format the give tweet", () => {
    const result = tweetFormatter({
      text: "text",
      timestamp: 966236400,
    } as Tweet);

    expect(result).toStrictEqual({
      text: "formatted:text",
      timestamp: 966236400000,
    });
  });
});
