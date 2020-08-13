import * as bodyParser from "body-parser";
import cors from "cors";
import "reflect-metadata";
import { createConnection, getConnectionOptions } from "typeorm";
import { app } from "./expressapp";
import routes from "./routes";
import WorldRepo from "./database/repos/WorldRepo";
import AccountRepo from "./database/repos/AccountRepo";

getConnectionOptions()
  .then(createConnection)
  .then(async connection => {
    let a = new AccountRepo(connection);
    let w = new WorldRepo(connection);

    const owner = await a.create({
      username: "John",
      email: "exmaple@a.com",
      password: "1234"
    });

    const world = await w.create({
      owner: { id: owner.id },
      width: 100,
      height: 100,
    });

    app.use(cors());
    app.use(bodyParser.json());
    app.use('/', routes(connection));

    app.listen(8080, () => console.log('listening'));
  })
  .catch(console.error);