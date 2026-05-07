import { expect, test } from '../../fixtures.ts';
import { TeamAccessPage } from './team-access.page.ts';

test('submits a team access request', async ({ page }) => {
  const teamAccessPage = new TeamAccessPage(page);
  await teamAccessPage.goto();

  // Fill and submit form
  await teamAccessPage.fill(teamAccessPage.eventNameInput, 'My Conference');
  await teamAccessPage.fill(teamAccessPage.emailInput, 'organizer@example.com');
  await teamAccessPage.submitRequest();

  // Check success message
  await expect(page.getByText('Request submitted!')).toBeVisible();
});
