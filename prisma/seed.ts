import { eventCategoryFactory } from '../tests/factories/categories.ts';
import { eventFactory } from '../tests/factories/events.ts';
import { eventFormatFactory } from '../tests/factories/formats.ts';
import { organizerKeyFactory } from '../tests/factories/organizer-key.ts';
import { proposalFactory } from '../tests/factories/proposals.ts';
import { reviewFactory } from '../tests/factories/reviews.ts';
import { talkFactory } from '../tests/factories/talks.ts';
import { teamFactory } from '../tests/factories/team.ts';
import { userFactory } from '../tests/factories/users.ts';

async function seed() {
  const user = await userFactory({ traits: ['clark-kent'] });
  const user2 = await userFactory({ traits: ['bruce-wayne'] });
  const user3 = await userFactory({ traits: ['peter-parker'] });

  const team = await teamFactory({
    owners: [user],
    members: [user2],
    attributes: { name: 'GDG Nantes', slug: 'gdg-nantes' },
  });

  const event = await eventFactory({
    traits: ['conference', 'conference-cfp-open', 'withSurvey', 'withFullSchedule'],
    team,
    attributes: {
      name: 'Devfest Nantes',
      slug: 'devfest-nantes',
      maxProposals: 3,
    },
  });
  const format1 = await eventFormatFactory({ event });
  const format2 = await eventFormatFactory({ event });
  await eventFormatFactory({ event });
  const cat1 = await eventCategoryFactory({ event });
  const cat2 = await eventCategoryFactory({ event });
  await eventCategoryFactory({ event });

  const meetup = await eventFactory({
    traits: ['meetup-cfp-open'],
    team,
    attributes: { name: 'GDG Nantes', slug: 'gdg-nantes' },
  });

  await eventFactory({
    traits: ['conference', 'private'],
    team,
    attributes: { name: 'VIP event', slug: 'vip-event' },
  });

  const team2 = await teamFactory({
    owners: [user2],
    members: [user],
    attributes: { name: 'Devoxx', slug: 'devoxx' },
  });

  await eventFactory({
    traits: ['conference-cfp-past'],
    attributes: { name: 'Devoxx France', slug: 'devoxx-france' },
    team: team2,
  });

  await eventFactory({
    traits: ['conference-cfp-future'],
    attributes: { name: 'BDX.io', slug: 'bdx-io' },
  });

  await eventFactory({
    traits: ['conference-cfp-open'],
    attributes: { name: 'Sunny Tech', slug: 'sunny-tech' },
  });

  const talk1 = await talkFactory({
    attributes: { level: 'BEGINNER', languages: ['fr'] },
    speakers: [user3],
  });

  const proposal1 = await proposalFactory({
    talk: talk1,
    event,
    categories: [cat1],
    formats: [format1],
  });
  await reviewFactory({ proposal: proposal1, user: user, attributes: { feeling: 'POSITIVE', note: 5 } });
  await reviewFactory({ proposal: proposal1, user: user2, attributes: { feeling: 'NEGATIVE', note: 0 } });

  const talk2 = await talkFactory({
    attributes: { level: 'BEGINNER', languages: ['en'] },
    speakers: [user3, user2],
  });

  const proposal2 = await proposalFactory({
    talk: talk2,
    event,
    categories: [cat2],
    formats: [format1, format2],
    traits: ['accepted'],
  });
  await reviewFactory({ proposal: proposal2, user: user, attributes: { feeling: 'NO_OPINION', note: null } });
  await reviewFactory({ proposal: proposal2, user: user2, attributes: { feeling: 'NEUTRAL', note: 3 } });

  const talk3 = await talkFactory({
    attributes: { level: 'ADVANCED', languages: ['fr'] },
    speakers: [user3],
  });

  await proposalFactory({ talk: talk3, event, categories: [], formats: [], traits: ['rejected'] });

  await Promise.all(
    Array.from({ length: 26 }).map(async () => {
      const talk = await talkFactory({ speakers: [user3] });
      return proposalFactory({ event: meetup, talk });
    }),
  );

  await Promise.all(
    Array.from({ length: 26 }).map(async () => {
      await eventFactory({
        traits: ['meetup-cfp-open'],
      });
    }),
  );

  await organizerKeyFactory({ attributes: { id: '123456' } });
}

seed();
