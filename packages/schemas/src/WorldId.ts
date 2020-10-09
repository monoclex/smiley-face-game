import { AccountIdSchema, validateAccountId } from "./AccountId";
import type { AccountId } from "./AccountId";

// reuse AccountId since both are UUIDs
export {
  AccountIdSchema as WorldIdSchema,
  validateAccountId as validateWorldId
};

export type {
  AccountId as WorldId
};
