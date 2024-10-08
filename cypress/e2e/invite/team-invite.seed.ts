import { teamFactory } from '../../../tests/factories/team.ts';
import { userFactory } from '../../../tests/factories/users.ts';

export const seed = async () => {
  const organizer1 = await userFactory({ traits: ['clark-kent'] });

  await userFactory({ traits: ['bruce-wayne'] });

  await teamFactory({
    attributes: { name: 'Awesome team', slug: 'awesome-team', invitationCode: '123' },
    owners: [organizer1],
  });
};
