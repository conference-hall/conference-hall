import type { Event, Proposal, User } from '@prisma/client';
import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, loginWith, test } from '../../fixtures.ts';
import { ActivityPage } from './activity.page.ts';

loginWith('clark-kent');

let user: User;
let event1: Event;
let event2: Event;
let proposal: Proposal;

test.beforeEach(async () => {
  user = await userFactory({ traits: ['clark-kent'] });
  const talk1 = await talkFactory({ speakers: [user], attributes: { title: 'My talk 1' } });
  const talk2 = await talkFactory({ speakers: [user], attributes: { title: 'My talk 2' } });
  const talk3 = await talkFactory({ speakers: [user], attributes: { title: 'My talk 3' } });

  event1 = await eventFactory();
  proposal = await proposalFactory({ event: event1, talk: talk1 });
  await proposalFactory({ event: event1, talk: talk2 });
  await proposalFactory({ event: event1, talk: talk3 });

  event2 = await eventFactory();
  await proposalFactory({ event: event2, talk: talk1 });
});

test('displays activity page', async ({ page }) => {
  const activityPage = new ActivityPage(page);
  await activityPage.goto();

  await test.step('displays user profile informations', async () => {
    // TODO: test all user profile informations in a component test
    await expect(page.getByRole('heading', { name: user.name })).toBeVisible();
  });

  await test.step('displays activities', async () => {
    await expect(activityPage.activities).toHaveCount(2);
  });

  await test.step('displays proposals for events', async () => {
    // TODO: test all proposals informations in a component test
    await expect(activityPage.eventActivity(event1.name)).toHaveCount(4);
    await expect(activityPage.eventLink(event1.name)).toHaveAttribute('href', `/${event1.slug}`);

    await expect(activityPage.eventActivity(event2.name)).toHaveCount(2);
    await expect(activityPage.eventLink(event2.name)).toHaveAttribute('href', `/${event2.slug}`);
  });

  await test.step('navigates to event proposal page', async () => {
    const proposalPage = await activityPage.clickOnProposal(event1.name, proposal.title);
    await proposalPage.waitFor();
  });

  await test.step('navigates to edit profile page', async () => {
    await activityPage.goto();
    const profilePage = await activityPage.clickOnEditProfile();
    await profilePage.waitFor();
  });
});
