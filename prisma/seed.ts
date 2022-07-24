import { userFactory } from '../tests/factories/users';
import { eventFormatFactory } from '../tests/factories/formats';
import { eventCategoryFactory } from '../tests/factories/categories';
import { eventFactory } from '../tests/factories/events';

async function seed() {
  await userFactory({ traits: ['auth-user-1'] });

  const event = await eventFactory({
    traits: ['conference', 'conference-cfp-open', 'withSurvey'],
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
    traits: ['conference-cfp-past'],
    attributes: { name: 'Devoxx France', slug: 'devoxx-france' },
  });

  await eventFactory({
    traits: ['conference-cfp-future'],
    attributes: { name: 'BDX.io', slug: 'bdx-io' },
  });

  await eventFactory({
    traits: ['conference-cfp-open'],
    attributes: { name: 'Sunny Tech', slug: 'sunny-tech' },
  });

  await eventFactory({
    traits: ['conference', 'private'],
    attributes: { name: 'VIP event', slug: 'vip-event' },
  });

  await eventFactory({
    traits: ['meetup-cfp-open'],
    attributes: { name: 'GDG Nantes', slug: 'gdg-nantes' },
  });

  await Promise.all(Array.from({ length: 50 }).map(() => eventFactory({ traits: ['meetup-cfp-open'] })));
}

seed();
