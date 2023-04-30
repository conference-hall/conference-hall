import { eventFactory } from '../../../tests/factories/events';
import { proposalFactory } from '../../../tests/factories/proposals';
import { talkFactory } from '../../../tests/factories/talks';
import { userFactory } from '../../../tests/factories/users';

export const seed = async () => {
  const user = await userFactory({
    traits: ['clark-kent'],
    attributes: {
      bio: 'Clark kent biography',
      references: 'Clark kent is superman',
      address: 'Metropolis',
      company: 'Daily planet',
      socials: {
        github: 'ckent-github',
        twitter: 'ckent-twitter',
      },
    },
  });

  const talk1 = await talkFactory({ speakers: [user], attributes: { title: 'My talk 1' } });
  const talk2 = await talkFactory({ speakers: [user], attributes: { title: 'My talk 2' } });
  const talk3 = await talkFactory({ speakers: [user], attributes: { title: 'My talk 3' } });

  // Conference
  const event1 = await eventFactory({
    attributes: { name: 'Devfest Nantes', slug: 'devfest-nantes' },
    traits: ['conference-cfp-open', 'withSurvey'],
  });

  await proposalFactory({ event: event1, talk: talk1 });
  await proposalFactory({ event: event1, talk: talk2, traits: ['draft'] });
  await proposalFactory({ event: event1, talk: talk3, traits: ['acceptedAndNotified'] });

  // CFP closed
  const event2 = await eventFactory({
    attributes: { slug: 'conference-cfp-past' },
    traits: ['conference-cfp-past'],
  });

  await proposalFactory({ event: event2, talk: talk1 });
};
