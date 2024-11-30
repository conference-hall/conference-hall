import { eventCategoryFactory } from '../../../tests/factories/categories.ts';
import { eventFactory } from '../../../tests/factories/events.ts';
import { eventFormatFactory } from '../../../tests/factories/formats.ts';
import { talkFactory } from '../../../tests/factories/talks.ts';
import { userFactory } from '../../../tests/factories/users.ts';

export const seed = async () => {
  const speaker = await userFactory({ traits: ['clark-kent'], attributes: { bio: '' } });
  const speaker2 = await userFactory({ traits: ['peter-parker'], attributes: { bio: '' } });

  await talkFactory({
    speakers: [speaker, speaker2],
    attributes: {
      title: 'My existing talk',
      abstract: 'My existing abstract',
      level: 'ADVANCED',
      languages: ['fr'],
      references: ' My existing references',
    },
  });

  // Conference
  const event1 = await eventFactory({
    attributes: {
      name: 'Devfest Nantes',
      slug: 'devfest-nantes',
      formatsAllowMultiple: true,
      categoriesAllowMultiple: true,
    },
    traits: ['conference-cfp-open', 'withSurveyConfig'],
  });
  await eventFormatFactory({ event: event1, attributes: { name: 'Quickie' } });
  await eventCategoryFactory({ event: event1, attributes: { name: 'Web' } });

  // Without survey
  const event2 = await eventFactory({
    attributes: {
      name: 'Devfest Nantes',
      slug: 'without-survey',
      formatsRequired: true,
      categoriesRequired: true,
      formatsAllowMultiple: true,
      categoriesAllowMultiple: true,
    },
    traits: ['conference-cfp-open'],
  });
  await eventFormatFactory({ event: event2, attributes: { name: 'Quickie' } });
  await eventCategoryFactory({ event: event2, attributes: { name: 'Web' } });

  // Without tracks
  await eventFactory({
    attributes: { name: 'Devfest Nantes', slug: 'without-tracks' },
    traits: ['conference-cfp-open', 'withSurveyConfig'],
  });

  // Without survey & tracks
  await eventFactory({
    attributes: { name: 'Devfest Nantes', slug: 'without-survey-tracks', codeOfConductUrl: null },
    traits: ['conference-cfp-open'],
  });

  // CFP not open yet
  await eventFactory({
    attributes: { slug: 'conference-cfp-future' },
    traits: ['conference-cfp-future'],
  });

  // CFP not closed
  await eventFactory({
    attributes: { slug: 'conference-cfp-past' },
    traits: ['conference-cfp-past'],
  });

  // With max proposals
  await eventFactory({
    attributes: { slug: 'with-max-proposals', maxProposals: 1 },
    traits: ['conference-cfp-open'],
  });
};
