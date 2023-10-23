import { Tweet } from "@the-convocation/twitter-scraper";

import { getEligibleTweet } from "../get-eligible-tweet.js";
import { keepRecentTweets, keepSelfQuotes, keepSelfReplies } from "../index.js";

jest.mock("../../../constants.js", () => {
  return {
    TWITTER_HANDLE: "username",
  };
});
jest.mock("../index.js", () => {
  return {
    keepSelfReplies: jest.fn(),
    keepSelfQuotes: jest.fn(),
    keepRecentTweets: jest.fn(),
  };
});

describe("getEligibleTweet", () => {
  it.each`
    isNotRetweet | isSelfReply | isSelfQuote | isRecentTweet | keep
    ${false}     | ${false}    | ${false}    | ${false}      | ${false}
    ${true}      | ${true}     | ${false}    | ${false}      | ${false}
    ${true}      | ${false}    | ${true}     | ${false}      | ${false}
    ${true}      | ${false}    | ${false}    | ${true}       | ${false}
    ${true}      | ${true}     | ${true}     | ${true}       | ${true}
  `(
    "should only return keep tweet when all conditions are met",
    async ({ isNotRetweet, isSelfReply, isSelfQuote, isRecentTweet, keep }) => {
      // Set mocks values
      (keepSelfReplies as jest.Mock).mockReturnValue(isSelfReply);
      (keepSelfQuotes as jest.Mock).mockReturnValue(isSelfQuote);
      (keepRecentTweets as jest.Mock).mockReturnValue(isRecentTweet);

      // Run test
      const result = await getEligibleTweet({
        isRetweet: !isNotRetweet,
      } as unknown as Tweet);

      // We're only checking for the keep status
      expect(result).toStrictEqual(
        keep
          ? {
              inReplyToStatus: undefined,
              inReplyToStatusId: undefined,
              isRetweet: !isNotRetweet,
              quotedStatus: undefined,
              quotedStatusId: undefined,
            }
          : undefined,
      );
    },
  );
});
