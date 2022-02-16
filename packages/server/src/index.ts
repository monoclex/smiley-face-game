import "reflect-metadata";
import cors from "cors";
import { app } from "./expressapp";
import routes from "./routes";
import Dependencies from "./dependencies";
import dotenv from "dotenv";
import express from "express";
import type { ErrorRequestHandler } from "express-serve-static-core";
import createTypeORMConnection from "./database/createConnection";

dotenv.config();

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const PORT = process.env.PORT;
if (typeof ACCESS_TOKEN_SECRET !== "string") throw new Error("ACCESS_TOKEN_SECRET undefined");
if (typeof PORT !== "string") throw new Error("PORT undefined");

createTypeORMConnection()
  .then(async (connection) => {
    const dependencies = new Dependencies(connection, ACCESS_TOKEN_SECRET);

    app.use(cors());
    app.use(express.json());
    app.use("/", routes(dependencies));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const errorRoute: ErrorRequestHandler = (err, req, res, next) => {
      if (err instanceof Error) {
        const { message, name, stack } = err;

        // TODO: only show stack trace in debug mode maybe
        res.status(500).json({ name, error: message, stack });
      } else {
        res.status(500).json(err);
      }
    };
    app.use(errorRoute);

    app.listen(PORT, () => console.log("listening on", PORT));
  })
  .catch(console.error);
