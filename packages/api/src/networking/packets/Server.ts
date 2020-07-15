import Schema from "computed-types";
import { UserIdSchema } from '../../schemas/UserId';

export const ServerSchema = Schema({
  sender: UserIdSchema
});
