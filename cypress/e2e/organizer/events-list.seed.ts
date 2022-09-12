import { eventFactory } from '../../../tests/factories/events';
import { organizationFactory } from '../../../tests/factories/organization';
import { userFactory } from '../../../tests/factories/users';

export const seed = async () => {
  const organizer1 = await userFactory({ traits: ['clark-kent'] });
  const organizer2 = await userFactory({ traits: ['bruce-wayne'] });
  const organizer3 = await userFactory({ traits: ['peter-parker'] });

  // organization with event
  const organization = await organizationFactory({
    attributes: { name: 'Awesome orga', slug: 'awesome-orga' },
    owners: [organizer1],
    members: [organizer2],
    reviewers: [organizer3],
  });

  eventFactory({ organization, traits: ['conference-cfp-open'], attributes: { name: 'Awesome event 1' } });
  eventFactory({ organization, traits: ['meetup-cfp-open'], attributes: { name: 'Awesome event 2' } });

  // organization without events
  await organizationFactory({
    attributes: { name: 'Awesome orga 2', slug: 'awesome-orga-2' },
    owners: [organizer1],
  });
};