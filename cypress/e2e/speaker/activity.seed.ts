import { userFactory } from '../../../tests/factories/users';

export const seed = async () => {
  await userFactory({
    traits: ['clark-kent'],
    attributes: {
      bio: 'Clark kent biography',
      references: 'Clark kent is superman',
      address: 'Metropolis',
      company: 'Daily planet',
      github: 'ckent-github',
      twitter: 'ckent-twitter',
    },
  });
};
