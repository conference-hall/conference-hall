import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, loginWith, test } from '../../../fixtures.ts';
import { TeamSettingsPage } from './team-settings.page.ts';

loginWith('clark-kent');

test.beforeEach(async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept());
});

test.describe('as a team owner', () => {
  test('can edit the team but cannot leave the team', async ({ page }) => {
    const user = await userFactory({ traits: ['clark-kent'] });
    const team = await teamFactory({ owners: [user] });
    const team2 = await teamFactory({ owners: [user] });

    const settingsPage = new TeamSettingsPage(page);
    await settingsPage.goto(team.slug);

    // Check available navigation and actions
    await expect(settingsPage.leaveTeamButton(team.name)).not.toBeVisible();

    // Edit team with invalid slug
    await settingsPage.fillForm('Awesome team updated', team2.slug);
    await settingsPage.clickOnSave();
    const inputError = await settingsPage.getInputDescription(settingsPage.slugInput);
    await expect(inputError).toHaveText('This URL already exists.');

    // Edit team with valid data
    await settingsPage.fillForm('Awesome team updated', 'awesome-team-updated');
    await settingsPage.clickOnSave();
    await expect(settingsPage.toast).toHaveText('Team settings saved.');
    await expect(settingsPage.nameInput).toHaveValue('Awesome team updated');
    await expect(settingsPage.slugInput).toHaveValue('awesome-team-updated');
  });
});

test.describe('as a team member', () => {
  test('cannot edit the team but can leave the team', async ({ page }) => {
    const user = await userFactory({ traits: ['clark-kent'] });
    const team = await teamFactory({ members: [user] });

    const settingsPage = new TeamSettingsPage(page);
    await settingsPage.goto(team.slug);

    // Check available navigation and actions
    await expect(settingsPage.generalPage).not.toBeVisible();
    await expect(settingsPage.leaveTeamButton(team.name)).toBeVisible();

    // Leave team
    const speakerActivity = await settingsPage.clickOnLeaveTeam(team.name);
    await expect(settingsPage.toast).toHaveText("You've successfully left the team.");
    await speakerActivity.waitFor();
  });
});

test.describe('as a team reviewer', () => {
  test('cannot edit the team but can leave the team', async ({ page }) => {
    const user = await userFactory({ traits: ['clark-kent'] });
    const team = await teamFactory({ reviewers: [user] });

    const settingsPage = new TeamSettingsPage(page);
    await settingsPage.goto(team.slug);

    // Check available navigation and actions
    await expect(settingsPage.generalPage).not.toBeVisible();
    await expect(settingsPage.leaveTeamButton(team.name)).toBeVisible();

    // Leave team
    const speakerActivity = await settingsPage.clickOnLeaveTeam(team.name);
    await expect(settingsPage.toast).toHaveText("You've successfully left the team.");
    await speakerActivity.waitFor();
  });
});
