import { eventCategoryFactory } from '../../../tests/factories/categories.ts';
import { eventFactory } from '../../../tests/factories/events.ts';
import { eventFormatFactory } from '../../../tests/factories/formats.ts';
import { eventProposalTagFactory } from '../../../tests/factories/proposal-tags.ts';
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

  await eventFactory({
    team,
    traits: ['conference-cfp-open', 'withIntegration'],
    attributes: { name: 'Conference 2', slug: 'conference-2' },
  });

  const format1 = await eventFormatFactory({ event, attributes: { name: 'Format 1' } });
  const format2 = await eventFormatFactory({ event, attributes: { name: 'Format 2' } });
  const category1 = await eventCategoryFactory({ event, attributes: { name: 'Category 1' } });
  const category2 = await eventCategoryFactory({ event, attributes: { name: 'Category 2' } });
  const tag = await eventProposalTagFactory({ event, attributes: { name: 'Tag 1' } });

  const proposal1 = await proposalFactory({
    event,
    formats: [format1],
    categories: [category1],
    tags: [tag],
    talk: await talkFactory({ attributes: { title: 'Talk 1' }, speakers: [speaker1] }),
  });

  await reviewFactory({ proposal: proposal1, user: organizer1, attributes: { note: 5, feeling: 'POSITIVE' } });

  const proposal2 = await proposalFactory({
    event,
    traits: ['accepted'],
    formats: [format2],
    categories: [category2],
    talk: await talkFactory({ attributes: { title: 'Talk 2' }, speakers: [speaker2] }),
  });

  await reviewFactory({ proposal: proposal2, user: organizer1, attributes: { note: 2, feeling: 'NEUTRAL' } });

  await proposalFactory({
    event,
    talk: await talkFactory({ attributes: { title: 'Talk 3' }, speakers: [speaker1, speaker2] }),
  });
};
