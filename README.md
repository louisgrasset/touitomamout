# [touitomamout](https://github.com/louisgrasset/touitomamout)
## 🦤 → 🦣+☁️
An easy way to synchronize your Twitter's tweets to Mastodon & Bluesky posts.

![Build](https://img.shields.io/github/actions/workflow/status/louisgrasset/touitomamout/ci.yml)
![Release](https://img.shields.io/github/package-json/v/louisgrasset/touitomamout/main?label=release&color=#4c1)
![License](https://img.shields.io/github/license/louisgrasset/touitomamout?color=#4c1)
![Contributors](https://img.shields.io/github/contributors/louisgrasset/touitomamout)
![Issues](https://img.shields.io/github/issues/louisgrasset/touitomamout)
![Github Stars](https://img.shields.io/github/stars/louisgrasset/touitomamout?color=ffe34e)
![Docker Pulls](https://img.shields.io/docker/pulls/louisgrasset/touitomamout?color=086dd7)
![Github Pulls](https://img.shields.io/github/downloads/louisgrasset/touitomamout/latest/total?label=ghrc%20pulls&color=086dd7)
![Docker Hub](https://img.shields.io/static/v1.svg?color=086dd7&labelColor=555555&logoColor=ffffff&label=&message=docker%20hub&logo=Docker)

![touitomamout banner](./.github/docs/touitomamout-banner.jpg)

## Installation
**Clone** the project
```bash
git clone git@github.com:louisgrasset/touitomamout.git
```

**Install** dependencies & build the project
```bash
npm ci && npm run build 
```
## Configuration
Touitomamout relies on two APIs:
- [Mastodon](https://docs.joinmastodon.org/client/intro/)
- [Twitter-Scraper](https://github.com/the-convocation/twitter-scraper)

### Mastodon configuration
In order to communicate with the mastodon instance, you'll have to generate an API Token. It's totally free. Reminder: your application name will be publicly visible. 
1. Go to your account's application page: `https://{yourinstance.tld}/settings/applications/new`
2. Create a new application with the following scopes:
- `read:accounts`: get your mastodon account username
- `write:media`: post medias
- `write:statuses`: post toots
- `write:accounts`: update your profile
3. Populate the [Environment](#Environment) section with your `access token`.

### Twitter configuration
The tweets retrieval by itself can be done without Twitter credentials. But keep in mind that twitter currently blocks guests to access users' replies.
Touitomamout is trying to restore the previous session so you'll not get spammed by the Twitter security team for each connection.


> **Note**
>
> The configuration allows you to sync a first account and authenticate with a secondary account for two reasons:
> 1. Currently, there is no simple way to authenticate with an account having 2FA enabled, so you may not want to lower your main account security.
> 2. Because this project is running with a non-official API, you may not want put your account at risk.


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

`deploy` & `deploy:update` scripts will handle them properly.

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
npm ci &&
npm run build &&
npm run deploy:update
```

### Docker
You can alternatively rely on docker and use the `docker-compose.yml` file.
