import {BskyAgent} from '@atproto/api';
import {Scraper} from '@the-convocation/twitter-scraper';
import {mastodon} from 'masto';

export type SynchronizerResponse = {
    twitterClient: Scraper,
    mastodonClient: null | mastodon.rest.Client,
    blueskyClient: null | BskyAgent
}
