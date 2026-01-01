import { userFactory } from 'tests/factories/users.ts';
import { expect, loginWith, test } from '../../fixtures.ts';
import { AdminPage } from './admin.page.ts';

test.beforeEach(async () => {
  await userFactory({ traits: ['clark-kent', 'admin'] });
  await userFactory({ traits: ['bruce-wayne'] });
});

test.describe('As an admin', () => {
  loginWith('clark-kent');

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
  loginWith('bruce-wayne');

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
