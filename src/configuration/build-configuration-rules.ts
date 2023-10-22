import {
  BLUESKY_IDENTIFIER,
  BLUESKY_INSTANCE,
  BLUESKY_PASSWORD,
  MASTODON_ACCESS_TOKEN,
  MASTODON_INSTANCE,
  SYNC_BLUESKY,
  SYNC_MASTODON,
  TWITTER_HANDLE,
} from "../constants.js";

export const buildConfigurationRules = () => {
  return [
    {
      name: "TWITTER_HANDLE",
      value: TWITTER_HANDLE,
      platformEnabled: true,
      message: "Twitter username is missing.",
      details: [],
    },
    {
      name: "MASTODON_INSTANCE",
      platformEnabled: SYNC_MASTODON,
      value: MASTODON_INSTANCE,
      message: "Mastodon instance is missing.",
      details: [],
    },
    {
      name: "MASTODON_ACCESS_TOKEN",
      platformEnabled: SYNC_MASTODON,
      value: MASTODON_ACCESS_TOKEN,
      message: "Mastodon access token is missing.",
      details: [
        `Please go to https://${MASTODON_INSTANCE}/settings/applications/new to generate one.`,
      ],
    },
    {
      name: "BLUESKY_INSTANCE",
      platformEnabled: SYNC_BLUESKY,
      value: BLUESKY_INSTANCE,
      message: "Bluesky Protocol instance is missing.",
      details: [],
    },
    {
      name: "BLUESKY_IDENTIFIER",
      platformEnabled: SYNC_BLUESKY,
      value: BLUESKY_IDENTIFIER,
      message: "Bluesky Protocol identifier is missing.",
      details: [],
    },
    {
      name: "BLUESKY_PASSWORD",
      platformEnabled: SYNC_BLUESKY,
      value: BLUESKY_PASSWORD,
      message: "Bluesky Protocol password is missing.",
      details: [],
    },
  ];
};
