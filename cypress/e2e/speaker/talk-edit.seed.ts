import { eventFactory } from '../../../tests/factories/events.ts';
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
    },
    traits: ['conference-cfp-open'],
  });

  await eventFactory({ attributes: { name: 'GDG Nantes' }, traits: ['meetup-cfp-open'] });

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

  await proposalFactory({ event, talk });
};
