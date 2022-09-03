import { userFactory } from '../../../tests/factories/users';

export const seed = async () => {
  await userFactory({ traits: ['clark-kent'] });
};
