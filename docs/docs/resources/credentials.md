---
title: Credentials
---

# Credentials

To authenticate with the different platforms, you have to provide credentials. You'll find here the list of all the credentials by platform.

## Mastodon 🦣
To communicate with the mastodon instance, you'll have to generate an API Token. It is totally free.

:::info Application name
Your application name will be publicly **visible**. We recommend you to use the name of the tool you are using when you are creating the application.
In this case : `Touitomamout`.
:::

1. Go to your account's application page: `https://{yourinstance.tld}/settings/applications/new`
2. Create a new application with the following scopes:
   - `read:accounts`: get your mastodon account username
   - `write:media`: post medias
   - `write:statuses`: post toots
   - `write:accounts`: update your profile
3. Copy the token and write it in the .env file as `MASTODON_ACCESS_TOKEN`.

## Bluesky ☁️
