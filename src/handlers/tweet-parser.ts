import {Tweet, TweetMedia, TweetMediaType, TweetMetadata} from '../types/index.js';
import {unescape} from 'html-escaper';
import {parse} from 'node-html-parser';
import {isTweetReplying, getConversationAncestorId, isTweetSelfQuoting, getQuotedId} from '../helpers/tweet/index.js';
import {Ora} from 'ora';

export const tweetParser = (tweet: TweetMetadata, log: Ora): Tweet => {
    log.text = 'parsing medias';

    const richContent = tweet.content_html.match(/.+?(?=<div class="rsshub-quote">|https:\/\/t\.co\/\w+<br>)/)?.[0];
    const content = unescape((richContent ?? tweet.content_html).trim())
        .replaceAll('<br>', '\n')
        .replaceAll('&nbsp;', ' ');

    const root = parse(tweet.content_html);
    root.querySelector('.rsshub-quote')?.remove();

    const images = Array.from(root.querySelectorAll('img[src]'))
        .map(media => unescape(media.getAttribute('src') ?? ''));
    const videos = Array.from(root.querySelectorAll('video[src]'))
        .map(media => unescape(media.getAttribute('src') ?? ''));

    log.text = 'parsing metadata';

    const replyId = isTweetReplying(tweet) ? getConversationAncestorId(tweet) : undefined;
    const quoteId = isTweetSelfQuoting(tweet) ? getQuotedId(tweet) : undefined;
    const medias: TweetMedia[] = [
        ...images.map((image) => ({
            url: image,
            type: TweetMediaType.image
        })),
        ...videos.map((video) => ({
            url: video,
            type: TweetMediaType.video
        }))
    ];

    return {
        ...tweet,
        content, medias, replyId, quoteId
    };
};
