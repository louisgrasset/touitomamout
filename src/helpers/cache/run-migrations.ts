import ora from "ora";

import { Cache } from "../../types/index.js";
import { oraPrefixer, oraProgress } from "../logs/index.js";
import { getCache } from "./get-cache.js";
import migrations from "./migrations/index.js";
import { writeToCacheFile } from "./write-to-cache-file.js";

export const runMigrations = async () => {
  const log = ora({
    color: "gray",
    prefixText: oraPrefixer("⚙️ cache"),
  }).start();
  oraProgress(log, { after: `running migrations` }, 0, migrations.length);

  let migrationCounter = 0;
  for (const migration of migrations) {
    const outdatedCache = await getCache();
    await migration(outdatedCache)
      .then(async (updatedCache) => writeToCacheFile(updatedCache as Cache))
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
