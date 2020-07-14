import Schema from "computed-types";
import { UserIdSchema } from '../../models/UserId';

export const ServerSchema = Schema({
  sender: UserIdSchema
});
