import { eventFactory } from '../../../tests/factories/events.ts';
import { teamFactory } from '../../../tests/factories/team.ts';
import { userFactory } from '../../../tests/factories/users.ts';

export const seed = async () => {
  const organizer1 = await userFactory({ traits: ['clark-kent'] });
  const organizer2 = await userFactory({ traits: ['bruce-wayne'] });
  const organizer3 = await userFactory({ traits: ['peter-parker'] });

  const team = await teamFactory({
    attributes: { slug: 'team-1' },
    owners: [organizer1],
    members: [organizer2],
    reviewers: [organizer3],
  });

  await eventFactory({ team, attributes: { slug: 'conference-1' }, traits: ['conference'] });

  await eventFactory({ team, attributes: { slug: 'meetup-1' }, traits: ['meetup'] });
};
