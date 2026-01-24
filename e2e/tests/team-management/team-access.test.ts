import { organizerKeyFactory } from 'tests/factories/organizer-key.ts';
import { expect, test } from '../../fixtures.ts';
import { userLoggedFactory } from '../../helpers.ts';
import { TeamAccessPage } from './team-access.page.ts';

test('gets access with a beta access key', async ({ context, page }) => {
  await userLoggedFactory(context);
  await organizerKeyFactory({ attributes: { id: '123456' } });

  const teamAccessPage = new TeamAccessPage(page);
  await teamAccessPage.goto();

  // Check form link
  await expect(teamAccessPage.formLink).toHaveAttribute('href', 'https://forms.gle/AnArRCSHibmG59zw7');

  // Fill form with errors
  await teamAccessPage.fill(teamAccessPage.keyInput, '123');
  await teamAccessPage.clickOnGetAccess();
  const inputError = await teamAccessPage.getInputDescription(teamAccessPage.keyInput);
  await expect(inputError).toHaveText('Invalid access key');

  // Fill form with success
  await teamAccessPage.fill(teamAccessPage.keyInput, '123456');
  const newTeamPage = await teamAccessPage.clickOnGetAccess();
  await newTeamPage.waitFor();
});
