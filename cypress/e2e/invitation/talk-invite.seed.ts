import { userFactory } from '../../../tests/factories/users';
import { talkFactory } from '../../../tests/factories/talks';
import { inviteFactory } from '../../../tests/factories/invite';

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

  await inviteFactory({ talk, user: speaker1, attributes: { id: 'invitation-1' } });
};
