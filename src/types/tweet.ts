import {TweetMetadata} from './tweet-metadata.js';

export type Tweet = TweetContent & TweetMetadata;
export type TweetContent = {
    medias: TweetMedia[],
    content: string,
    replyId?: string,
    quoteId?: string,
}

export type TweetMedia = {
    url: string,
    type: TweetMediaType
}

export enum TweetMediaType {
    image = 'image',
    video = 'video',
}
