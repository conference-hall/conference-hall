import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { reviewFactory } from 'tests/factories/reviews.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import type { Event, EventCategory, EventFormat, Team, User } from '../../../prisma/generated/client.ts';
import { expect, useLoginSession, test } from '../../fixtures.ts';
import { OverviewPage } from './overview.page.ts';
import { ProposalPage } from './proposal.page.ts';

let user: User;
let team: Team;
let event: Event;
let format: EventFormat;
let category: EventCategory;

useLoginSession();

test.describe('As owner', () => {
  test.beforeEach(async () => {
    user = await userFactory({ withPasswordAccount: true, withAuthSession: true });
    const reviewer = await userFactory({ traits: ['bruce-wayne'] });
    team = await teamFactory({ owners: [user], reviewers: [reviewer] });
    event = await eventFactory({ team, traits: ['conference-cfp-open'] });
    format = await eventFormatFactory({ event });
    category = await eventCategoryFactory({ event });
    const talk1 = await talkFactory({ speakers: [user], attributes: { title: 'Talk 1' } });
    const proposal1 = await proposalFactory({
      event,
      formats: [format],
      categories: [category],
      talk: talk1,
    });
    const proposal2 = await proposalFactory({
      event,
      traits: ['accepted'],
      talk: await talkFactory({ speakers: [user] }),
    });
    await proposalFactory({ event, talk: await talkFactory({ speakers: [user] }) });
    await reviewFactory({ proposal: proposal1, user, attributes: { note: 5, feeling: 'POSITIVE' } });
    await reviewFactory({ proposal: proposal2, user, attributes: { note: 2, feeling: 'NEUTRAL' } });
  });

  test('displays event overview', async ({ page }) => {
    const overviewPage = new OverviewPage(page);
    await overviewPage.goto(team.slug, event.slug);

    await expect(overviewPage.dashboardCardLink('Call for papers open', 'Change')).toBeVisible();
    await expect(overviewPage.dashboardCardLink('The event is public', 'Change')).toBeVisible();
    await expect(overviewPage.dashboardCardLink('Reviews are enabled', 'Change')).toBeVisible();

    await overviewPage.reviewersTab.click();
    await expect(overviewPage.reviewersList).toBeVisible();
    await expect(overviewPage.reviewersList.getByText(user.name)).toBeVisible();
    await expect(overviewPage.reviewersList.getByText('67%')).toBeVisible();

    await overviewPage.callForPaperTab.click();
    await expect(overviewPage.dashboardCard('Proposals').getByText('3')).toBeVisible();
    await expect(overviewPage.dashboardCard('Speakers').getByText('1')).toBeVisible();
    await expect(overviewPage.dashboardCard('Proposals reviewed by you.').getByText('67%')).toBeVisible();
    await expect(overviewPage.dashboardCardLink('Proposals by formats', format.name)).toBeVisible();
    await expect(overviewPage.dashboardCardLink('Proposals by categories', category.name)).toBeVisible();
  });

  test('searches for proposal using command palette and navigates to proposal page', async ({ page }) => {
    const overviewPage = new OverviewPage(page);
    const proposalPage = new ProposalPage(page);

    await overviewPage.goto(team.slug, event.slug);

    await overviewPage.openCommandPalette();
    await overviewPage.searchInCommandPalette('Talk 1');
    await overviewPage.clickCommandPaletteResult('Talk 1');

    await proposalPage.waitFor('Talk 1');
    await expect(page.getByRole('heading', { name: 'Talk 1' })).toBeVisible();
  });
});

test.describe('As reviewer', () => {
  test.beforeEach(async () => {
    const reviewer = await userFactory({ withPasswordAccount: true, withAuthSession: true });
    user = await userFactory();
    team = await teamFactory({ owners: [user], reviewers: [reviewer] });
    event = await eventFactory({ team, traits: ['conference-cfp-open'] });
    const talk = await talkFactory({ speakers: [user] });
    const proposal = await proposalFactory({ event, talk });
    await reviewFactory({ proposal, user, attributes: { note: 5, feeling: 'POSITIVE' } });
  });

  test('displays event overview', async ({ page }) => {
    const overviewPage = new OverviewPage(page);
    await overviewPage.goto(team.slug, event.slug);

    await expect(overviewPage.dashboardCardLink('Call for papers open', 'Change')).not.toBeVisible();
    await expect(overviewPage.dashboardCardLink('The event is public', 'Change')).not.toBeVisible();
    await expect(overviewPage.dashboardCardLink('Reviews are enabled', 'Change')).not.toBeVisible();
    await expect(overviewPage.dashboardCard('Proposals reviewed by you.').getByText('0%')).toBeVisible();
  });
});
