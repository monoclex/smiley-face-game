import { createConnection } from "typeorm";
import { ActualInitialDb1601775359750 } from "./migrations/1601775359750-ActualInitialDb";
import { WorldDataVersioning1605189206638 } from "./migrations/1605189206638-WorldDataVersioning";
import { GuaranteeSavedWorldsStartWithS1611488917555 } from "./migrations/1611488917555-GuaranteeSavedWorldsStartWithS";
import { ImplementShop1634458799080 } from "./migrations/1634458799080-ImplementShop";
import Account from "./models/Account";
import ShopItem from "./models/ShopItem";
import World from "./models/World";

/*
{
  "name": "default",
  "type": "postgres",
  "host": "localhost",
  "port": "5432",
  "username": "sfg",
  "password": "dev",
  "database": "sfg",
  "synchronize": false,
  "logging": true,
  "migrationsRun": true,
  "entities": ["src/database/models//*.ts"],
  "migrations": ["src/database/migrations//*.ts"],
  "cli": {
    "entitiesDir": "src/database/models",
    "migrationsDir": "src/database/migrations"
  }
}

*/

export default function createTypeORMConnection() {
  return createConnection({
    name: "default",
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "sfg",
    password: "dev",
    database: "sfg",
    synchronize: false,
    logging: true,
    migrationsRun: true,
    entities: [Account, ShopItem, World],
    migrations: [ActualInitialDb1601775359750, WorldDataVersioning1605189206638, GuaranteeSavedWorldsStartWithS1611488917555, ImplementShop1634458799080],
  });
}