import { Scraper, Tweet } from "@the-convocation/twitter-scraper";

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
  public async *getTweets(
    user: string,
    maxTweets?: number,
  ): AsyncGenerator<Tweet> {
    // Mocking the asynchronous generator function
    for (let i = 0; i < (maxTweets || 200); i++) {
      yield {
        ...makeTweetMock({ username: user }),
        id: i.toString(),
      } as Tweet;
    }
  }
}

describe("tweetsGetterService", () => {
  it("should return a list of tweets", async () => {
    const client = new MockTwitterClient();
    const tweets = await tweetsGetterService(client as Scraper);
    expect(tweets).toHaveLength(200);
  });
});
