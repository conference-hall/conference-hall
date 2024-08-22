import { eventCategoryFactory } from '../../../../tests/factories/categories.ts';
import { commentFactory } from '../../../../tests/factories/comments.ts';
import { eventFactory } from '../../../../tests/factories/events.ts';
import { eventFormatFactory } from '../../../../tests/factories/formats.ts';
import { proposalFactory } from '../../../../tests/factories/proposals.ts';
import { reviewFactory } from '../../../../tests/factories/reviews.ts';
import { surveyFactory } from '../../../../tests/factories/surveys.ts';
import { talkFactory } from '../../../../tests/factories/talks.ts';
import { teamFactory } from '../../../../tests/factories/team.ts';
import { userFactory } from '../../../../tests/factories/users.ts';

export const seed = async () => {
  const organizer1 = await userFactory({ traits: ['clark-kent'] });
  const organizer2 = await userFactory({ traits: ['bruce-wayne'] });
  const organizer3 = await userFactory({ traits: ['peter-parker'] });

  const speaker1 = await userFactory({
    attributes: {
      name: 'Marie Jane',
      email: 'marie@example.com',
      bio: 'MJ Bio',
      references: 'MJ References',
      location: 'Nantes',
      company: 'MJ Corp',
      socials: {
        github: 'mj',
        twitter: 'mj',
      },
    },
  });
  const speaker2 = await userFactory({
    attributes: {
      name: 'Robin',
      email: 'robin@example.com',
      bio: 'Robin Bio',
    },
  });

  const team = await teamFactory({
    attributes: { name: 'Awesome team', slug: 'team-1' },
    owners: [organizer1],
    members: [organizer2],
    reviewers: [organizer3],
  });

  const event = await eventFactory({
    team,
    traits: ['conference-cfp-open'],
    attributes: {
      name: 'Conference 1',
      slug: 'conference-1',
      formatsAllowMultiple: true,
      categoriesAllowMultiple: true,
    },
  });

  const format1 = await eventFormatFactory({ event, attributes: { name: 'Format 1' } });
  const format2 = await eventFormatFactory({ event, attributes: { name: 'Format 2' } });
  const category1 = await eventCategoryFactory({ event, attributes: { name: 'Category 1' } });
  const category2 = await eventCategoryFactory({ event, attributes: { name: 'Category 2' } });

  await proposalFactory({
    event,
    traits: ['accepted'],
    formats: [format2],
    categories: [category2],
    talk: await talkFactory({ attributes: { title: 'Talk 2' }, speakers: [speaker2] }),
  });

  const event2 = await eventFactory({
    team,
    traits: ['conference-cfp-open'],
    attributes: {
      name: 'Conference 2',
      slug: 'conference-2',
      displayProposalsReviews: false,
      displayProposalsSpeakers: false,
      reviewEnabled: false,
    },
  });

  const proposal = await proposalFactory({
    attributes: { id: 'proposal-1' },
    event,
    formats: [format1],
    categories: [category1],
    talk: await talkFactory({
      attributes: {
        title: 'Talk 1',
        abstract: 'Talk description',
        level: 'ADVANCED',
        references: 'My talk references',
        languages: ['fr'],
      },
      speakers: [speaker1, speaker2],
    }),
  });

  await surveyFactory({
    event,
    user: speaker1,
    attributes: {
      answers: {
        gender: 'male',
        tshirt: 'XL',
        accomodation: 'yes',
        transports: ['taxi', 'train'],
        diet: ['vegan'],
        info: 'Hello',
      },
    },
  });

  await reviewFactory({ proposal, user: organizer2, attributes: { note: 3, feeling: 'NEUTRAL' } });

  await commentFactory({ proposal, user: organizer2, attributes: { channel: 'ORGANIZER', comment: 'Hello world' } });

  await proposalFactory({
    attributes: { id: 'proposal-2' },
    event: event2,
    traits: ['accepted'],
    talk: await talkFactory({ attributes: { title: 'Talk 3' }, speakers: [speaker1, speaker2] }),
  });
};
