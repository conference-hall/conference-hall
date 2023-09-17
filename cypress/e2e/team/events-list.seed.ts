import { eventFactory } from '../../../tests/factories/events.ts';
import { teamFactory } from '../../../tests/factories/team.ts';
import { userFactory } from '../../../tests/factories/users.ts';

export const seed = async () => {
  const organizer1 = await userFactory({ traits: ['clark-kent'] });
  const organizer2 = await userFactory({ traits: ['bruce-wayne'] });
  const organizer3 = await userFactory({ traits: ['peter-parker'] });

  // team with event
  const team = await teamFactory({
    attributes: { name: 'Awesome team', slug: 'awesome-team' },
    owners: [organizer1],
    members: [organizer2],
    reviewers: [organizer3],
  });

  await eventFactory({
    team,
    traits: ['conference-cfp-open'],
    attributes: { name: 'Awesome event 1', slug: 'event-1' },
  });

  await eventFactory({
    team,
    traits: ['meetup-cfp-open'],
    attributes: { name: 'Awesome event 2', slug: 'event-2' },
  });

  await eventFactory({
    team,
    traits: ['conference-cfp-past', 'archived'],
    attributes: { name: 'Awesome event archived', slug: 'event-3' },
  });

  // team without events
  await teamFactory({
    attributes: { name: 'Awesome team 2', slug: 'awesome-team-2' },
    owners: [organizer1],
  });
};
