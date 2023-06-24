# touitomamout
## 🦤 → 🦣
An easy way to synchronize your Twitter's tweets to Mastodon's toots.

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
In order to communicate with the mastodon instance, you'll have to generate an API Token. It's totally free. Reminder: your application name will be publicly visible. 
1. Go to your account's application page: `https://{yourinstance.tld}/settings/applications/new`
2. Create a new application with the following scopes:
- `read:accounts`: get your mastodon account username
- `write:media`: post medias
- `write:statuses`: post toots
- `write:accounts`: update your profile
3. Populate the [Environment](#Environment) section with your `access token`.

### RSSHub configuration
You can rely on the public instance `rsshub.app` but you can also [self-host](https://docs.rsshub.app/en/install) your own. The public instance can sometimes be out of sync because of the number of requests made on this one.

### Environment
First things first, please copy the [`.env.example`](https://github.com/louisgrasset/touitomamout/blob/main/.env.example) file to `.env`.
Then, please fill each variable.

> **Warning**
>
> Do not forget to properly choose the `EXECUTION` variable.
> Two values are allowed:
> 1. `manual`: a simple node script execution
> 2. `pm2`: spanws as a new PM2 process, named with `touitomamout-${instance_id}` pattern.


### Multiple instances
This project supports a multiple instances mode. To do so, simply provide multiple `.env` files such as `.env.instance1` and `.env.instance2`.

The deploy & deploy:update scripts will handle them properly.

## Run it

### Manually
You can simply run a `node ./dist/index.js .env` and have a one shot sync of your recent tweets.

> **Note**
>
> Don't forget to replace `.env` with the right .env filename.


### Cron
Because automation is cool, feel free to run that script everytime you need to.
Simply create your cron [here](https://crontab.guru).

### PM2 support
[PM2](https://pm2.keymetrics.io/) is a utility that allows you to monitor and run periodically your node scripts.
Thus, it can be useful for some users to deploy Touitomamout to a PM2 instance.

#### **PM2**: First run
```bash
npm run deploy
```

#### **PM2**: Update your instance after a code update
Your instance will be removed and will be generated again with the latest codebase.
Your `cache.instance.json` file is kept, so you won't have duplicated toots.
```bash
npm run ci &&
npm run build &&
npm run deploy:update
```
