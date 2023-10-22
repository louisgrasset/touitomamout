---
title: Twitter autentication
---

# Twitter Authentication

Touitomamout leverages the [Twitter Scrapper](https://github.com/the-convocation/twitter-scraper) project to
retrieve Twitter's data.

Even if you are technically allowed to use by Touitomamout without passing a Twitter username & password, the data we are
able to retrieve from it is pretty limited (euphemism). That's why we **_highly_** recommend you to provide twitter
credentials.


:::tip TLDR

Use a **secondary account** you could accept to lose or get restricted, it's worth the effort.
_(That would be the best thing to do!)_

:::

## No 2FA enabled accounts support 📵

The Twitter Scrapper is not able to give twitter the 2FA (Two-Factor Authentication) code twitter would require. Meaning Touitomamount cannot ask
its users to rely on 2FA enabled accounts.

:::note Technical details

Even if the scrapper did support 2FA, it would be a technical challenge to make Touitomamout
able to automate its tasks without having to wait for a human to input a code regularly.

:::


> The only way to authenticated with Twitter is to provide credentials for an account with 2FA **disabled**

(Tip: sms, google | dashlane | other authenticator apps = **OFF**).

## No guaranty regarding the account you will log in with ❗

Since Twitter has been acquired by E. Musk, let's be honest. People being laid off, support teams being reduced, radical
API changes, temporary absurd API rate limits, expensive API costs, etc... _(That's one of the reasons this project has
been created: let people start to use different platforms such as Mastodon or Bluesky)_

Touitomamout relies on a data retrieval process called scrapping.
Technically, [Twitter Scrapper](https://github.com/the-convocation/twitter-scraper) is using the same APIs as the
official Twitter webapp. Meaning we can get the data for free as a regular user would do while browsing on twitter.com.
Since this technique is not official at all nor especially legal, the recommendation is to rely on a secondary account you
could accept to lose or get restricted.

Until now (date of writing), no account of the author has been impacted in any way. But we can't guarantee anything,
let's be cautious.
