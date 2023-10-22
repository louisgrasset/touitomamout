import { Tweet } from "@the-convocation/twitter-scraper";

import { formatTweetText } from "../format-tweet-text.js";

describe("formatTweetText", () => {
  it("should keep untouched a tweet without links", () => {
    const tweet: Tweet = {
      text: "This is a tweet without links.",
      urls: [],
    } as unknown as Tweet;
    const result = formatTweetText(tweet);
    expect(result).toStrictEqual("This is a tweet without links.");
  });
});
