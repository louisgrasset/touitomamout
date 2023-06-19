import ora from 'ora';
import {TWITTER_USERNAME, RSSHUB_INSTANCE} from '../constants.js';
import {APIResponse} from '../types/index.js';
import {oraPrefixer} from '../helpers/ora-prefixer.js';

/**
 * A method to get the RSSHub feed data
 */
export const feedHandler = async () => {
    const log = ora({color: 'white', prefixText: oraPrefixer('feed-handler')}).start();
    log.text = 'fetching';

    /**
     * Reminder:
     * The `count` param requests the API a specific number of tweets (includings rt & replies).
     * Thus, on a total of 50 tweets including 10 replies & 10 RTs, you'll get 30 tweets with this query.
     **/
    const url = `https://${RSSHUB_INSTANCE}/twitter/user/${TWITTER_USERNAME}/`
        // Set query parameters
        .concat('count=50')
        .concat('&addLinkForPics=0')
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
            log.succeed('task finished');
            return res;
        })
        .catch(() => {
            const error = 'task failed';
            log.fail(error);
            throw new Error(error);
        });
};
