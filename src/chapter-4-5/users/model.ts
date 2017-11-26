export type User = {
  name: string;
  password: string;
  role: string;
};

export type UserExist = (name: string, password: string) => Promise<boolean>;
