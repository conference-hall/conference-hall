import { teamFactory } from '@conference-hall/database/tests/factories/team.ts';
import { userFactory } from '@conference-hall/database/tests/factories/users.ts';
import { expect, loginWith, test } from '../../helpers/fixtures.ts';
import { NewTeamPage } from './new-team.page.ts';

loginWith('clark-kent');

test('creates a new team', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'] });
  await teamFactory({ owners: [user], attributes: { slug: 'team-1' } });

  const newTeamPage = new NewTeamPage(page);
  await newTeamPage.goto();

  // Cannot create when URL already exists
  await newTeamPage.fill(newTeamPage.nameInput, 'Team 1');
  await newTeamPage.fill(newTeamPage.slugInput, 'team-1');
  await newTeamPage.clickOnCreate();
  const inputError = await newTeamPage.getInputDescription(newTeamPage.slugInput);
  await expect(inputError).toHaveText('This URL already exists.');

  // Create a new team
  await newTeamPage.fill(newTeamPage.nameInput, 'Team 2');
  await newTeamPage.fill(newTeamPage.slugInput, 'team-2');
  const teamHomePage = await newTeamPage.clickOnCreate();
  await teamHomePage.waitFor();
});
