import { options } from "../../utils";
import { DeleteOpResult } from "../globals";

type UserId = string;

export type User = {
  name: string;
  password: string;
  role: string;
};

export type UserWithId = User & { _id: UserId };

export type FindUser = (
  filter: { id?: UserId; name?: string },
) => Promise<UserWithId | null>;
export type DeleteUser = (id: UserId) => Promise<DeleteOpResult>;
export type InsertUser = (user: User) => Promise<UserId>;
export type UpdateUser = (
  id: UserId,
  user: User,
) => Promise<"updated" | "not-found">;

export const verifyPassword = (user: User, password: string) =>
  user.password === password;

export const isAuthorized = (user: User, role: string) => user.role === role;
