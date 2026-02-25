import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, useLoginSession, test } from '../../fixtures.ts';
import { ActivityPage } from '../speaker/activity.page.ts';
import { TeamSettingsPage } from './team-settings.page.ts';

useLoginSession();

test.beforeEach(async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept());
});

test.describe('as a team owner', () => {
  test('can manage the team but cannot leave the team', async ({ page }) => {
    const user = await userFactory({ withPasswordAccount: true, withAuthSession: true });
    const team = await teamFactory({ owners: [user] });
    const team2 = await teamFactory({ owners: [user] });

    const settingsPage = new TeamSettingsPage(page);
    await settingsPage.goto(team.slug);

    // Check available navigation and actions
    await expect(settingsPage.leaveTeamButton).not.toBeVisible();

    // Edit team with invalid slug
    await settingsPage.fillForm('New name', team2.slug);
    await settingsPage.clickOnSave();
    const inputError = await settingsPage.getInputDescription(settingsPage.slugInput);
    await expect(inputError).toHaveText('This URL already exists.');

    // Edit team with valid data
    await settingsPage.fillForm('New name', 'new-slug');
    await settingsPage.clickOnSave();
    await expect(settingsPage.toast).toHaveText('Team settings saved.');
    await expect(settingsPage.nameInput).toHaveValue('New name');
    await expect(settingsPage.slugInput).toHaveValue('new-slug');

    // Delete team
    await settingsPage.deleteButton.click();
    await expect(settingsPage.deleteDialog).toHaveAttribute('data-open');

    // Delete team modal
    const deleteButton = settingsPage.deleteDialog.getByRole('button', { name: 'Delete team' });
    await expect(deleteButton).toBeDisabled();
    const deleteInput = settingsPage.deleteDialog.getByRole('textbox');
    await deleteInput.fill('new-slug');
    await deleteButton.click();
    await expect(settingsPage.toast).toHaveText('Team deleted.');

    const speakerActivityPage = new ActivityPage(page);
    await expect(speakerActivityPage.heading).toBeVisible();
  });

  test('filter members', async ({ page }) => {
    const owner = await userFactory({ traits: ['clark-kent'], withPasswordAccount: true, withAuthSession: true });
    const member = await userFactory({ traits: ['bruce-wayne'] });
    const team = await teamFactory({ owners: [owner], members: [member] });

    const settingsPage = new TeamSettingsPage(page);
    await settingsPage.gotoMembers(team.slug);

    // Member list
    await expect(page.getByText('Showing 1 to 1 of 2 results')).toBeVisible();

    // Filter by role
    await settingsPage.selectRoleFilter('Member');
    await expect(page.getByText('Showing 1 to 1 of 1 results')).toBeVisible();
    await expect(settingsPage.members.first()).toContainText(member.name);
  });

  test('search members', async ({ page }) => {
    const owner = await userFactory({ traits: ['clark-kent'], withPasswordAccount: true, withAuthSession: true });
    const member = await userFactory({ traits: ['bruce-wayne'] });
    const team = await teamFactory({ owners: [owner], members: [member] });

    const settingsPage = new TeamSettingsPage(page);
    await settingsPage.gotoMembers(team.slug);

    // Member list
    await expect(page.getByText('Showing 1 to 1 of 2 results')).toBeVisible();

    // Search
    await settingsPage.fill(settingsPage.findMember, 'bru');
    await settingsPage.findMember.press('Enter');
    await expect(page.getByText('Showing 1 to 1 of 1 results')).toBeVisible();
    await expect(settingsPage.members.first()).toContainText(member.name);
  });

  test('can manage team members', async ({ page }) => {
    const owner = await userFactory({ traits: ['clark-kent'], withPasswordAccount: true, withAuthSession: true });
    const member = await userFactory({ traits: ['bruce-wayne'] });
    const team = await teamFactory({ owners: [owner], members: [member] });

    const settingsPage = new TeamSettingsPage(page);
    await settingsPage.gotoMembers(team.slug);

    // Invite member
    const inviteDialog = await settingsPage.clickOnInviteMember();
    await expect(inviteDialog).toBeVisible();
    await settingsPage.closeModal();

    // Member list
    await expect(page.getByText('Showing 1 to 1 of 2 results')).toBeVisible();
    await expect(settingsPage.removeMemberButton(member.name)).toBeVisible();
    await expect(settingsPage.removeMemberButton(owner.name)).not.toBeVisible();

    // Change member role
    await expect(settingsPage.changeRoleButton(owner.name)).not.toBeVisible();
    await expect(settingsPage.changeRoleButton(member.name)).toBeVisible();
    const changeRoleDialog = await settingsPage.clickOnChangeRole(member.name);
    await expect(changeRoleDialog).toBeVisible();
    await settingsPage.clickOnRole('Owner');
    await settingsPage.clickOnConfirmRole(member.name);
    await expect(settingsPage.toast).toHaveText('Member role changed.');

    // Remove member
    const removeDialog = await settingsPage.clickOnRemoveMember(member.name);
    await expect(removeDialog).toBeVisible();
    await settingsPage.clickOnConfirmRemove(member.name);
    await expect(settingsPage.toast).toHaveText('Member removed from team.');
    await expect(settingsPage.removeMemberButton(member.name)).not.toBeVisible();
  });
});

test.describe('as a team member', () => {
  test('cannot edit the team but can leave the team', async ({ page }) => {
    const member = await userFactory({ withPasswordAccount: true, withAuthSession: true });
    const reviewer = await userFactory();
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
    await expect(settingsPage.leaveTeamButton).toBeVisible();

    // Leave team
    const speakerActivity = await settingsPage.clickOnLeaveTeam();
    await expect(settingsPage.toast).toHaveText("You've successfully left the team.");
    await speakerActivity.waitFor();
  });
});

test.describe('as a team reviewer', () => {
  test('cannot edit the team but can leave the team', async ({ page }) => {
    const member = await userFactory();
    const reviewer = await userFactory({ withPasswordAccount: true, withAuthSession: true });
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
    await expect(settingsPage.leaveTeamButton).toBeVisible();

    // Leave team
    const speakerActivity = await settingsPage.clickOnLeaveTeam();
    await expect(settingsPage.toast).toHaveText("You've successfully left the team.");
    await speakerActivity.waitFor();
  });
});
