import fs from "fs";
import ora from "ora";

import { CACHE_PATH } from "../../constants.js";
import { oraPrefixer } from "../logs/ora-prefixer.js";
import { oraProgress } from "../logs/ora-progress.js";
import { getCompleteCache } from "./get-cache.js";
import migrations from "./migrations/index.js";

export const runMigrations = async () => {
  const log = ora({
    color: "gray",
    prefixText: oraPrefixer("⚙️ cache"),
  }).start();
  oraProgress(log, { after: `running migrations` }, 0, migrations.length);

  let migrationCounter = 0;
  for (const migration of migrations) {
    const outdatedCache = await getCompleteCache();
    await migration(outdatedCache)
      .then(async (updatedCache) => {
        try {
          await fs.promises.writeFile(CACHE_PATH, JSON.stringify(updatedCache));
        } catch (err) {
          log.fail("Error updating cache file:" + err);
        }
      })
      .catch((err) => {
        throw new Error(`Error running migration ${migration.name}: ${err}`);
      });

    migrationCounter++;
    oraProgress(
      log,
      { after: `running migrations` },
      migrationCounter,
      migrations.length,
    );
  }

  log.succeed("task finished");
};
