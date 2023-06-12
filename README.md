# touitomamout
## 🦤 → 🦣
> An easy way to synchronize your Twitter's tweets to Mastodon's toots.

## Installation
**Pull** the project
```bash
git pull git@github.com:louisgrasset/touitomamout.git
```

**Install** dependencies & build the project
```bash
npm run ci && npm run build 
```
## Configuration
Touitomamout relies on two APIs:
- [Mastodon](https://docs.joinmastodon.org/client/intro/)
- [RSSHub](https://github.com/DIYgod/RSSHub)

### Mastodon configuration
In order to communicate with the mastodon instance, you'll have to generate an API Token. It's totally free.
1. Go to your account's application page: `https://{yourinstance.tld}/settings/applications/new`
2. Create a new application with the following scopes:
- `read:accounts`: get your mastodon account username
- `write:media`: post medias
- `write:statuses`: post toots
3. See [Environment](#Environment) section to set your `access token`

### RSSHub configuration
You can rely on the public instance `rsshub.app` but you can also [self-host](https://docs.rsshub.app/en/install) your own.

### Environment
First things first, please copy the [`.env.example`](https://github.com/louisgrasset/touitomamout/blob/main/.env.example) file to `.env`.
Then, please fill each variable.

## Run it
### Manually
You can simply run a `npm run start` and have a one shot sync of your recent tweets.

### Cron
Because automation is cool, feel free to run that `start` script everytime you need to.

### PM2 support
[PM2](https://pm2.keymetrics.io/) is an utility that allows you to monitor and run periodically your node scripts.
Thus, it can be useful for some users to deploy Touitomamout to a PM2 instance.

#### First run
```bash
npm run deploy
```

#### Update your instance after a git pull
Your instance will be removed and will be generated again with the latest codebase.
Your `cache.json` file is kept, so you won't have duplicated toots.
```bash
npm run deploy:update
```
