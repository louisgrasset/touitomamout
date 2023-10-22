import { Tweet } from "@the-convocation/twitter-scraper";

import { DEBUG } from "../../constants.js";
import { getPostExcerpt } from "../post/get-post-excerpt.js";
import { keepRecentTweets, keepSelfQuotes, keepSelfReplies } from "./index.js";

export const getEligibleTweet = async (
  tweet: Tweet,
): Promise<Tweet | undefined> => {
  const notRetweet = !tweet.isRetweet;

  const isSelfReply = await keepSelfReplies(tweet);
  const isSelfQuote = await keepSelfQuotes(tweet);

  const isRecentTweet = keepRecentTweets(tweet);

  const keep = notRetweet && isSelfReply && isSelfQuote && isRecentTweet;

  // Remove quote & reply tweets data if not self-made
  const eligibleTweet = {
    ...tweet,
    inReplyToStatus: isSelfReply ? tweet.inReplyToStatus : undefined,
    inReplyToStatusId: isSelfReply ? tweet.inReplyToStatusId : undefined,
    quotedStatus: isSelfQuote ? tweet.quotedStatus : undefined,
    quotedStatusId: isSelfQuote ? tweet.quotedStatusId : undefined,
  };

  if (DEBUG && keep) {
    console.log(
      `✅ : ${tweet.id}: from:@${tweet.username}: ${getPostExcerpt(
        tweet.text || "",
      )}`,
    );
  }

  return keep ? eligibleTweet : undefined;
};
