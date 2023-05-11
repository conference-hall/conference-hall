import { eventCategoryFactory } from '../../../../tests/factories/categories';
import { eventFactory } from '../../../../tests/factories/events';
import { ratingFactory } from '../../../../tests/factories/ratings';
import { eventFormatFactory } from '../../../../tests/factories/formats';
import { organizationFactory } from '../../../../tests/factories/organization';
import { proposalFactory } from '../../../../tests/factories/proposals';
import { talkFactory } from '../../../../tests/factories/talks';
import { userFactory } from '../../../../tests/factories/users';
import { messageFactory } from '../../../../tests/factories/messages';
import { surveyFactory } from '../../../../tests/factories/surveys';

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
      address: 'Nantes',
      company: 'MJ Corp',
      socials: {
        github: 'https://github.com',
        twitter: 'https://twitter.com',
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

  const organization = await organizationFactory({
    attributes: { name: 'Awesome orga', slug: 'orga-1' },
    owners: [organizer1],
    members: [organizer2],
    reviewers: [organizer3],
  });

  const event = await eventFactory({
    organization,
    traits: ['conference-cfp-open'],
    attributes: { name: 'Conference 1', slug: 'conference-1' },
  });

  const format1 = await eventFormatFactory({ event, attributes: { name: 'Format 1' } });
  const format2 = await eventFormatFactory({ event, attributes: { name: 'Format 2' } });
  const category1 = await eventCategoryFactory({ event, attributes: { name: 'Category 1' } });
  const category2 = await eventCategoryFactory({ event, attributes: { name: 'Category 2' } });

  const proposal = await proposalFactory({
    attributes: { id: 'proposal-1' },
    event,
    traits: ['submitted'],
    formats: [format1],
    categories: [category1],
    talk: await talkFactory({
      attributes: {
        title: 'Talk 1',
        abstract: 'Talk description',
        level: 'ADVANCED',
        references: 'Talk references',
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

  await ratingFactory({ proposal, user: organizer2, attributes: { rating: 3, feeling: 'NEUTRAL' } });

  await messageFactory({ proposal, user: organizer2, attributes: { channel: 'ORGANIZER', message: 'Hello world' } });

  await proposalFactory({
    event,
    traits: ['accepted'],
    formats: [format2],
    categories: [category2],
    talk: await talkFactory({ attributes: { title: 'Talk 2' }, speakers: [speaker2] }),
  });

  const event2 = await eventFactory({
    organization,
    traits: ['conference-cfp-open'],
    attributes: {
      name: 'Conference 2',
      slug: 'conference-2',
      displayProposalsRatings: false,
      displayProposalsSpeakers: false,
      deliberationEnabled: false,
    },
  });

  await proposalFactory({
    attributes: { id: 'proposal-2' },
    event: event2,
    traits: ['accepted'],
    talk: await talkFactory({ attributes: { title: 'Talk 3' }, speakers: [speaker1, speaker2] }),
  });
};
