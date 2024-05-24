import { Flex, Select, Switch, Text, TextField } from "@radix-ui/themes";
import React from "react";

import { getFormattedLabel } from "./utils";

const TextComponent = ({
  categorySlug,
  field,
  onChange,
  type = "text" || "number",
}) => {
  const label = getFormattedLabel(field);

  return (
    <>
      <Text size="2">{label}</Text>
      <TextField.Root
        radius="large"
        variant="surface"
        type={type}
        placeholder={label}
        onChange={(e) => onChange(categorySlug, field.name, e.target.value)}
        value={field.value}
      />
    </>
  );
};

const ToggleComponent = ({ category, categorySlug, field, onChange }) => {
  const label = getFormattedLabel(field);

  return (
    <Flex gap="2" justify="between" style={{ paddingBottom: "8px" }}>
      <Text size="2">{label}</Text>
      <Switch
        color="cyan"
        radius="large"
        checked={category.enabled}
        onCheckedChange={(enabled) =>
          onChange(categorySlug, field.name, enabled)
        }
      />
    </Flex>
  );
};
const SelectComponent = ({ categorySlug, field, onChange }) => {
  const label = getFormattedLabel(field);

  return (
    <Flex gap="2" direction="column">
      <Text size="2">{label}</Text>
      <Select.Root
        value={field.value}
        onValueChange={(selectedValue) =>
          onChange(categorySlug, field.name, selectedValue)
        }
      >
        <Select.Trigger placeholder={label} />
        <Select.Content color="cyan">
          <Select.Group>
            <Select.Label>{label}</Select.Label>
            {field.options.map((option) => (
              <Select.Item key={option.value} value={option.value}>
                {option.label}
              </Select.Item>
            ))}
          </Select.Group>
        </Select.Content>
      </Select.Root>
    </Flex>
  );
};

export { SelectComponent, TextComponent, ToggleComponent };
