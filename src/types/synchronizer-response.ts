import {mastodon} from 'masto';
import {Scraper} from '@the-convocation/twitter-scraper';

export type SynchronizerResponse = {
    twitterClient: Scraper,
    mastodonClient: mastodon.rest.Client
}
