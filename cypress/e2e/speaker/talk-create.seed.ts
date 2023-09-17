import { userFactory } from '../../../tests/factories/users.ts';

export const seed = async () => {
  await userFactory({ traits: ['clark-kent'] });
};
