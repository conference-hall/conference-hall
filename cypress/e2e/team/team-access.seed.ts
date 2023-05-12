import { teamFactory } from '../../../tests/factories/team';
import { userFactory } from '../../../tests/factories/users';

export const seed = async () => {
  // user without organizer access
  await userFactory({ traits: ['bruce-wayne'] });

  // organizer without team
  await userFactory({ traits: ['peter-parker'], isOrganizer: true });

  // organizer with team
  const organizer = await userFactory({ traits: ['clark-kent'] });
  await teamFactory({ owners: [organizer], attributes: { name: 'Awesome team' } });
};
