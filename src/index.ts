import 'dotenv/config';
import {configuration} from './configuration.js';
import {getCache} from './helpers/cache/index.js';
import {feedHandler} from './handlers/index.js';
import {contentSync} from './synchronizers/content-sync.js';
import {profileSync} from './synchronizers/profile-sync.js';


/**
 * Let the magic happens 💫
 */
(async () => {
    const {
        mastodonClient,
        metric
    } = await configuration();

    if (!mastodonClient) {
        return;
    }

    const feed = await feedHandler();
    await profileSync(feed, mastodonClient);
    await contentSync(feed, mastodonClient)
        .then(response => {
            metric.set(response.metrics.totalSynced);

            console.log('\n🦤 → 🦣');
            console.log('Touitomamout sync');
            console.log(`| ${response.metrics.justSynced.toString().padStart(5, '0')}  ʲᵘˢᵗ ˢʸⁿᶜᵉᵈ ᵖᵒˢᵗˢ`);
            console.log(`| ${response.metrics.totalSynced.toString().padStart(5, '0')}  ˢʸⁿᶜᵉᵈ ᵖᵒˢᵗˢ ˢᵒ ᶠᵃʳ`);
        });
})();
