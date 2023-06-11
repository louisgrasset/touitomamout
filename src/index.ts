import 'dotenv/config';
import {createRequire} from 'module';
import {login} from 'masto';
import {MASTODON_ACCESS_TOKEN, MASTODON_INSTANCE} from './constants.js';
import {mediaAttachmentsHandler, tweetsGetter, tootSendingHandler} from './handlers/index.js';
import {createCacheFile, getCache} from './helpers/cache/index.js';

// Configuration
const require = createRequire(import.meta.url);
const metric = require('@pm2/io').metric({
    name: 'Synced tweets',
});

/**
 * Let the magic happens 💫
 */
(async () => {
    await createCacheFile();
    const mastodonClient = await login({
        url: `https://${MASTODON_INSTANCE}`, accessToken: MASTODON_ACCESS_TOKEN,
    }).catch(err => console.error(`Failed while connecting to Mastodon instance [${MASTODON_INSTANCE}]\n${err}`));

    if(!mastodonClient) {
        return;
    }
    await tweetsGetter()
        .then(async tweets => {
            for (const tweet of tweets) {
                const mediaAttachments = await mediaAttachmentsHandler(tweet.medias, mastodonClient);
                await tootSendingHandler(await getCache(), mastodonClient, tweet, mediaAttachments);
                metric.set(Object.keys(await getCache()).length);
            }
        })
        .catch(err => console.error(`Failed to get data\n${err}`))
        .finally(async () => {
            console.log('\n🦤 → 🦣');
            console.log('Touitomamout sync');
            console.log(`| ${metric.val().toString().padStart(5, '0')}  ʲᵘˢᵗ ˢʸⁿᶜᵉᵈ ᵖᵒˢᵗˢ`);
            console.log(`| ${Object.keys(await getCache()).length.toString().padStart(5, '0')}  ˢʸⁿᶜᵉᵈ ᵖᵒˢᵗˢ ˢᵒ ᶠᵃʳ`);
        });
})();
