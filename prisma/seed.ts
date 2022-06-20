import { UserFactory } from '../tests/factories/users';
import { EventFormatFactory } from '../tests/factories/formats';
import { EventCategoryFactory } from '../tests/factories/categories';
import { EventFactory } from '../tests/factories/events';

async function seed() {
  await UserFactory.create({ traits: ['auth-user-1'] });

  const event1 = await EventFactory.create({
    traits: ['conference', 'conference-cfp-open', 'withSurvey'],
    attributes: {
      name: 'Devfest Nantes',
      slug: 'devfest-nantes',
      maxProposals: 3,
    },
  });
  await EventFormatFactory.create({ eventId: event1.id });
  await EventFormatFactory.create({ eventId: event1.id });
  await EventFormatFactory.create({ eventId: event1.id });
  await EventCategoryFactory.create({ eventId: event1.id });
  await EventCategoryFactory.create({ eventId: event1.id });
  await EventCategoryFactory.create({ eventId: event1.id });

  await EventFactory.create({
    traits: ['conference-cfp-past'],
    attributes: { name: 'Devoxx France', slug: 'devoxx-france' },
  });

  await EventFactory.create({
    traits: ['conference-cfp-future'],
    attributes: { name: 'BDX.io', slug: 'bdx-io' },
  });

  await EventFactory.create({
    traits: ['conference-cfp-open'],
    attributes: { name: 'Sunny Tech', slug: 'sunny-tech' },
  });

  await EventFactory.create({
    traits: ['conference', 'private'],
    attributes: { name: 'VIP event', slug: 'vip-event' },
  });

  await EventFactory.create({
    traits: ['meetup-cfp-open'],
    attributes: { name: 'GDG Nantes', slug: 'gdg-nantes' },
  });

  await Promise.all(Array.from({ length: 50 }).map(() => EventFactory.create({ traits: ['meetup-cfp-open'] })));
}

seed();
