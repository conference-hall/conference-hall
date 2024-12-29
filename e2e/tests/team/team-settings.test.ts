import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, loginWith, test } from '../../fixtures.ts';
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

  test('can manage team members', async ({ page }) => {
    const owner = await userFactory({ traits: ['clark-kent'] });
    const member = await userFactory({ traits: ['bruce-wayne'] });
    const team = await teamFactory({ owners: [owner], members: [member] });

    const settingsPage = new TeamSettingsPage(page);
    await settingsPage.gotoMembers(team.slug);

    // Member list
    await expect(settingsPage.members).toHaveCount(2);
    await settingsPage.findMember.fill('bru');
    await page.keyboard.press('Enter');
    await expect(settingsPage.members).toHaveCount(1);

    // Invite member
    const invite = await settingsPage.clickOnInviteMember();
    await expect(invite).toBeVisible();
    await settingsPage.closeModal();

    // Change member role
    await expect(settingsPage.changeRoleButton(owner.name)).not.toBeVisible();
    await expect(settingsPage.changeRoleButton(member.name)).toBeVisible();
    await settingsPage.changeRoleButton(member.name).click();
    await settingsPage.clickOnRole('Owner');
    await settingsPage.clickOnConfirmRole(member.name);
    await expect(settingsPage.toast).toHaveText('Member role changed.');
    await expect(settingsPage.members).toContainText('Owner');

    // Remove member
    await expect(settingsPage.removeMemberButton(owner.name)).not.toBeVisible();
    await expect(settingsPage.removeMemberButton(member.name)).toBeVisible();
    await settingsPage.removeMemberButton(member.name).click();
    await settingsPage.clickOnConfirmRemove(member.name);
    await expect(settingsPage.toast).toHaveText('Member removed from team.');
    await expect(settingsPage.removeMemberButton(member.name)).not.toBeVisible();
  });
});

test.describe('as a team member', () => {
  test('cannot edit the team but can leave the team', async ({ page }) => {
    const member = await userFactory({ traits: ['clark-kent'] });
    const reviewer = await userFactory({ traits: ['bruce-wayne'] });
    const team = await teamFactory({ members: [member], reviewers: [reviewer] });

    const settingsPage = new TeamSettingsPage(page);

    // Check cannot other members settings
    await settingsPage.gotoMembers(team.slug);
    await expect(settingsPage.members).toHaveCount(2);
    await expect(settingsPage.changeRoleButton(member.name)).not.toBeVisible();
    await expect(settingsPage.removeMemberButton(member.name)).not.toBeVisible();
    await expect(settingsPage.changeRoleButton(reviewer.name)).not.toBeVisible();
    await expect(settingsPage.removeMemberButton(reviewer.name)).not.toBeVisible();

    // Check available navigation and actions
    await settingsPage.goto(team.slug);
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
    const member = await userFactory({ traits: ['clark-kent'] });
    const reviewer = await userFactory({ traits: ['bruce-wayne'] });
    const team = await teamFactory({ members: [member], reviewers: [reviewer] });

    const settingsPage = new TeamSettingsPage(page);

    // Check cannot other members settings
    await settingsPage.gotoMembers(team.slug);
    await expect(settingsPage.members).toHaveCount(2);
    await expect(settingsPage.changeRoleButton(member.name)).not.toBeVisible();
    await expect(settingsPage.removeMemberButton(member.name)).not.toBeVisible();
    await expect(settingsPage.changeRoleButton(reviewer.name)).not.toBeVisible();
    await expect(settingsPage.removeMemberButton(reviewer.name)).not.toBeVisible();

    // Check available navigation and actions
    await settingsPage.goto(team.slug);
    await expect(settingsPage.generalPage).not.toBeVisible();
    await expect(settingsPage.leaveTeamButton(team.name)).toBeVisible();

    // Leave team
    const speakerActivity = await settingsPage.clickOnLeaveTeam(team.name);
    await expect(settingsPage.toast).toHaveText("You've successfully left the team.");
    await speakerActivity.waitFor();
  });
});
