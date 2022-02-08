import { createConnection } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";

// @ts-expect-error for esbuild import glob plugin
import * as entities from "./models/*";

// @ts-expect-error for esbuild import glob plugin
import * as migrations from "./migrations/*";

/**
 * Make the `require()` call invisible to esbuild,
 * so that we get node to require it.
 */
const obsfucatedRequire = require;

export default async function createTypeORMConnection() {
  const config: PostgresConnectionOptions = obsfucatedRequire("./connection.json") as PostgresConnectionOptions;

  return createConnection({
    ...config,
    synchronize: false,
    logging: true,
    migrationsRun: true,
    // @ts-expect-error we can't hope to type this
    entities: entities.default.map(({ default: x }) => x),
    // @ts-expect-error we can't hope to type this
    migrations: migrations.default.map((obj) => Object.values(obj)[0]),
  });
}
