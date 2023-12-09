import { eventFactory } from '../../../tests/factories/events.ts';
import { proposalFactory } from '../../../tests/factories/proposals.ts';
import { talkFactory } from '../../../tests/factories/talks.ts';
import { userFactory } from '../../../tests/factories/users.ts';

export const seed = async () => {
  const user = await userFactory({ traits: ['clark-kent'] });
  await userFactory({ traits: ['bruce-wayne'] });

  const talk = await talkFactory({ speakers: [user], attributes: { title: 'My talk 1' } });

  // CFP open
  const event = await eventFactory({
    attributes: { name: 'Devfest Nantes', slug: 'devfest-nantes' },
    traits: ['conference-cfp-open'],
  });

  await proposalFactory({ event, talk, traits: ['accepted-published'] });

  // CFP closed
  const event2 = await eventFactory({
    attributes: { slug: 'conference-cfp-past' },
    traits: ['conference-cfp-past'],
  });

  await proposalFactory({ event: event2, talk, traits: ['accepted-published'] });
};
