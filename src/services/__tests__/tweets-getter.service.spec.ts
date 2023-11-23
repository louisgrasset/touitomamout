import { Scraper, Tweet } from "@the-convocation/twitter-scraper";

import { isTweetCached } from "../../helpers/tweet/index.js";
import { tweetsGetterService } from "../tweets-getter.service.js";

jest.mock("../../constants.js", () => ({}));

jest.mock("ora", () => ({
  default: jest.fn(() => ({
    start: jest
      .fn()
      .mockImplementation(() => ({ text: "", succeed: jest.fn() })),
  })),
  __esModule: true,
}));

const makeTweetMock = (update: Partial<Tweet>): Tweet => {
  const text = update.text || "Hello World";
  return {
    id: Math.floor(
      1000000000000000000 + Math.random() * 9000000000000000000,
    ).toString(),
    conversationId: undefined,
    hashtags: [],
    html: text,
    inReplyToStatus: undefined,
    inReplyToStatusId: undefined,
    isQuoted: undefined,
    isReply: undefined,
    isRetweet: undefined,
    permanentUrl: undefined,
    photos: [],
    quotedStatus: undefined,
    quotedStatusId: undefined,
    text: text,
    timestamp: Date.now(),
    urls: [],
    userId: "userId",
    username: "username",
    sensitiveContent: undefined,
    ...update,
    // Rest, not used in the service
    likes: undefined,
    isPin: undefined,
    isSelfThread: undefined,
    mentions: [],
    name: undefined,
    place: undefined,
    thread: [],
    timeParsed: undefined,
    replies: 0,
    retweets: 0,
    retweetedStatus: undefined,
    retweetedStatusId: undefined,
    videos: [],
    views: undefined,
  };
};

class MockTwitterClient {
  constructor(tweetCount?: number) {
    this.tweetCount = tweetCount || 200;
  }

  private readonly tweetCount: number;

  public async *getTweets(
    user: string,
    maxTweets?: number,
  ): AsyncGenerator<Tweet> {
    // Mocking the asynchronous generator function
    for (let i = 0; i < (this.tweetCount ?? maxTweets); i++) {
      yield {
        ...makeTweetMock({ username: user }),
        id: i.toString(),
      } as Tweet;
    }
  }
}

jest.mock("../../helpers/tweet/index.js", () => {
  const originalModule = jest.requireActual("../../helpers/tweet/index.js");
  return {
    ...originalModule,
    isTweetCached: jest.fn(),
  };
});

const isTweetCachedMock = isTweetCached as jest.Mock;

describe("tweetsGetterService", () => {
  describe("when tweets are not cached", () => {
    beforeEach(() => {
      isTweetCachedMock.mockReturnValue(false);
    });

    it("should be kept", async () => {
      const client = new MockTwitterClient(3);
      const tweets = await tweetsGetterService(client as unknown as Scraper);
      expect(tweets).toHaveLength(3);
    });
  });

  describe("when tweets are cached", () => {
    beforeEach(() => {
      isTweetCachedMock.mockReturnValue(true);
    });

    it("should be skipped", async () => {
      const client = new MockTwitterClient(3);
      const tweets = await tweetsGetterService(client as unknown as Scraper);
      expect(tweets).toHaveLength(0);
    });
  });
});
