import * as bodyParser from "body-parser";
import cors from "cors";
import "reflect-metadata";
import { createConnection, getConnectionOptions } from "typeorm";
import { app } from "./expressapp";
import routes from "./routes";

getConnectionOptions()
  .then(createConnection)
  .then(connection => {
    app.use(cors());
    app.use(bodyParser.json());
    app.use('/', routes(connection));

    app.listen(8080, () => console.log('listening'));
  })
  .catch(console.error);