import { Tweet } from "@the-convocation/twitter-scraper";
import { decode } from "html-entities";

export const formatTweetText = (tweet: Tweet): string => {
  let text = tweet.text ?? "";

  // Replace urls
  tweet.urls.forEach((url) => {
    text = text.replace(/https:\/\/t\.co\/\w+/, url);
  });

  // Remove medias t.co links
  text = text.replaceAll(/https:\/\/t\.co\/\w+/g, "");

  // Replace HTML entities with their unicode equivalent
  text = decode(text);

  // Return formatted
  return text.trim();
};
