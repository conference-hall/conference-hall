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
  const talk5 = await talkFactory({ speakers: [speaker1], attributes: { title: 'My talk 5' } });
  const talk6 = await talkFactory({ speakers: [speaker1], attributes: { title: 'My talk 6' } });

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
  await proposalFactory({
    event: event,
    talk: talk5,
    attributes: { id: 'awesome-proposal5' },
    traits: ['declined'],
  });
  await proposalFactory({
    event: event,
    talk: talk6,
    attributes: { id: 'awesome-proposal6' },
    traits: ['confirmed'],
  });
};
