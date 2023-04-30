import { talkFactory } from '../../../tests/factories/talks';
import { userFactory } from '../../../tests/factories/users';

export const seed = async () => {
  const user1 = await userFactory({ traits: ['clark-kent'] });

  await userFactory({ traits: ['bruce-wayne'] });

  await talkFactory({
    attributes: {
      title: 'Awesome talk',
      invitationCode: '123',
    },
    speakers: [user1],
  });
};
