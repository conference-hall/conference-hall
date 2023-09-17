import { eventCategoryFactory } from '../../../tests/factories/categories.ts';
import { eventFactory } from '../../../tests/factories/events.ts';
import { eventFormatFactory } from '../../../tests/factories/formats.ts';
import { proposalFactory } from '../../../tests/factories/proposals.ts';
import { talkFactory } from '../../../tests/factories/talks.ts';
import { userFactory } from '../../../tests/factories/users.ts';

export const seed = async () => {
  const user = await userFactory({ traits: ['clark-kent'], attributes: { bio: '' } });

  const talk1 = await talkFactory({ speakers: [user], attributes: { title: 'My talk 1' } });
  const talk2 = await talkFactory({ speakers: [user], attributes: { title: 'My talk 2' } });
  const talk3 = await talkFactory({ speakers: [user], attributes: { title: 'My talk 3' } });
  const talk4 = await talkFactory({ speakers: [user], attributes: { title: 'My talk 4' } });
  const talk5 = await talkFactory({ speakers: [user], attributes: { title: 'My talk 5' } });
  const talk6 = await talkFactory({ speakers: [user], attributes: { title: 'My talk 6' } });

  // Conference
  const event1 = await eventFactory({
    attributes: { name: 'Devfest Nantes', slug: 'devfest-nantes' },
    traits: ['conference-cfp-open', 'withSurvey'],
  });
  const format = await eventFormatFactory({ event: event1, attributes: { name: 'Quickie' } });
  const category = await eventCategoryFactory({ event: event1, attributes: { name: 'Web' } });

  await proposalFactory({ event: event1, talk: talk1, formats: [format], categories: [category] });
  await proposalFactory({ event: event1, talk: talk2, traits: ['draft'] });
  await proposalFactory({ event: event1, talk: talk3, traits: ['acceptedAndNotified'] });
  await proposalFactory({ event: event1, talk: talk4, traits: ['rejectedAndNotified'] });
  await proposalFactory({ event: event1, talk: talk5, traits: ['declined'] });
  await proposalFactory({ event: event1, talk: talk6, traits: ['confirmed'] });

  // CFP closed
  const event2 = await eventFactory({
    attributes: { slug: 'conference-cfp-past' },
    traits: ['conference-cfp-past'],
  });

  await proposalFactory({ event: event2, talk: talk1, formats: [format], categories: [category] });

  // No talks
  await eventFactory({
    attributes: { slug: 'event-without-talks' },
    traits: ['conference-cfp-open'],
  });
};
