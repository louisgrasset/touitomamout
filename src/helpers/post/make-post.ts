import {getPostExcerpt} from './get-post-excerpt.js';
import {VOID} from '../../constants.js';
import {Tweet} from '@the-convocation/twitter-scraper';
import {mastodon} from 'masto';
import {Ora} from 'ora';
import {Post} from '../../types/post.js';
import {makeMastodonPost} from './make-mastodon-post.js';
import {BskyAgent} from '@atproto/api';
import {makeBlueskyPost} from './make-bluesky-post.js';

export const makePost = async (tweet: Tweet, mastodonClient: mastodon.rest.Client | null, blueskyClient: BskyAgent | null, log: Ora): Promise<Post> => {
    log.color = 'magenta';
    log.text = `post: → generating ${getPostExcerpt(tweet.text ?? VOID)}`;

    // Mastodon post
    let mastodonPost = null;
    if(mastodonClient) {
        mastodonPost = await makeMastodonPost(mastodonClient, tweet);
    }
    // Bluesky post
    let blueskyPost = null;
    if(blueskyClient) {
        blueskyPost = await makeBlueskyPost(blueskyClient, tweet);
    }
    return {
        mastodon: mastodonPost,
        bluesky: blueskyPost
    };
};
