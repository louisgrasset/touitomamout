import Link from "@docusaurus/Link";
import { ExternalLinkIcon, InfoCircledIcon } from "@radix-ui/react-icons";
import {
  Callout,
  Card,
  Flex,
  Heading,
  Separator,
  Switch,
  Text,
} from "@radix-ui/themes";
import React, { useEffect, useState } from "react";

import { SelectComponent, TextComponent, ToggleComponent } from "./fields";

const twitterSourceWarning = () => (
  <>
    We recommend you to provide an account, data retrieval is extremely limited
    without auth.{" "}
    <Link target={"_blank"} to="/docs/resources/twitter-authentication">
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        Learn more <ExternalLinkIcon />
      </span>
    </Link>
  </>
);
const daemonWarning = () => (
  <>
    The daemon mode should only be enabled when running Touitomamout in a Docker
    container or when run as a "manual sync". It is <i>enabling</i> the self
    restarting synchronization loop. <br />
    <span
      style={{
        display: "block",
        marginTop: "8px",
        paddingLeft: "8px",
        borderLeft: "2px solid #c4c4c4",
      }}
    >
      If you rely on a <b>cron</b> or <b>pm2</b>, please set it to false or
      remove the environment variable.
    </span>
  </>
);

const Generator = ({ setConfiguration }) => {
  const [data, setData] = useState({
    sourceAccount: {
      name: "🏁 Twitter source account",
      required: true,
      fields: [
        { name: "username", type: "string", value: "", env: "TWITTER_HANDLE" },
      ],
    },
    authentication: {
      name: "🦤 Twitter authentication",
      required: false,
      warning: twitterSourceWarning,
      fields: [
        {
          name: "username",
          type: "string",
          value: "",
          env: "TWITTER_USERNAME",
        },
        {
          name: "password",
          type: "string",
          value: "",
          env: "TWITTER_PASSWORD",
        },
      ],
    },
    mastodon: {
      name: "🦣 Mastodon authentication",
      required: false,
      enabled: false,
      fields: [
        {
          name: "instance",
          type: "string",
          label: "Mastodon instance (example: mastodon.social)",
          value: "mastodon.social",
          env: "MASTODON_INSTANCE",
        },
        {
          name: "token",
          type: "string",
          value: "",
          env: "MASTODON_ACCESS_TOKEN",
        },
        {
          name: "enabled",
          type: "boolean",
          value: true,
          hidden: true,
          env: "SYNC_MASTODON",
        },
      ],
    },
    bluesky: {
      name: "☁️ Bluesky authentication",
      required: false,
      enabled: false,
      fields: [
        {
          name: "instance",
          type: "string",
          label: "Bluesky instance (often bsky.social)",
          value: "bsky.social",
          env: "BLUESKY_INSTANCE",
        },
        {
          name: "username",
          label: "Bluesky username (often username.bsky.social or domain.tld)",
          type: "string",
          value: "username.bsky.social",
          env: "BLUESKY_IDENTIFIER",
        },
        {
          name: "password",
          type: "string",
          value: "",
          env: "BLUESKY_PASSWORD",
        },
        {
          name: "enabled",
          type: "boolean",
          value: true,
          hidden: true,
          env: "SYNC_BLUESKY",
        },
      ],
    },
    sync: {
      name: "🔄 Synchronization",
      required: false,
      fields: [
        {
          name: "daemon",
          warning: daemonWarning,
          label: "Daemon mode 😈 (only for Docker or manual sync)",
          type: "boolean",
          value: false,
          env: "DAEMON",
        },
        {
          name: "frequency",
          label: "Synchronization frequency in minutes",
          type: "number",
          value: 30,
          env: "SYNC_FREQUENCY_MIN",
        },
      ],
    },
    profile: {
      name: "👻 Profile synchronization",
      required: false,
      fields: [
        {
          name: "description",
          label: "Profile description",
          type: "boolean",
          value: false,
          env: "SYNC_PROFILE_DESCRIPTION",
        },
        {
          name: "picture",
          label: "Profile picture",
          type: "boolean",
          value: false,
          env: "SYNC_PROFILE_PICTURE",
        },
        {
          name: "header",
          label: "Profile header (banner)",
          type: "boolean",
          value: false,
          env: "SYNC_PROFILE_HEADER",
        },
        {
          name: "name",
          label: "Profile name",
          type: "boolean",
          value: false,
          env: "SYNC_PROFILE_NAME",
        },
      ],
    },
  });

  const buildConfigurationFile = () => {
    const env = Object.values(data)
      .reduce((builtEnv, category) => {
        if (category?.enabled === false) {
          return builtEnv;
        }
        return [
          builtEnv,
          category.fields
            // Keep booleans and non-empty strings)
            .filter((field) =>
              typeof field.value === "boolean" ? true : !!field.value,
            )
            .filter((field) => {
              if (field.validationHandler) {
                return field.validationHandler(field.value);
              }
              return true;
            })
            .map((field) => {
              return `${field.env}=${field.value.toString()}`;
            })
            .join("\n"),
        ].join("\n");
      }, "")
      .trim();

    setConfiguration(
      env.length
        ? env
        : "Touitomamout Configurator\nConfiguration will appear here 👀...",
    );
  };

  const onCategoryToggleChange = (category, enabled) => {
    setData({
      ...data,
      [category]: {
        ...data[category],
        enabled,
      },
    });
  };

  const onFieldChange = (category, field, value) => {
    const fields = data[category].fields.map((f) => {
      if (f.name === field) {
        return {
          ...f,
          value,
        };
      }
      return f;
    });
    setData({
      ...data,
      [category]: {
        ...data[category],
        fields,
      },
    });
  };

  useEffect(() => {
    buildConfigurationFile();
  }, [data]);

  return (
    <Card
      size="3"
      style={{
        maxWidth: "500px",
      }}
    >
      <Flex gap="3" direction="column">
        <Heading as={"h2"}>Generator</Heading>
        <Text>Create your configuration in a few clicks!</Text>
        <Separator my="3" size="4" />

        {Object.entries(data).map(
          ([categorySlug, category], index, entries) => (
            <Flex gap="3" direction="column" key={categorySlug}>
              <Flex gap="2" justify="between">
                <Heading size="3" as="h2">
                  {category.name}
                </Heading>
                {typeof category.enabled === "boolean" ? (
                  <Switch
                    color="cyan"
                    checked={category.enabled}
                    onCheckedChange={(enabled) =>
                      onCategoryToggleChange(categorySlug, enabled)
                    }
                  />
                ) : null}
              </Flex>

              {category.description ? (
                <Text>Create your configuration in a few clicks!</Text>
              ) : null}

              {category.warning ? (
                <Callout.Root color="gray">
                  <Callout.Icon>
                    <InfoCircledIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    <category.warning />
                  </Callout.Text>
                </Callout.Root>
              ) : null}

              {category.enabled !== false
                ? category.fields.map((field) =>
                    field?.hidden !== true ? (
                      <div key={categorySlug + field.name}>
                        {field.warning ? (
                          <Callout.Root
                            color="gray"
                            size="1"
                            style={{ marginBottom: "8px" }}
                          >
                            <Callout.Icon>
                              <InfoCircledIcon />
                            </Callout.Icon>
                            <Callout.Text>
                              <field.warning />
                            </Callout.Text>
                          </Callout.Root>
                        ) : null}

                        {field.type === "boolean" ? (
                          <ToggleComponent
                            field={field}
                            categorySlug={categorySlug}
                            category={category}
                            onChange={onFieldChange}
                          />
                        ) : null}

                        {field.type === "string" || field.type === "number" ? (
                          <TextComponent
                            field={field}
                            type={field.type}
                            categorySlug={categorySlug}
                            onChange={onFieldChange}
                          />
                        ) : null}

                        {field.type === "select" ? (
                          <SelectComponent
                            field={field}
                            categorySlug={categorySlug}
                            onChange={onFieldChange}
                          />
                        ) : null}
                      </div>
                    ) : null,
                  )
                : null}

              {index !== entries.length - 1 ? (
                <Separator my="3" size="4" />
              ) : null}
            </Flex>
          ),
        )}
      </Flex>
    </Card>
  );
};
export { Generator };
