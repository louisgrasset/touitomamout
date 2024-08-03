import { Tweet } from "@the-convocation/twitter-scraper";

import { keepRecentTweets, keepSelfQuotes, keepSelfReplies } from "../";
import { getEligibleTweet } from "../get-eligible-tweet";

vi.mock("../../../constants", () => {
  return {
    TWITTER_HANDLE: "username",
    DEBUG: true,
  };
});
vi.mock("../index", () => {
  return {
    keepSelfReplies: vi.fn(),
    keepSelfQuotes: vi.fn(),
    keepRecentTweets: vi.fn(),
  };
});

describe("getEligibleTweet", () => {
  const originalConsole = console.log;
  const consoleMock = vi.fn();
  beforeEach(() => {
    console.log = consoleMock;
  });

  afterAll(() => {
    console.log = originalConsole;
  });

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
      (keepSelfReplies as vi.Mock).mockReturnValue(isSelfReply);
      (keepSelfQuotes as vi.Mock).mockReturnValue(isSelfQuote);
      (keepRecentTweets as vi.Mock).mockReturnValue(isRecentTweet);

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

      if (result) {
        expect(consoleMock).toHaveBeenCalledTimes(1);
      }
    },
  );
});
