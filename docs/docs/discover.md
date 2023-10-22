---
title: Introduction
sidebar_position: 1
---

# Discover Touitomamout 👀

Let's discover Touitomamout in less than ⏲️ **5** minutes!

First, what is Touitomamout? It is a self-hosted cross-poster from **Twitter** to **Mastodon** and / or **Bluesky**. It is a tool that allows you to sync tweets to Mastodon & Bluesky. But it also allows you to synchronize the profile picture, the name, the banner & profile description if you’d like to.

![touitomamout](/img/touitomamout-small.svg)

## Features

Here are an overview of the Touitomamout features.

| Sync eligible   | Text | Images | Videos | Gifs | Profile      |
|-----------------|------|--------|--------|------|--------------|
| **Mastodon 🦣** | ✅    | ✅      | ✅      | ✅    | ✅ (optional) |
| **Bluesky ☁️**  | ✅    | ✅      | ⛔      | ⛔    | ✅ (optional) |

:::note

Gifs & Videos are not supported on Bluesky yet. But it will be soon 🤞! Until then, tweets containing gifs or videos will
be synced without the media. If no text and no compatible media is found, the post will be skipped during sync.
:::

## How is synchronization working?

### Content synchronization
Touitomamout syncs tweets from the selected account every X minutes (you have to choose this while creating your instance).
If you need to understand a single thing about sync, it would be the following:

:::tip Sync in a nutshell

Touitomamout only syncs **the content from the synced account** and only when it is **platform-agnostic**.

:::

Meaning for a given synced account @ilovetouitomamout:
- Sync will work for a thread of 5 tweets made by @ilovetouitomamout,
- But sync will skip a reply from @ilovetouitomamout to a different Twitter user that itself.

Here is a detailed view of what is synced or not.

| Sync eligible                  |  Text  |  Image |  Video | Text & Image | Text & Video |  Reply |  Quote |  Retweet | 
|--------------------------------|:------:|:------:|:------:|:------------:|:------------:|:------:|:------:|:--------:|
| Tweet from synced account      |   ✅   |   ✅   |   ✅   |      ✅      |      ✅      |   ✅   |   ✅   |    ⛔    |
| Tweet from a different account |   ⛔   |   ⛔   |   ⛔   |      ⛔      |      ⛔      |   ⛔   |   ⛔   |    ⛔    |

### Profile synchronization
This process is totally optional and **can be disabled** from the `.env` configuration file. You're able to chose to sync the following items:
1. 📸 Profile picture
2. 📜 Biography
3. 🌄 Banner
4. 🔤 Profile name

## What does Touitomamout rely on to work?

The project relies on [Twitter Scraper](https://github.com/the-convocation/twitter-scraper) to access the data from Twitter. Since it is not an official way of connecting to Twitter, please take into account the data retrieval can sometimes be slow down or broken.
Some filtering & configuration rules are taken into account to output the list of posts to sync.
Finally, posts are provided to Mastodon & Bluesky by relying on the [atproto](https://github.com/bluesky-social/atproto) and [masto.js](https://github.com/neet/masto.js) libraries.
