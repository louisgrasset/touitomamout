import { Tweet } from "@the-convocation/twitter-scraper";

export const makeTweetMock = (update: Partial<Tweet> = {}): Tweet => {
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
