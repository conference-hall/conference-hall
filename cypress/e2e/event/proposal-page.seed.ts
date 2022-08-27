import { userFactory } from '../../../tests/factories/users';
import { eventFactory } from '../../../tests/factories/events';
import { talkFactory } from '../../../tests/factories/talks';
import { proposalFactory } from '../../../tests/factories/proposals';
import { eventFormatFactory } from '../../../tests/factories/formats';
import { eventCategoryFactory } from '../../../tests/factories/categories';

export const seed = async () => {
  const speaker1 = await userFactory({ traits: ['clark-kent'] });
  const speaker2 = await userFactory({ traits: ['bruce-wayne'] });

  const event = await eventFactory({
    attributes: { name: 'Devfest Nantes', slug: 'devfest-nantes' },
    traits: ['conference-cfp-open', 'withSurvey'],
  });
  const format = await eventFormatFactory({ event, attributes: { name: 'Quickie' } });
  const category = await eventCategoryFactory({ event, attributes: { name: 'Web' } });

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
