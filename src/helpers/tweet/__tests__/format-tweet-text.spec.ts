import { Tweet } from "@the-convocation/twitter-scraper";

import { formatTweetText } from "../format-tweet-text.js";

describe("formatTweetText", () => {
  it("should decode html entities from the text", () => {
    const tweet: Tweet = {
      text: "one elephant &amp; one mammoth make two animals, right?&lt; &gt; &amp; &quot; &apos; &copy; &reg; &trade; &cent; &pound; &euro; &yen; &sect; &deg; &plusmn; &times; &divide;",
      urls: [],
    } as unknown as Tweet;
    const result = formatTweetText(tweet);
    expect(result).toStrictEqual(
      "one elephant & one mammoth make two animals, right?< > & \" ' © ® ™ ¢ £ € ¥ § ° ± × ÷",
    );
  });

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
