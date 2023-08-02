import {APIResponse, Tweet} from '../types/index.js';
import {getCache} from '../helpers/cache/index.js';
import {getTweetIdFromPermalink, isTweetQuotingAnotherUser, isTweetRecent} from '../helpers/tweet/index.js';
import {tweetParser} from '../handlers/index.js';
import ora from 'ora';
import {oraPrefixer} from '../helpers/ora-prefixer.js';

export const contentMapper = async (feed: APIResponse): Promise<Tweet[]> => {
    const cache = await getCache();
    const log = ora({color: 'cyan', prefixText: oraPrefixer('content-mapper')}).start();
    log.text = '...';

    try {
        const content = feed.items
            .filter(item => isTweetRecent(item))
            .filter(item => !isTweetQuotingAnotherUser(item))
            .map(item => ({...item, id: getTweetIdFromPermalink(item.url)}))
            .filter(t => !cache[t.id])
            .map(tweet => {
                const {medias, content, replyId, quoteId} = tweetParser(tweet, log);
                return {...tweet, medias, content, replyId, quoteId};
            })
            .sort((a, b) => (a < b ? 1 : -1));
        log.succeed( 'task finished') ;
        return content;
    } catch (err) {
        log.fail(typeof err === 'string' ? err : undefined);
        console.error(`Unable to map content\n${err}`);
        return [];
    }
};
