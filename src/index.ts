import {configuration} from './configuration.js';
import {contentSync} from './synchronizers/content-sync.js';
import {profileSync} from './synchronizers/profile-sync.js';

const {
    twitterClient,
    mastodonClient,
    synchronizedPostsCountAllTime,
    synchronizedPostsCountThisRun,
} = await configuration();

/**
 * Let the magic happens 💫
 */
const touitomamout = async () => {
    if (!mastodonClient || !twitterClient) {
        return;
    }

    await profileSync(twitterClient, mastodonClient);
    await contentSync(twitterClient, mastodonClient, synchronizedPostsCountThisRun)
        .then(response => {
            synchronizedPostsCountAllTime.set(response.metrics.totalSynced);

            console.log('\n🦤 → 🦣');
            console.log('Touitomamout sync');
            console.log(`| ${response.metrics.justSynced.toString().padStart(5, '0')}  ʲᵘˢᵗ ˢʸⁿᶜᵉᵈ ᵖᵒˢᵗˢ`);
            console.log(`| ${response.metrics.totalSynced.toString().padStart(5, '0')}  ˢʸⁿᶜᵉᵈ ᵖᵒˢᵗˢ ˢᵒ ᶠᵃʳ`);
        });
};

await touitomamout();
