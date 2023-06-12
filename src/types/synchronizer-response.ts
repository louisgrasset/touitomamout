import {APIResponse} from './api-response.js';
import {mastodon} from 'masto';

export type SynchronizerResponse = {
    feed: APIResponse,
    mastodonClient: mastodon.Client
}
