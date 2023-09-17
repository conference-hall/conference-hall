import { eventCategoryFactory } from '../../../tests/factories/categories.ts';
import { eventFactory } from '../../../tests/factories/events.ts';
import { eventFormatFactory } from '../../../tests/factories/formats.ts';
import { proposalFactory } from '../../../tests/factories/proposals.ts';
import { reviewFactory } from '../../../tests/factories/reviews.ts';
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

  const format1 = await eventFormatFactory({ event, attributes: { name: 'Format 1' } });
  const format2 = await eventFormatFactory({ event, attributes: { name: 'Format 2' } });
  const category1 = await eventCategoryFactory({ event, attributes: { name: 'Category 1' } });
  const category2 = await eventCategoryFactory({ event, attributes: { name: 'Category 2' } });

  const proposal = await proposalFactory({
    event,
    traits: ['submitted'],
    formats: [format1],
    categories: [category1],
    talk: await talkFactory({ attributes: { title: 'Talk 1' }, speakers: [speaker1] }),
  });

  await proposalFactory({
    event,
    traits: ['accepted'],
    formats: [format2],
    categories: [category2],
    talk: await talkFactory({ attributes: { title: 'Talk 2' }, speakers: [speaker2] }),
  });

  await proposalFactory({
    event,
    traits: ['submitted'],
    talk: await talkFactory({ attributes: { title: 'Talk 3' }, speakers: [speaker1, speaker2] }),
  });

  await reviewFactory({ proposal, user: organizer1 });
};
