import { eventFactory } from '../../../tests/factories/events';
import { userFactory } from '../../../tests/factories/users';
import { talkFactory } from '../../../tests/factories/talks';
import { eventFormatFactory } from '../../../tests/factories/formats';
import { eventCategoryFactory } from '../../../tests/factories/categories';
import { proposalFactory } from '../../../tests/factories/proposals';

export const seed = async () => {
  const user = await userFactory({ traits: ['clark-kent'], attributes: { bio: '' } });

  const talk1 = await talkFactory({
    speakers: [user],
    attributes: { title: 'My talk 1' },
  });

  const talk2 = await talkFactory({
    speakers: [user],
    attributes: { title: 'My talk 2' },
  });

  // Conference
  const event1 = await eventFactory({
    attributes: { name: 'Devfest Nantes', slug: 'devfest-nantes' },
    traits: ['conference-cfp-open', 'withSurvey'],
  });
  const format = await eventFormatFactory({ event: event1, attributes: { name: 'Quickie' } });
  const category = await eventCategoryFactory({ event: event1, attributes: { name: 'Web' } });

  await proposalFactory({ event: event1, talk: talk1, formats: [format], categories: [category] });
  await proposalFactory({ event: event1, talk: talk2, traits: ['draft'] });

  // CFP closed
  const event2 = await eventFactory({
    attributes: { slug: 'conference-cfp-past' },
    traits: ['conference-cfp-past'],
  });

  await proposalFactory({ event: event2, talk: talk1, formats: [format], categories: [category] });
};
