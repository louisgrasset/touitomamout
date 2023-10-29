---
title: Storage system
---

# Cache system
To resume the sync process where it stopped, Touitomamout keeps track of the already synced tweets. This is done by storing the tweet's id in a file.
A `Cache` file is always named with the following naming: `cache.<source-twitter-username>.json`.

## Cache file location
The cache file is stored in at the root level of the project.

## Cache file format
Here is an example of a cache file:
```json
{
  "<source-twitter-username>": {
    "<tweet-id>": {
      "mastodon": "<corresponding-mastodon-post-id>",
      "bluesky": {
        "cid": "<corresponding-bluesky-post-cid",
        "rkey": "<corresponding-bluesky-post-rkey"
      }
    }
  },
  "version": "x.x"
}
```
