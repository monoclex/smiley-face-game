import * as bodyParser from "body-parser";
import cors from "cors";
import "reflect-metadata";
import { createConnection, getConnectionOptions } from "typeorm";
import { app } from "./expressapp";
import routes from "./routes";
import JwtVerifier from "./jwt/JwtVerifier";

getConnectionOptions()
  .then(createConnection)
  .then(async connection => {
    let t = new JwtVerifier("secret");

    app.use(cors());
    app.use(bodyParser.json());
    app.use('/', routes(connection, t));

    app.listen(8080, () => console.log('listening'));
  })
  .catch(console.error);