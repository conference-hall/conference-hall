import { userFactory } from '../../../tests/factories/users';
import { talkFactory } from '../../../tests/factories/talks';
import { inviteFactory } from '../../../tests/factories/invite';
import { eventFactory } from '../../../tests/factories/events';
import { proposalFactory } from '../../../tests/factories/proposals';

export const seed = async () => {
  const speaker1 = await userFactory({ traits: ['clark-kent'] });
  const speaker2 = await userFactory({ traits: ['bruce-wayne'] });

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

  const event = await eventFactory({
    attributes: { name: 'Devfest Nantes', slug: 'devfest-nantes' },
    traits: ['conference-cfp-open', 'withSurvey'],
  });

  const proposal = await proposalFactory({
    event,
    talk,
    attributes: { id: 'awesome-proposal' },
  });

  inviteFactory({ proposal, user: speaker1, attributes: { id: 'invitation-1' } });
};
