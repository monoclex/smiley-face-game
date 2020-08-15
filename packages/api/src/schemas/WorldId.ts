import { AccountIdSchema, AccountId, validateAccountId } from "./AccountId";

// reuse AccountId since both are UUIDs
export {
  AccountIdSchema as WorldIdSchema,
  validateAccountId as validateWorldId,
  AccountId as WorldId,
};
