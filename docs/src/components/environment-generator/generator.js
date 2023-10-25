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
          value: "",
          env: "MASTODON_INSTANCEBLUESKY_INSTANCE",
        },
        {
          name: "token",
          type: "string",
          value: "",
          env: "MASTODON_ACCESS_TOKENBLUESKY_IDENTIFIER",
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
          value: "",
          env: "BLUESKY_INSTANCE",
        },
        {
          name: "username",
          type: "string",
          value: "",
          env: "BLUESKY_IDENTIFIER",
        },
        {
          name: "password",
          type: "string",
          value: "",
          env: "BLUESKY_PASSWORD",
        },
      ],
    },
    profile: {
      name: "🔄 Profile synchronization",
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
    runtime: {
      name: "⚙️ Runtime configuration",
      required: true,
      fields: [
        {
          name: "instance",
          label: "Touitomamout instance id",
          type: "string",
          value: "",
          env: "INSTANCE_ID",
        },
        {
          name: "execution",
          label: "Execution method",
          type: "select",
          value: "",
          env: "EXECUTION",
          validationHandler: (value) => {
            const keepValues = ["pm2", "manual"];
            return keepValues.includes(value);
          },
          options: [
            {
              label: "PM2",
              value: "pm2",
            },
            {
              label: "Manual",
              value: "manual",
            },
            {
              label: "Docker",
              value: "docker",
            },
            {
              label: "Cron",
              value: "cron",
            },
          ],
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
            .filter((field) => !!field.value)
            .filter((field) => {
              if (field.validationHandler) {
                return field.validationHandler(field.value);
              }
              return true;
            })
            .map((field) => {
              return `${field.env}=${field.value || ""}`;
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

        {Object.entries(data).map(([categorySlug, category]) => (
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
              ? category.fields.map((field) => {
                  if (field.type === "boolean") {
                    return (
                      <div key={categorySlug + field.name}>
                        <ToggleComponent
                          field={field}
                          categorySlug={categorySlug}
                          category={category}
                          onChange={onFieldChange}
                        />
                      </div>
                    );
                  }
                  if (field.type === "string") {
                    return (
                      <div key={categorySlug + field.name}>
                        <TextComponent
                          field={field}
                          categorySlug={categorySlug}
                          onChange={onFieldChange}
                        />
                      </div>
                    );
                  }
                  if (field.type === "select") {
                    return (
                      <div key={categorySlug + field.name}>
                        <SelectComponent
                          field={field}
                          categorySlug={categorySlug}
                          onChange={onFieldChange}
                        />
                      </div>
                    );
                  }
                })
              : null}

            <Separator my="3" size="4" />
          </Flex>
        ))}
      </Flex>
    </Card>
  );
};
export { Generator };
