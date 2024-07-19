import { userFactory } from '../../../tests/factories/users.ts';

export const seed = async () => {
  await userFactory({
    traits: ['clark-kent'],
    attributes: {
      bio: 'Clark kent biography',
      references: 'Clark kent is superman',
      location: 'Metropolis',
      company: 'Daily planet',
      socials: {
        github: 'ckent-github',
        twitter: 'ckent-twitter',
      },
    },
  });
};
