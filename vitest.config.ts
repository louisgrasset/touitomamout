import { defineConfig, mergeConfig } from "vitest/config";

import viteConfig from "./vite.config.ts";

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      env: {
        NODE_ENV: "test",
        DEBUG: "false",
        INSTANCE_ID: "instance",
      },
      globals: true,
      testTimeout: 25000,
      mockReset: false,
      watch: false,
      cache: false,
      setupFiles: ["vitest.setup.ts"],
    },
  }),
);
