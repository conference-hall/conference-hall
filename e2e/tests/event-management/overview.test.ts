import type { Event, EventCategory, EventFormat, Team } from '@prisma/client';
import { eventCategoryFactory } from 'tests/factories/categories.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { eventFormatFactory } from 'tests/factories/formats.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { reviewFactory } from 'tests/factories/reviews.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, loginWith, test } from '../../fixtures.ts';
import { OverviewPage } from './overview.page.ts';

let team: Team;
let event: Event;
let format: EventFormat;
let category: EventCategory;

test.beforeEach(async () => {
  const user = await userFactory({ traits: ['clark-kent'] });
  const reviewer = await userFactory({ traits: ['bruce-wayne'] });
  team = await teamFactory({ owners: [user], reviewers: [reviewer] });
  event = await eventFactory({ team, traits: ['conference-cfp-open'] });
  format = await eventFormatFactory({ event });
  category = await eventCategoryFactory({ event });
  const proposal1 = await proposalFactory({
    event,
    formats: [format],
    categories: [category],
    talk: await talkFactory({ speakers: [user] }),
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

test.describe('As a team owner', () => {
  loginWith('clark-kent');

  test('it displays event overview', async ({ page }) => {
    const overviewPage = new OverviewPage(page);
    await overviewPage.goto(team.slug, event.slug);

    await expect(overviewPage.dashboardCardLink('Call for paper open', 'Change')).toBeVisible();
    await expect(overviewPage.dashboardCardLink('The event is public', 'Change')).toBeVisible();
    await expect(overviewPage.dashboardCardLink('Reviews are enabled', 'Change')).toBeVisible();

    await expect(overviewPage.dashboardCard('Proposals').getByText('3')).toBeVisible();
    await expect(overviewPage.dashboardCard('Speakers').getByText('1')).toBeVisible();
    await expect(overviewPage.dashboardCard('Proposals reviewed by you.').getByText('67%')).toBeVisible();

    await expect(overviewPage.dashboardCardLink('Proposals by formats', format.name)).toBeVisible();
    await expect(overviewPage.dashboardCardLink('Proposals by categories', category.name)).toBeVisible();
  });
});

test.describe('As a team reviewer', () => {
  loginWith('bruce-wayne');

  test('it displays event overview', async ({ page }) => {
    const overviewPage = new OverviewPage(page);
    await overviewPage.goto(team.slug, event.slug);

    await expect(overviewPage.dashboardCardLink('Call for paper open', 'Change')).not.toBeVisible();
    await expect(overviewPage.dashboardCardLink('The event is public', 'Change')).not.toBeVisible();
    await expect(overviewPage.dashboardCardLink('Reviews are enabled', 'Change')).not.toBeVisible();

    await expect(overviewPage.dashboardCard('Proposals').getByText('3')).toBeVisible();
    await expect(overviewPage.dashboardCard('Speakers').getByText('1')).toBeVisible();
    await expect(overviewPage.dashboardCard('Proposals reviewed by you.').getByText('0%')).toBeVisible();

    await expect(overviewPage.dashboardCardLink('Proposals by formats', format.name)).toBeVisible();
    await expect(overviewPage.dashboardCardLink('Proposals by categories', category.name)).toBeVisible();
  });
});
