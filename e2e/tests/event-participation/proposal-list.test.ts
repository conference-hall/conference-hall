import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import type { Event } from '../../../prisma/generated/client.ts';
import { expect, useLoginSession, test } from '../../fixtures.ts';
import { LoginPage } from '../auth/login.page.ts';
import { ProposalListPage } from './proposal-list.page.ts';
import { ProposalPage } from './proposal.page.ts';

let eventOpen: Event;
let eventClosed: Event;
let eventWithoutProposal: Event;

test.beforeEach(async () => {
  const user = await userFactory({ attributes: { bio: '' }, withPasswordAccount: true, withAuthSession: true });
  const talk1 = await talkFactory({ speakers: [user], attributes: { title: 'My talk 1' } });
  const talk2 = await talkFactory({ speakers: [user], attributes: { title: 'My talk 2' } });
  const talk3 = await talkFactory({ speakers: [user], attributes: { title: 'My talk 3' } });
  const talk4 = await talkFactory({ speakers: [user], attributes: { title: 'My talk 4' } });
  const talk5 = await talkFactory({ speakers: [user], attributes: { title: 'My talk 5' } });
  const talk6 = await talkFactory({ speakers: [user], attributes: { title: 'My talk 6' } });

  eventOpen = await eventFactory({ traits: ['conference-cfp-open'] });
  await proposalFactory({ event: eventOpen, talk: talk1 });
  await proposalFactory({ event: eventOpen, talk: talk2, traits: ['draft'] });
  await proposalFactory({ event: eventOpen, talk: talk3, traits: ['accepted-published'] });
  await proposalFactory({ event: eventOpen, talk: talk4, traits: ['rejected-published'] });
  await proposalFactory({ event: eventOpen, talk: talk5, traits: ['declined'] });
  await proposalFactory({ event: eventOpen, talk: talk6, traits: ['confirmed'] });

  eventClosed = await eventFactory({ traits: ['conference-cfp-past'] });
  await proposalFactory({ event: eventClosed, talk: talk1 });

  eventWithoutProposal = await eventFactory({ traits: ['conference-cfp-open'] });
});

test.describe('when user is connected', () => {
  useLoginSession();

  test('displays proposal list', async ({ page }) => {
    const proposalListPage = new ProposalListPage(page);

    await test.step('with a open CFP', async () => {
      await proposalListPage.goto(eventOpen.slug);

      await expect(proposalListPage.proposals).toHaveCount(6);
      await expect(proposalListPage.proposal('My talk 1')).toContainText('Applied');
      await expect(proposalListPage.proposal('My talk 2')).toContainText('Draft');
      await expect(proposalListPage.proposal('My talk 3')).toContainText('Accepted');
      await expect(proposalListPage.proposal('My talk 4')).toContainText('Declined');
      await expect(proposalListPage.proposal('My talk 5')).toContainText('Declined by you');
      await expect(proposalListPage.proposal('My talk 6')).toContainText('Confirmed');

      await proposalListPage.clickOnProposal('My talk 1');
      const proposalPage = new ProposalPage(page);
      await proposalPage.waitFor();
    });

    await test.step('with a closed CFP', async () => {
      await proposalListPage.goto(eventClosed.slug);
      await expect(proposalListPage.proposals).toHaveCount(1);
      await expect(proposalListPage.proposal('My talk 1')).toContainText('Applied');
    });

    await test.step('without proposals', async () => {
      await proposalListPage.goto(eventWithoutProposal.slug);
      await expect(proposalListPage.noProposals).toBeVisible();
    });
  });
});

test.describe('when user is not connected', () => {
  test('redirects to signin', async ({ page }) => {
    await page.goto(`/${eventOpen.slug}/proposals`);
    const loginPage = new LoginPage(page);
    await loginPage.waitFor();
  });
});
