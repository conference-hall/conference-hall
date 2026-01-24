import { expect, test } from '../../fixtures.ts';
import { userLoggedFactory } from '../../helpers.ts';
import { AdminPage } from './admin.page.ts';

test.describe('As an admin', () => {
  test.beforeEach(async ({ context }) => {
    await userLoggedFactory(context, { traits: ['admin'] });
  });

  test('can access admin pages', async ({ page }) => {
    const adminPage = new AdminPage(page);

    await adminPage.gotoDashboard();
    await expect(adminPage.dashboardHeading).toBeAttached();

    await adminPage.gotoUsers();
    await expect(adminPage.usersHeading).toBeAttached();

    await adminPage.gotoTeams();
    await expect(adminPage.teamsHeading).toBeAttached();

    await adminPage.gotoFeatureFlags();
    await expect(adminPage.featureFlagsHeading).toBeAttached();

    await adminPage.gotoDebug();
    await expect(adminPage.debugHeading).toBeAttached();
  });
});

test.describe('As not admin', () => {
  test.beforeEach(async ({ context }) => {
    await userLoggedFactory(context);
  });

  test('cannot access admin pages', async ({ page }) => {
    const adminPage = new AdminPage(page);

    const notAuthorized = page.getByRole('heading', { name: 'Page not found' });

    await adminPage.gotoDashboard();
    await expect(notAuthorized).toBeVisible();

    await adminPage.gotoUsers();
    await expect(notAuthorized).toBeVisible();

    await adminPage.gotoTeams();
    await expect(notAuthorized).toBeVisible();

    await adminPage.gotoFeatureFlags();
    await expect(notAuthorized).toBeVisible();

    await adminPage.gotoDebug();
    await expect(notAuthorized).toBeVisible();
  });
});
