import { eventFormatFactory } from '../tests/factories/formats';
import { eventCategoryFactory } from '../tests/factories/categories';
import { eventFactory } from '../tests/factories/events';
import { userFactory } from 'tests/factories/users';
import { organizationFactory } from 'tests/factories/organization';

async function seed() {
  const user = await userFactory({ traits: ['clark-kent'] });
  const user2 = await userFactory({ traits: ['bruce-wayne'] });

  const organization = await organizationFactory({
    owners: [user],
    members: [user2],
    attributes: { name: 'GDG Nantes', slug: 'gdg-nantes' },
  });

  const event = await eventFactory({
    traits: ['conference', 'conference-cfp-open', 'withSurvey'],
    organization,
    attributes: {
      name: 'Devfest Nantes',
      slug: 'devfest-nantes',
      maxProposals: 3,
    },
  });
  await eventFormatFactory({ event });
  await eventFormatFactory({ event });
  await eventFormatFactory({ event });
  await eventCategoryFactory({ event });
  await eventCategoryFactory({ event });
  await eventCategoryFactory({ event });

  await eventFactory({
    traits: ['meetup-cfp-open'],
    organization,
    attributes: { name: 'GDG Nantes', slug: 'gdg-nantes' },
  });

  await eventFactory({
    traits: ['conference', 'private'],
    organization,
    attributes: { name: 'VIP event', slug: 'vip-event' },
  });

  const organization2 = await organizationFactory({
    owners: [user2],
    members: [user],
    attributes: { name: 'Devoxx', slug: 'devoxx' },
  });

  await eventFactory({
    traits: ['conference-cfp-past'],
    attributes: { name: 'Devoxx France', slug: 'devoxx-france' },
    organization: organization2,
  });

  await eventFactory({
    traits: ['conference-cfp-future'],
    attributes: { name: 'BDX.io', slug: 'bdx-io' },
  });

  await eventFactory({
    traits: ['conference-cfp-open'],
    attributes: { name: 'Sunny Tech', slug: 'sunny-tech' },
  });

  await Promise.all(Array.from({ length: 50 }).map(() => eventFactory({ traits: ['meetup-cfp-open'] })));
}

seed();
