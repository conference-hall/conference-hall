import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, useLoginSession, test } from '../../fixtures.ts';
import { NotificationsPage } from './notifications.page.ts';

useLoginSession();

test.describe('When there are notifications', () => {
  test.beforeEach(async () => {
    const user = await userFactory({ withPasswordAccount: true, withAuthSession: true });
    const talk = await talkFactory({ speakers: [user], attributes: { title: 'My talk 1' } });
    const event = await eventFactory({ traits: ['conference-cfp-open'] });
    await proposalFactory({ event, talk, traits: ['accepted-published'] });
  });

  test('displays notifications', async ({ page }) => {
    const notificationsPage = new NotificationsPage(page);
    await notificationsPage.goto();

    await expect(notificationsPage.notifications).toHaveCount(1);

    const proposalPage = await notificationsPage.clickOnNotification('My talk 1');
    await proposalPage.waitFor();
    await expect(page.getByRole('heading', { name: 'My talk 1' })).toBeVisible();
  });
});

test.describe('When there are no notifications', () => {
  test.beforeEach(async () => {
    await userFactory({ withPasswordAccount: true, withAuthSession: true });
  });

  test('displays no notifications', async ({ page }) => {
    const notificationsPage = new NotificationsPage(page);
    await notificationsPage.goto();

    await expect(notificationsPage.noNotifications).toBeVisible();
  });
});
