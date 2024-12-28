import type { Event, Team } from '@prisma/client';
import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { eventProposalTagFactory } from 'tests/factories/proposal-tags.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { reviewFactory } from 'tests/factories/reviews.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { loginWith, test } from '../../fixtures.ts';
import { ProposalsPage } from './proposals.page.ts';

let team: Team;
let event: Event;

loginWith('clark-kent');

test.beforeEach(async () => {
  const user = await userFactory({ traits: ['clark-kent'] });
  const reviewer = await userFactory({ traits: ['bruce-wayne'] });
  team = await teamFactory({ owners: [user], reviewers: [reviewer] });
  event = await eventFactory({ team, traits: ['conference-cfp-open'] });
  const format1 = await eventFormatFactory({ event });
  const format2 = await eventFormatFactory({ event });
  const category1 = await eventCategoryFactory({ event });
  const category2 = await eventCategoryFactory({ event });
  const tag = await eventProposalTagFactory({ event });
  const speaker1 = await userFactory();
  const speaker2 = await userFactory();
  const proposal1 = await proposalFactory({
    event,
    formats: [format1],
    categories: [category1],
    tags: [tag],
    talk: await talkFactory({ speakers: [speaker1] }),
  });
  const proposal2 = await proposalFactory({
    event,
    traits: ['accepted'],
    formats: [format2],
    categories: [category2],
    talk: await talkFactory({ speakers: [speaker2] }),
  });
  await proposalFactory({ event, talk: await talkFactory({ speakers: [speaker1, speaker2] }) });
  await reviewFactory({ proposal: proposal1, user, attributes: { note: 5, feeling: 'POSITIVE' } });
  await reviewFactory({ proposal: proposal2, user, attributes: { note: 2, feeling: 'NEUTRAL' } });
});

test('displays proposals page', async ({ page }) => {
  const proposalsPage = new ProposalsPage(page);
  await proposalsPage.goto(team.slug, event.slug);
});
