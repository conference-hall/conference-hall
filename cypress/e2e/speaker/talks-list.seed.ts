import { eventFactory } from '../../../tests/factories/events.ts';
import { talkFactory } from '../../../tests/factories/talks.ts';
import { userFactory } from '../../../tests/factories/users.ts';

export const seed = async () => {
  await userFactory({ traits: ['bruce-wayne'] });
  const speaker1 = await userFactory({ traits: ['clark-kent'] });

  await eventFactory({
    attributes: {
      name: 'Devfest Nantes',
      slug: 'devfest-nantes',
    },
    traits: ['conference-cfp-open'],
  });

  await talkFactory({ attributes: { title: 'Awesome talk' }, speakers: [speaker1] });
  await talkFactory({ attributes: { title: 'Best talk ever' }, speakers: [speaker1] });
  await talkFactory({ attributes: { title: 'Archived talk', archived: true }, speakers: [speaker1] });
};
