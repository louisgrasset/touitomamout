---
title: Environment variables
---

# Environment variables

To configure the application, you have to provide environment variables. You'll find here the list of all the
environment variables by usage. `(📌 means the variable is required for the context where it is defined)`

## Core variables

| Variable            |      Default       | Category          | Description                                                                                |
|---------------------|:------------------:|-------------------|--------------------------------------------------------------------------------------------|
| `TWITTER_HANDLE` 📌 |         ∅          | **Twitter**::data | The twitter username you want to sync.                                                     |
| `TWITTER_USERNAME`  |         ∅          | **Twitter**::auth | The twitter username used to log into twitter.                                             |
| `TWITTER_PASSWORD`  |         ∅          | **Twitter**::auth | The twitter password used to log into twitter.                                             |


:::caution Twitter auth

Even if `TWITTER_USERNAME` & `TWITTER_PASSWORD` are optional, these variables are **_highly_** recommended. Using a secondary account you don't care about is recommended.

**Learn more about [Authentication against Twitter API](./twitter-authentication).**
:::

## To sync to Mastodon 🦣

| Variable                   | Default | Category                                                                 | Description                                                   |
|----------------------------|:-------:|--------------------------------------------------------------------------|---------------------------------------------------------------|
| 📌 `MASTODON_INSTANCE`     |    ∅    | ![**Mastodon**::auth](https://img.shields.io/badge/Mastodon-Auth-6364FF) | The mastodon instance the account is registered on.           |
| 📌 `MASTODON_ACCESS_TOKEN` |    ∅    | ![**Mastodon**::auth](https://img.shields.io/badge/Mastodon-Auth-6364FF) | The mastodon access token to authenticated the sync requests. |

## To sync to Bluesky ☁️

| Variable                | Default | Category                                                               | Description                                                                                                        |
|-------------------------|:-------:|------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| 📌 `BLUESKY_INSTANCE`   |    ∅    | ![**Bluesky**::auth](https://img.shields.io/badge/Bluesky-Auth-0085ff) | The bluesky instance the account is registered on.<br/>_(eg: `bsky.social`)_                                       |
| 📌 `BLUESKY_IDENTIFIER` |    ∅    | ![**Bluesky**::auth](https://img.shields.io/badge/Bluesky-Auth-0085ff) | The bluesky user identifier.<br/>_(eg: `handle.bsky.social`)_                                                      |
| 📌 `BLUESKY_PASSWORD`   |    ∅    | ![**Bluesky**::auth](https://img.shields.io/badge/Bluesky-Auth-0085ff) | The bluesky password.<br/>_(Can be a user password or an [app password](https://bsky.app/settings/app-passwords))_ |

## Synchronization 🐝

Configure here how the sync will be done.

| Variable                   | Default | Category                                                                 | Description                                 |
|----------------------------|:-------:|--------------------------------------------------------------------------|---------------------------------------------|
| 📌 `SYNC_MASTODON`         |  false  | ![**Sync**::platform](https://img.shields.io/badge/Sync-Platform-e8e8e8) | Whether run the sync to Mastodon.           |
| 📌 `SYNC_BLUESKY`          |  false  | ![**Sync**::platform](https://img.shields.io/badge/Sync-Platform-e8e8e8) | Whether run the sync to Bluesky.            |                                            |
| `SYNC_PROFILE_NAME`        |  false  | ![**Sync**::profile](https://img.shields.io/badge/Sync-Profile-yellow)   | Whether sync the profile name.              |
| `SYNC_PROFILE_DESCRIPTION` |  false  | ![**Sync**::profile](https://img.shields.io/badge/Sync-Profile-yellow)   | Whether sync the profile description.       |
| `SYNC_PROFILE_PICTURE`     |  false  | ![**Sync**::profile](https://img.shields.io/badge/Sync-Profile-yellow)   | Whether sync the profile picture.           |
| `SYNC_PROFILE_HEADER`      |  false  | ![**Sync**::profile](https://img.shields.io/badge/Sync-Profile-yellow)   | Whether sync the profile header (= banner). |

## Configuration with Docker 🐳

| Variable                | Default | Category                                                                 | Description                                    |
|-------------------------|:-------:|--------------------------------------------------------------------------|------------------------------------------------|
| 📌 `SYNC_FREQUENCY_MIN` |   30    | ![**Sync**::platform](https://img.shields.io/badge/Sync-Platform-e8e8e8) | At which frequency run the sync.               |   
| 📌 `DAEMON`             |  false  | ![**Sync**::platform](https://img.shields.io/badge/Sync-Platform-e8e8e8) | 👀Set it to **true** to synchronize regularly. |



## Configuration with Cron ⏰

| Variable    | Default | Category                                                                 | Description                                                                              |
|-------------|:-------:|--------------------------------------------------------------------------|------------------------------------------------------------------------------------------|
| 📌 `DAEMON` |  false  | ![**Sync**::platform](https://img.shields.io/badge/Sync-Platform-e8e8e8) | ⚠️ Set it to **false**. Without this, you'll get multiple instances running without end. |

## Configuration with PM2 ⏲️

| Variable                | Default | Category                                                                 | Description                      |
|-------------------------|:-------:|--------------------------------------------------------------------------|----------------------------------|
| 📌 `SYNC_FREQUENCY_MIN` |   30    | ![**Sync**::platform](https://img.shields.io/badge/Sync-Platform-e8e8e8) | At which frequency run the sync. |   
| `DAEMON`                |  false  | ![**Sync**::platform](https://img.shields.io/badge/Sync-Platform-e8e8e8) | ⚠️ Set it to **false**.          |

## Configuration with Manual execution 👏️

| Variable             | Default | Category                                                                 | Description                                                                 |
|----------------------|:-------:|--------------------------------------------------------------------------|-----------------------------------------------------------------------------|
| `DAEMON`             |  false  | ![**Sync**::platform](https://img.shields.io/badge/Sync-Platform-e8e8e8) | Set it to **false** for a one shot sync, to **true** to make it run again   |
| `SYNC_FREQUENCY_MIN` |   30    | ![**Sync**::platform](https://img.shields.io/badge/Sync-Platform-e8e8e8) | At which frequency run the sync. Only apply if you set `DAEMON` to **true** |   

