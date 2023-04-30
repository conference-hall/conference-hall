export type UserCreateInput = {
  uid: string;
  name: string;
  email?: string;
  picture?: string;
  provider?: string;
};

export type UserSocialLinks = {
  github?: string | null;
  twitter?: string | null;
};
