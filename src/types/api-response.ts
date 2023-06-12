import {TweetMetadata} from './index.js';

export type APIResponse = {
    title: string,
    icon: string,
    description: string,
    items: TweetMetadata[];
};
