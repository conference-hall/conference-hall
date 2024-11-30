import { eventFactory } from '../../../tests/factories/events.ts';
import { proposalFactory } from '../../../tests/factories/proposals.ts';
import { talkFactory } from '../../../tests/factories/talks.ts';
import { userFactory } from '../../../tests/factories/users.ts';

export const seed = async () => {
  const user1 = await userFactory({ traits: ['clark-kent'] });

  await userFactory({ traits: ['bruce-wayne'] });

  const event = await eventFactory({
    attributes: { name: 'Devfest Nantes', slug: 'devfest-nantes' },
    traits: ['conference-cfp-open'],
  });

  const talk = await talkFactory({
    attributes: { title: 'Awesome talk' },
    speakers: [user1],
  });

  await proposalFactory({ event, talk, attributes: { invitationCode: '123' } });
};
