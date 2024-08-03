import ora from "ora";

import { Cache } from "../../types";
import { oraPrefixer, oraProgress } from "../logs";
import { getCache } from "./get-cache";
import migrations from "./migrations";
import { writeToCacheFile } from "./write-to-cache-file";

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
