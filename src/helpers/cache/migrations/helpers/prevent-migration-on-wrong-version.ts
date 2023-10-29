export const preventMigrationOnWrongVersion = (
  outdatedCache: NonNullable<unknown>,
  requiredVersion: string,
) =>
  (outdatedCache as NonNullable<unknown & { version: string }>).version !==
  requiredVersion;
