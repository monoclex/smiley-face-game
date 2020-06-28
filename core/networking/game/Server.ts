import { Schema } from "../../../deps.ts";
import { UserIdSchema } from '../../models/UserId.ts';

export const ServerSchema = Schema({
  sender: UserIdSchema
});
