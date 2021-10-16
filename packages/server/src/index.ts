import * as bodyParser from "body-parser";
import cors from "cors";
import "reflect-metadata";
import { createConnection, getConnectionOptions } from "typeorm";
import { app } from "./expressapp";
import routes from "./routes";
import Dependencies from "./dependencies";
import dotenv from "dotenv";
import type { ErrorRequestHandler } from "express-serve-static-core";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const PORT = process.env.PORT;
if (typeof ACCESS_TOKEN_SECRET !== "string") throw new Error("ACCESS_TOKEN_SECRET undefined");
if (typeof PORT !== "string") throw new Error("PORT undefined");

getConnectionOptions()
  .then(createConnection)
  .then(async (connection) => {
    const dependencies = new Dependencies(connection, ACCESS_TOKEN_SECRET);

    app.use(cors());
    app.use(bodyParser.json());
    app.use("/", routes(dependencies));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const errorRoute: ErrorRequestHandler = (err, req, res, next) => {
      res.status(500).send(err);
    };
    app.use(errorRoute);

    app.listen(PORT, () => console.log("listening on", PORT));
  })
  .catch(console.error);
