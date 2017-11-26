export type User = {
  name: string;
  password: string;
  role: string;
};

export type UserExist = (name: string, password: string) => Promise<boolean>;
export type FindUser = (name: string) => Promise<User | null>;

export const verifyPassword = (user: User, password: string) =>
  user.password === password;
