---
title: Auth system
---

# Auth system
To prevent Touitomamout to re-authenticate at each run, the application stores the authentication tokens in a file.
A `Cookies` file is always named with the following naming: `cookies.<source-twitter-username>.json`.

**Take care of this file!**

## Cookies file location
The cookies file is stored in at the root level of the project.

## Cookies file format
Here is an example of a cache file:
```json
[
    {
      "key": "<key>",
      "value": "<value>",
      "expires": "<date>",
      "maxAge": "<number>",
      "domain": "twitter.com",
      "path": "/",
      "secure": true,
      "hostOnly": false,
      "creation": "<date>",
      "lastAccessed": "<date>",
      "sameSite": "none"
    }, // And so on
]
```
