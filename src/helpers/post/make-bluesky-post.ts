import {BskyAgent} from '@atproto/api';
import {Tweet} from '@the-convocation/twitter-scraper';
import {createRequire} from 'module';
import {Platform} from '../../types/index.js';
import {BlueskyPost} from '../../types/post.js';
import {BLUESKY_IDENTIFIER} from '../../constants.js';
import {getCache} from '../cache/index.js';

export const makeBlueskyPost = async (client: BskyAgent, tweet: Tweet): Promise<BlueskyPost> => {
    const cache = await getCache();

    const username = await client.getProfile({actor: BLUESKY_IDENTIFIER}).then(account => account.data.handle);

    // Reply to post
    const replyData = (tweet.isSelfThread && tweet.inReplyToStatusId) ? cache[tweet.inReplyToStatusId]?.[Platform.BLUESKY] : undefined;
    const replyPost = replyData ? await client.getPost({
        cid: replyData.cid,
        rkey: replyData.rkey,
        repo: username
    }).then(p => p).catch(() => undefined)  : undefined;


    // Quote context
    const quoteData = tweet.quotedStatusId ? cache[tweet.quotedStatusId]?.[Platform.BLUESKY] : undefined;
    const quotePost = quoteData ? await client.getPost({
        cid: quoteData.cid,
        rkey: quoteData.rkey,
        repo: username,
    }) : undefined;


    const require = createRequire(import.meta.url);
    const bsky = require('@atproto/api');

    const post = new bsky.RichText({text: tweet.text!});
    await post.detectFacets(client); // automatically detects mentions and links

    return {
        status: post.text,
        username,
        facets: post.facets,
        replyPost,
        quotePost,
        tweet
    };
};
