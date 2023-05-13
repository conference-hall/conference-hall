import { eventCategoryFactory } from '../../../tests/factories/categories';
import { eventFactory } from '../../../tests/factories/events';
import { eventFormatFactory } from '../../../tests/factories/formats';
import { proposalFactory } from '../../../tests/factories/proposals';
import { talkFactory } from '../../../tests/factories/talks';
import { userFactory } from '../../../tests/factories/users';

export const seed = async () => {
  const speaker1 = await userFactory({ traits: ['clark-kent'] });
  const speaker2 = await userFactory({ traits: ['bruce-wayne'] });

  const event = await eventFactory({
    attributes: { name: 'Devfest Nantes', slug: 'devfest-nantes' },
    traits: ['conference-cfp-open', 'withSurvey'],
  });
  const format = await eventFormatFactory({ event, attributes: { name: 'Quickie' } });
  const category = await eventCategoryFactory({ event, attributes: { name: 'Web' } });

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

  const talk2 = await talkFactory({ speakers: [speaker1], attributes: { title: 'My talk 2' } });
  const talk3 = await talkFactory({ speakers: [speaker1], attributes: { title: 'My talk 3' } });
  const talk4 = await talkFactory({ speakers: [speaker1], attributes: { title: 'My talk 4' } });

  await proposalFactory({
    event: event,
    talk: talk2,
    attributes: { id: 'awesome-proposal2' },
    traits: ['draft'],
  });
  await proposalFactory({
    event: event,
    talk: talk3,
    attributes: { id: 'awesome-proposal3' },
    traits: ['acceptedAndNotified'],
  });
  await proposalFactory({
    event: event,
    talk: talk4,
    attributes: { id: 'awesome-proposal4' },
    traits: ['rejectedAndNotified'],
  });
};
