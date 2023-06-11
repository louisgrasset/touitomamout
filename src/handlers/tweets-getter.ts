import ora  from 'ora';
import {TWITTER_USERNAME, VORTEX_DOMAIN} from '../constants.js';
import {APIResponse} from '../types/index.js';
import {tweetParser} from './tweet-parser.js';
import {getCache} from '../helpers/cache/index.js';
import {getTweetIdFromPermalink, isTweetQuotingAnotherUser} from '../helpers/tweet/index.js';

export const tweetsGetter = async () => {
    const log = ora({color: 'cyan', prefixText: 'Tweets'}).start();
    log.text = 'fetching';

    const cache = await getCache();
    const url = `https://${VORTEX_DOMAIN}/twitter/user/${TWITTER_USERNAME}/`
        // Set query parameters
        .concat('addLinkForPics=0')
        .concat('&showSymbolForRetweetAndReply=0')
        .concat('&includeRts=0')
        .concat('&excludeReplies=1')
        .concat('&readable=0')
        .concat('&forceWebApi=1')
        // Define response format
        .concat('.json');

    return fetch(url)
        .then(res => res.json() as Promise<APIResponse>)
        .then(res => {
            log.succeed('fetched');
            log.text = 'filtering';
            return res;
        })
        .then(res => res.items.filter(item => !isTweetQuotingAnotherUser(item))
            .map(item => ({...item, id: getTweetIdFromPermalink(item.url)}))
            .filter(t => !cache[t.id])
        )
        .then(res => {
            log.succeed('filtered');
            log.text = 'parsing';
            return res;
        })
        .then(tweetsToSync => tweetsToSync.map(tweet => {
            const {medias, content, replyId, quoteId} = tweetParser(tweet, log);
            return {...tweet, medias, content, replyId, quoteId};
        }))
        .then(res => {
            log.succeed('parsed');
            log.text = 'sorting';
            return res;
        })
        .then(tweets => {
            return tweets.sort((a, b) => (a < b ? 1 : -1));
        })
        .then(res => {
            log.succeed('sorted');
            log.stop();
            return res;
        });
};
