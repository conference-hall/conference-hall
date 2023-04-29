export type UserCreateInput = {
  uid: string;
  name: string;
  email?: string;
  picture?: string;
  provider?: string;
};
