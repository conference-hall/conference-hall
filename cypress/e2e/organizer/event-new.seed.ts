import { eventFactory } from '../../../tests/factories/events';
import { organizationFactory } from '../../../tests/factories/organization';
import { userFactory } from '../../../tests/factories/users';

export const seed = async () => {
  const organizer1 = await userFactory({ traits: ['clark-kent'] });
  const organizer2 = await userFactory({ traits: ['bruce-wayne'] });
  const organizer3 = await userFactory({ traits: ['peter-parker'] });

  const organization = await organizationFactory({
    attributes: { name: 'Awesome orga', slug: 'awesome-orga' },
    owners: [organizer1],
    members: [organizer2],
    reviewers: [organizer3],
  });

  eventFactory({ organization, attributes: { slug: 'event-1' } });
  eventFactory({ organization, attributes: { slug: 'event-2' } });
};
