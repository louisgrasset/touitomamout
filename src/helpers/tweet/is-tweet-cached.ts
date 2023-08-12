import {Tweet} from '@the-convocation/twitter-scraper';

import {Cache} from '../../types/cache.js';

export const isTweetCached = (tweet: Tweet, cache: Cache) => !!cache[tweet.id ?? 0];
