import * as bodyParser from "body-parser";
import cors from "cors";
import "reflect-metadata";
import { createConnection, getConnectionOptions } from "typeorm";
import { app } from "./expressapp";
import routes from "./routes";
import Dependencies from "./dependencies";

getConnectionOptions()
  .then(createConnection)
  .then(async connection => {
    const dependencies = new Dependencies(
      connection,
      process.env.ACCESS_TOKEN_SECRET!,
    );

    app.use(cors());
    app.use(bodyParser.json());
    app.use('/', routes(dependencies));
    //@ts-ignore
    app.use((err, req, res, next) => {
      res.status(500)
        .send(err);
    })

    app.listen(process.env.PORT!, () => console.log('listening'));
  })
  .catch(console.error);