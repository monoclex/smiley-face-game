import Account from "@/database/models/Account";

type AccountLike = Omit<Account, "worlds">

export default AccountLike;
