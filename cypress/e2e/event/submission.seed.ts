import { eventCategoryFactory } from '../../../tests/factories/categories';
import { eventFactory } from '../../../tests/factories/events';
import { eventFormatFactory } from '../../../tests/factories/formats';
import { talkFactory } from '../../../tests/factories/talks';
import { userFactory } from '../../../tests/factories/users';

export const seed = async () => {
  const user = await userFactory({ traits: ['clark-kent'], attributes: { bio: '' } });

  await talkFactory({
    speakers: [user],
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
    attributes: { name: 'Devfest Nantes', slug: 'devfest-nantes' },
    traits: ['conference-cfp-open', 'withSurvey'],
  });
  await eventFormatFactory({ event: event1, attributes: { name: 'Quickie' } });
  await eventCategoryFactory({ event: event1, attributes: { name: 'Web' } });

  // Without survey
  const event2 = await eventFactory({
    attributes: { name: 'Devfest Nantes', slug: 'without-survey', formatsRequired: true, categoriesRequired: true },
    traits: ['conference-cfp-open'],
  });
  await eventFormatFactory({ event: event2, attributes: { name: 'Quickie' } });
  await eventCategoryFactory({ event: event2, attributes: { name: 'Web' } });

  // Without tracks
  await eventFactory({
    attributes: { name: 'Devfest Nantes', slug: 'without-tracks' },
    traits: ['conference-cfp-open', 'withSurvey'],
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
