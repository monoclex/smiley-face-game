import * as bodyParser from "body-parser";
import cors from "cors";
import "reflect-metadata";
import { createConnection, getConnectionOptions } from "typeorm";
import { app } from "./expressapp";
import routes from "./routes";
import JwtVerifier from "./database/jwt/JwtVerifier";

getConnectionOptions()
  .then(createConnection)
  .then(async connection => {
    let t = new JwtVerifier("secret");
    let p = t.isValid("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.XbPfbIHMI6arZ3Y922BhjWgQzWXcXNrz0ogtVhfEd2o");

    app.use(cors());
    app.use(bodyParser.json());
    app.use('/', routes(connection));

    app.listen(8080, () => console.log('listening'));
  })
  .catch(console.error);