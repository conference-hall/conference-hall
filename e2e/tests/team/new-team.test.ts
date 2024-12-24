import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, loginWith, test } from '../../fixtures.ts';
import { NewTeamPage } from './new-team.page.ts';

loginWith('clark-kent');

test('creates a new team', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'] });
  await teamFactory({ owners: [user], attributes: { slug: 'team-1' } });

  const newTeamPage = new NewTeamPage(page);
  await newTeamPage.goto();

  // Cannot create when URL already exists
  await newTeamPage.nameInput.fill('Team 1');
  await newTeamPage.slugInput.fill('team-1');
  await newTeamPage.clickOnCreate();
  const inputError = await newTeamPage.getInputDescription(newTeamPage.slugInput);
  await expect(inputError).toHaveText('This URL already exists.');

  // Create a new team
  await newTeamPage.nameInput.fill('Team 2');
  await newTeamPage.slugInput.fill('team-2');
  const teamHomePage = await newTeamPage.clickOnCreate();
  await teamHomePage.waitFor();
});
