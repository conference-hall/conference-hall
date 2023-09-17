import { eventFactory } from '../../../tests/factories/events.ts';
import { teamFactory } from '../../../tests/factories/team.ts';
import { userFactory } from '../../../tests/factories/users.ts';

export const seed = async () => {
  const organizer1 = await userFactory({ traits: ['clark-kent'] });
  const organizer2 = await userFactory({ traits: ['bruce-wayne'] });
  const organizer3 = await userFactory({ traits: ['peter-parker'] });

  // team with event
  const team = await teamFactory({
    attributes: { name: 'Awesome team', slug: 'team-1' },
    owners: [organizer1],
    members: [organizer2],
    reviewers: [organizer3],
  });

  await eventFactory({
    team,
    traits: ['conference-cfp-open'],
    attributes: { name: 'Conference 1', slug: 'conference-1' },
  });
  await eventFactory({ team, traits: ['meetup-cfp-open'], attributes: { name: 'Meetup 1', slug: 'meetup-1' } });

  // team without events
  await teamFactory({
    attributes: { name: 'Awesome team 2', slug: 'awesome-team-2' },
    owners: [organizer1],
  });
};
