import { AccountStatus, Address, User } from "./user";

export type Account = {
  user: false | User;
  address: false | Address;
  accountStatus: AccountStatus;
};
