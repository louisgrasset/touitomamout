import { Tweet } from "@the-convocation/twitter-scraper";

import { formatTweetText } from "../format-tweet-text.js";

describe("formatTweetText", () => {
  describe("when the tweet has links", () => {
    it("should remove the t.co links from the text", () => {
      const tweet: Tweet = {
        text: "This is a tweet with a link",
        urls: ["https://t.co/abc123"],
      } as unknown as Tweet;
      const result = formatTweetText(tweet);
      expect(result).toStrictEqual("This is a tweet with a link");
    });
  });

  describe("when the tweet has media links", () => {
    it("should remove the t.co links from the text", () => {
      const tweet: Tweet = {
        text: "This is a tweet with a media https://t.co/media123",
        urls: [],
      } as unknown as Tweet;
      const result = formatTweetText(tweet);
      expect(result).toStrictEqual("This is a tweet with a media");
    });
  });
});
