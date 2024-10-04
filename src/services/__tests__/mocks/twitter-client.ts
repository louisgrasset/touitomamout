import { Tweet } from "@the-convocation/twitter-scraper";

import { makeTweetMock } from "../helpers/make-tweet-mock";

export class MockTwitterClient {
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
