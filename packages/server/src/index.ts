import cors from "cors";
import "reflect-metadata";
import { app } from "./expressapp";
import routes from "./routes";

// const connection = await createConnection(await getConnectionOptions());

// tryTypeOrm().catch(console.error);

app.use(cors());
app.use('/', routes);

app.listen(8080, () => console.log('listening'));