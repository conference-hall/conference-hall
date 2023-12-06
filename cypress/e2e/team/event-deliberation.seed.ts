import { eventFactory } from '../../../tests/factories/events.ts';
import { proposalFactory } from '../../../tests/factories/proposals.ts';
import { talkFactory } from '../../../tests/factories/talks.ts';
import { teamFactory } from '../../../tests/factories/team.ts';
import { userFactory } from '../../../tests/factories/users.ts';

export const seed = async () => {
  const organizer1 = await userFactory({ traits: ['clark-kent'] });
  const organizer2 = await userFactory({ traits: ['bruce-wayne'] });
  const organizer3 = await userFactory({ traits: ['peter-parker'] });
  const speaker1 = await userFactory({ attributes: { name: 'Marie Jane' } });
  const speaker2 = await userFactory({ attributes: { name: 'Robin' } });

  const team = await teamFactory({
    attributes: { name: 'Awesome team', slug: 'team-1' },
    owners: [organizer1],
    members: [organizer2],
    reviewers: [organizer3],
  });

  const event = await eventFactory({
    team,
    traits: ['conference-cfp-open'],
    attributes: { name: 'Conference 1', slug: 'conference-1' },
  });

  await proposalFactory({
    event,
    talk: await talkFactory({ attributes: { title: 'Talk 1' }, speakers: [speaker1] }),
  });

  await proposalFactory({
    event,
    traits: ['accepted'],
    talk: await talkFactory({ attributes: { title: 'Talk 2' }, speakers: [speaker2] }),
  });

  await proposalFactory({
    event,
    traits: ['accepted-published'],
    talk: await talkFactory({ attributes: { title: 'Talk 2' }, speakers: [speaker2] }),
  });

  await proposalFactory({
    event,
    traits: ['rejected'],
    talk: await talkFactory({ attributes: { title: 'Talk 2' }, speakers: [speaker2] }),
  });

  await proposalFactory({
    event,
    traits: ['rejected-published'],
    talk: await talkFactory({ attributes: { title: 'Talk 3' }, speakers: [speaker1, speaker2] }),
  });
};
