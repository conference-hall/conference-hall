import { UserFactory } from '../tests/factories/users';
import { EventFormatFactory } from '../tests/factories/formats';
import { EventCategoryFactory } from '../tests/factories/categories';
import { EventFactory } from '../tests/factories/events';

async function seed() {
  await UserFactory('auth-user-1').create();

  const event1 = await EventFactory('conference', 'conference-cfp-open', 'withSurvey').create({
    name: 'Devfest Nantes',
    slug: 'devfest-nantes',
    maxProposals: 3,
  });
  await EventFormatFactory().create({ event: { connect: { id: event1.id } } });
  await EventFormatFactory().create({ event: { connect: { id: event1.id } } });
  await EventFormatFactory().create({ event: { connect: { id: event1.id } } });
  await EventCategoryFactory().create({ event: { connect: { id: event1.id } } });
  await EventCategoryFactory().create({ event: { connect: { id: event1.id } } });
  await EventCategoryFactory().create({ event: { connect: { id: event1.id } } });

  await EventFactory('conference-cfp-past').create({
    name: 'Devoxx France',
    slug: 'devoxx-france',
  });

  await EventFactory('conference-cfp-future').create({
    name: 'BDX.io',
    slug: 'bdx-io',
  });

  await EventFactory('conference-cfp-open').create({
    name: 'Sunny Tech',
    slug: 'sunny-tech',
  });

  await EventFactory('conference', 'private').create({
    name: 'VIP event',
    slug: 'vip-event',
  });

  await EventFactory('meetup-cfp-open').create({
    name: 'GDG Nantes',
    slug: 'gdg-nantes',
  });

  await Promise.all(Array.from({ length: 50 }).map(() => EventFactory('meetup-cfp-open').create()));
}

seed();
