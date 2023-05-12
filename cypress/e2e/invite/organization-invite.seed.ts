import { teamFactory } from '../../../tests/factories/team';
import { userFactory } from '../../../tests/factories/users';

export const seed = async () => {
  const organizer1 = await userFactory({ traits: ['clark-kent'] });

  await userFactory({ traits: ['bruce-wayne'] });

  await teamFactory({
    attributes: { name: 'Awesome orga', slug: 'awesome-orga', invitationCode: '123' },
    owners: [organizer1],
  });
};
