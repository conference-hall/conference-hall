import { eventFactory } from '../../../tests/factories/events';
import { teamFactory } from '../../../tests/factories/team';
import { userFactory } from '../../../tests/factories/users';

export const seed = async () => {
  const organizer1 = await userFactory({ traits: ['clark-kent'] });
  const organizer2 = await userFactory({ traits: ['bruce-wayne'] });
  const organizer3 = await userFactory({ traits: ['peter-parker'] });

  // team with event
  const team = await teamFactory({
    attributes: { name: 'Awesome orga', slug: 'orga-1' },
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
    attributes: { name: 'Awesome orga 2', slug: 'awesome-orga-2' },
    owners: [organizer1],
  });
};
