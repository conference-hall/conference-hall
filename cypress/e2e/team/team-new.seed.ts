import { teamFactory } from '../../../tests/factories/team';
import { userFactory } from '../../../tests/factories/users';

export const seed = async () => {
  const organizer = await userFactory({ traits: ['clark-kent'] });
  await teamFactory({ owners: [organizer], attributes: { name: 'Awesome team 1', slug: 'team-1' } });
};
