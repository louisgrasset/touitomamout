import { Flex, Theme } from "@radix-ui/themes";
import React, { useState } from "react";

import { Configuration } from "./configuration";
import { Generator } from "./generator";

export default function Index() {
  const [configuration, setConfiguration] = useState("");

  return (
    <Theme>
      <Flex direction="row" gap="3" wrap="wrap">
        <Generator setConfiguration={setConfiguration} />
        <Configuration configuration={configuration} />
      </Flex>
    </Theme>
  );
}
