---
title: Environment variables
---

# Environment variables

To configure the application, you have to provide environment variables. You'll find here the list of all the
environment variables by usage. `(📌 means the variable is required for the context where it is defined)`

## Core variables

| Variable            | Default | Category          | Description                                    |
|---------------------|:-------:|-------------------|------------------------------------------------|
| `TWITTER_HANDLE` 📌 |    ∅    | **Twitter**::data | The twitter username you want to sync.         |
| `TWITTER_USERNAME`  |    ∅    | **Twitter**::auth | The twitter username used to log into twitter. |
| `TWITTER_PASSWORD`  |    ∅    | **Twitter**::auth | The twitter password used to log into twitter. |

:::caution Twitter auth

Even if `TWITTER_USERNAME` & `TWITTER_PASSWORD` are optional, these variables are **_highly_** recommended. Using a secondary account you don't care about is recommended.

**Learn more about [Authentication against Twitter API](./twitter-authentication).**
:::

## To sync to Mastodon 🦣

| Variable                   | Default | Category           | Description                                                   |
|----------------------------|:-------:|--------------------|---------------------------------------------------------------|
| 📌 `MASTODON_INSTANCE`     |    ∅    | **Mastodon**::auth | The mastodon instance the account is registered on.           |
| 📌 `MASTODON_ACCESS_TOKEN` |    ∅    | **Mastodon**::auth | The mastodon access token to authenticated the sync requests. |

## To sync to Bluesky ☁️

| Variable                | Default | Category          | Description                                                                                                        |
|-------------------------|:-------:|-------------------|--------------------------------------------------------------------------------------------------------------------|
| 📌 `BLUESKY_INSTANCE`   |    ∅    | **Bluesky**::auth | The bluesky instance the account is registered on.<br/>_(eg: `bsky.social`)_                                       |
| 📌 `BLUESKY_IDENTIFIER` |    ∅    | **Bluesky**::auth | The bluesky user identifier.<br/>_(eg: `handle.bsky.social`)_                                                      |
| 📌 `BLUESKY_PASSWORD`   |    ∅    | **Bluesky**::auth | The bluesky password.<br/>_(Can be a user password or an [app password](https://bsky.app/settings/app-passwords))_ |

## Synchronization 🐝

Configure here how the sync will be done.

| Variable                   | Default | Category           | Description                                 |
|----------------------------|:-------:|--------------------|---------------------------------------------|
| 📌 `SYNC_MASTODON`         |  false  | **Sync**::platform | Whether run the sync to Mastodon.           |
| 📌 `SYNC_BLUESKY`          |  false  | **Sync**::platform | Whether run the sync to Bluesky.            |
| `SYNC_PROFILE_NAME`        |  false  | **Sync**::profile  | Whether sync the profile name.              |
| `SYNC_PROFILE_DESCRIPTION` |  false  | **Sync**::profile  | Whether sync the profile description.       |
| `SYNC_PROFILE_PICTURE`     |  false  | **Sync**::profile  | Whether sync the profile picture.           |
| `SYNC_PROFILE_HEADER`      |  false  | **Sync**::profile  | Whether sync the profile header (= banner). |

## Configuration with Docker 🐳

## Configuration with Cron ⏰

## Configuration with PM2 ⏲️

|     Variable     |  Default   | Category         | Description                                                                                           |
|:----------------:|:----------:|------------------|-------------------------------------------------------------------------------------------------------|
|  📌 `EXECUTION`  |     ∅      | **PM2**::runtime | The execution type you want to rely on (if you use the `deploy.sh` script). Value **has to be 'pm2'** |
|  `INSTANCE_ID`   | 'instance' | **PM2**::runtime | The pm2 instance name suffix. Will generate `touitomamout-[INSTANCE_ID]`.                             |

## Configuration with Manual execution 👏️

|     Variable     | Default | Category            | Description                                                                                              |
|:----------------:|:-------:|---------------------|----------------------------------------------------------------------------------------------------------|
|  📌 `EXECUTION`  |    ∅    | **Manual**::runtime | The execution type you want to rely on (if you use the `deploy.sh` script). Value **has to be 'manual'** |
