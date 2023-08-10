import {mastodon} from 'masto';
import {Scraper} from '@the-convocation/twitter-scraper';
import {BskyAgent} from '@atproto/api';

export type SynchronizerResponse = {
    twitterClient: Scraper,
    mastodonClient: null | mastodon.rest.Client,
    blueskyClient: null | BskyAgent
}
