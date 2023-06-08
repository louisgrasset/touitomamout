import * as fs from "fs";
import ora from 'ora';
import 'dotenv/config'
import {login} from "masto";
import {unescape} from "html-escaper"
import {parse} from 'node-html-parser';

// Configuration
const MASTODON_ACCESS_TOKEN = process.env.MASTODON_ACCESS_TOKEN || '';
const MASTODON_DOMAIN = process.env.MASTODON_DOMAIN || '';
const MASTODON_USERNAME = process.env.MASTODON_USERNAME || '';
const TWITTER_USERNAME = process.env.TWITTER_USERNAME || '';
const VORTEX_DOMAIN = process.env.VORTEX_DOMAIN || '';
const CACHE_PATH = './cache.json';
const DRY_RUN = false;

let mastodonClient;
let cache;
const loggerTwitter = ora({color: "cyan"}).start();

const updateCacheFile = async (data) => {
    try {
        await fs.promises.writeFile(CACHE_PATH, JSON.stringify(data ?? {}));
    } catch (err) {
        console.error('Error updating cache file:', err);
    }
};

const createCacheFile = async () => {
    try {
        // Check if the file exists
        await fs.promises.access(CACHE_PATH, fs.constants.F_OK);
    } catch (err) {
        // File doesn't exist, create a new one
        await updateCacheFile(null)
    }
};

/**
 * A method to get the cache.
 * @returns {Promise<any|null>}
 */
const getCache = async () => {
    try {
        const fileContent = await fs.promises.readFile(CACHE_PATH, 'utf-8');
        return JSON.parse(fileContent);
    } catch (err) {
        console.error('Error reading cache.json file:', err);
        return null;
    }
};

/**
 * A method to get the cache.
 * The cache is created if it doesn't exist
 * @returns {Promise<any|null>}
 */
const getOrCreateCache = async () => {
    loggerTwitter.text = 'Caching init'
    await createCacheFile();
    try {
        const fileContent = await fs.promises.readFile(CACHE_PATH, 'utf-8');
        return JSON.parse(fileContent);
    } catch (err) {
        console.error('Error reading cache.json file:', err);
        return null;
    }
};

const getTweetIdFromPermalink = (url) => url.match(/\d+$/)[0];

const tweetContentParser = (tweet) => {
    loggerTwitter.color = 'gray'
    loggerTwitter.text = 'Parsing content'
    const richContent = tweet.content_html.match(/.+?(?=<div class="rsshub-quote">|https:\/\/t\.co\/\w+<br>)/)?.[0];

    const content = unescape((richContent ?? tweet.content_html).trim())
        .replaceAll('<br>', '\n')
        .replaceAll('&nbsp;', ' ');

    const root = parse(tweet.content_html);
    root.querySelector('.rsshub-quote')?.remove();

    loggerTwitter.text = 'Parsing media'
    const images = Array.from(root.querySelectorAll('img[src]'))
        .map(media => unescape(media.getAttribute('src')));
    const videos = Array.from(root.querySelectorAll('video[src]'))
        .map(media => unescape(media.getAttribute('src')));

    loggerTwitter.text = 'Parsing metadata'
    const replyId = isTweetReplying(tweet) ? getConversationAncestorId(tweet) : undefined;

    const quoteId = isTweetSelfQuoting(tweet) ? getQuotedId(tweet) : undefined
    return {
        content, images, videos, replyId, quoteId
    }
}

const isTweetQuotingAnotherUser = tweet => {
    const link = tweet?._extra?.links.find(link => link.type === 'quote')
    if (!link) {
        return false
    }
    return link.url.match(/(\w+)\/status\/\d+/)[1] !== TWITTER_USERNAME
}

const isTweetSelfQuoting = tweet => {
    const link = tweet?._extra?.links.find(link => link.type === 'quote')
    if (!link) {
        return false
    }
    return link.url.match(/(\w+)\/status\/\d+/)[1] === TWITTER_USERNAME
}

const getQuotedId = tweet => {
    const link = tweet?._extra?.links.find(link => link.type === 'quote')
    if (!link) {
        return false
    }
    return getTweetIdFromPermalink(link.url)
}

const isTweetReplying = tweet => {
    const link = tweet?._extra?.links.find(link => link.type === 'reply')
    if (!link) {
        return false
    }
    return link.url.match(/(\w+)\/status\/\d+/)[1] === TWITTER_USERNAME
}

const getConversationAncestorId = tweet => {
    const link = tweet?._extra?.links.find(link => link.type === 'reply')
    if (!link) {
        return false
    }
    return getTweetIdFromPermalink(link.url)
}


(async () => {
    cache = await getOrCreateCache();
    mastodonClient = await login({
        url: `https://${MASTODON_DOMAIN}`, accessToken: MASTODON_ACCESS_TOKEN,
    });

    loggerTwitter.text = 'Tweets fetching'
    const url = `https://${VORTEX_DOMAIN}/twitter/user/${TWITTER_USERNAME}/`
        // params
        .concat("addLinkForPics=0")
        .concat("&showSymbolForRetweetAndReply=0")
        .concat("&includeRts=0")
        .concat("&excludeReplies=1")
        .concat("&readable=0")
        .concat("&forceWebApi=1")
        // format
        .concat(".json")

    await fetch(url)
        .then(res => res.json())
        .then(res => res.items.filter(item => !isTweetQuotingAnotherUser(item)))
        .then(res => {
            loggerTwitter.text = 'Tweets filtering';

            return res
                .map(item => ({...item, id: getTweetIdFromPermalink(item.url)}))
                .filter(t => !cache[t.id])
        })
        .then(tweetsToSync => tweetsToSync.map(tweet => {
            const {images, videos, content, replyId, quoteId} = tweetContentParser(tweet);
            return {
                ...tweet, images, videos, content, replyId, quoteId
            }
        }))
        .then(tweetToInvert => tweetToInvert.sort((a, b) => (a < b ? 1 : -1)))
        .then(async tweets => {
            loggerTwitter.succeed();
            if (!DRY_RUN) {
                for (const tweet of tweets) {
                    const loggerMastodon = ora({color: "magenta"}).start();
                    let mediaAttachments = [];


                    if (tweet.images.length) {
                        loggerMastodon.text = 'Sending images'

                        mediaAttachments = await Promise.all(tweet.images.map(async (url) => {
                            const media = await fetch(url).then(res => res.blob())
                            return await mastodonClient.v2.mediaAttachments.create({
                                file: media, // description: '',
                            }).catch(err => loggerMastodon.fail(err))
                        }));
                    }

                    if (tweet.videos.length && mediaAttachments.length === 0) {
                        loggerMastodon.text = 'Sending video'

                        // only keep the first video since mastodon doesn't support multiple ones per toot
                        mediaAttachments = await Promise.all([tweet.videos[0]].map(async (url) => {
                            const response = await fetch(url);
                            return await mastodonClient.v2.mediaAttachments.create({
                                file: await response.blob(), // description: '',
                            }).catch(err => console.error(err))
                        }));
                    }
                    const cache = await getCache();

                    loggerMastodon.text = `Sending toot\n[${tweet.content}]`
                    await mastodonClient.v1.statuses.create({
                        status: tweet.quoteId ? `${tweet.content}\n\n https://${MASTODON_DOMAIN}/@${MASTODON_USERNAME}/${cache[tweet.quoteId]}` : tweet.content,
                        visibility: 'public',
                        mediaIds: mediaAttachments.map(m => m.id),
                        inReplyToId: cache[tweet.replyId],

                    }).then(async (toot) => {
                        loggerMastodon.succeed(`Toot created!\n  | ${tweet.content}`);

                        const cache = await getCache();
                        await updateCacheFile({
                            ...cache, [getTweetIdFromPermalink(tweet.id)]: toot.id
                        })
                    })
                }
            }
        })
        .catch(err => console.error(`Failed to get data/n ${err}`))
        .finally(() => console.log("Twitter to Mastodon sync finished."))
})();
