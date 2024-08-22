import { eventCategoryFactory } from '../../../tests/factories/categories.ts';
import { eventFactory } from '../../../tests/factories/events.ts';
import { eventFormatFactory } from '../../../tests/factories/formats.ts';
import { proposalFactory } from '../../../tests/factories/proposals.ts';
import { talkFactory } from '../../../tests/factories/talks.ts';
import { userFactory } from '../../../tests/factories/users.ts';

export const seed = async () => {
  const speaker1 = await userFactory({ traits: ['clark-kent'] });
  const speaker2 = await userFactory({ traits: ['bruce-wayne'] });

  const event = await eventFactory({
    attributes: {
      name: 'Devfest Nantes',
      slug: 'devfest-nantes',
      formatsRequired: true,
      categoriesRequired: true,
      formatsAllowMultiple: true,
      categoriesAllowMultiple: true,
    },
    traits: ['conference-cfp-open', 'withSurvey'],
  });
  const format = await eventFormatFactory({ event, attributes: { name: 'Quickie' } });
  await eventFormatFactory({ event, attributes: { name: 'Quickie 2' } });
  const category = await eventCategoryFactory({ event, attributes: { name: 'Web' } });
  await eventCategoryFactory({ event, attributes: { name: 'Web 2' } });

  const event2 = await eventFactory({
    attributes: { slug: 'event-with-draft' },
    traits: ['conference-cfp-open'],
  });

  const talk = await talkFactory({
    attributes: {
      id: 'awesome-talk',
      title: 'Awesome talk',
      abstract: 'Awesome abstract',
      languages: ['fr'],
      level: 'ADVANCED',
      references: 'Awesome references',
    },
    speakers: [speaker1, speaker2],
  });

  await proposalFactory({
    event,
    talk,
    formats: [format],
    categories: [category],
    attributes: { id: 'awesome-proposal' },
  });

  await proposalFactory({
    event: event2,
    talk,
    attributes: { id: 'awesome-proposal2' },
    traits: ['draft'],
  });
};
