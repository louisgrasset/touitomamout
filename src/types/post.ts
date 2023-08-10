import {Tweet} from '@the-convocation/twitter-scraper';
import {AppBskyFeedPost, Facet} from '@atproto/api';

export type MastodonPost = {
    tweet: Tweet,
    status: string,
    username: string,
    inReplyToId: string | undefined,
}

export type BlueskyPost = {
    tweet: Tweet,
    status: string,
    username: string,
    facets?: Facet[],
    quotePost?: { uri: string; cid: string; value: AppBskyFeedPost.Record } | undefined
    replyPost?: { uri: string; cid: string; value: AppBskyFeedPost.Record } | undefined
}

export type Post = {
    mastodon: MastodonPost,
    bluesky: BlueskyPost,
}
