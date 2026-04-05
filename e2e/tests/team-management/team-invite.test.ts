import { teamFactory } from 'tests/factories/team.ts';
import { test } from '../../fixtures.ts';
import { userLoggedFactory } from '../../helpers.ts';
import { TeamInvitePage } from './team-invite.page.ts';

test('accepts invite to a team', async ({ context, page }) => {
  await userLoggedFactory(context);
  const team = await teamFactory();

  const teamInvitePage = new TeamInvitePage(page);
  await teamInvitePage.goto(team.invitationCode, team.name);

  const teamPage = await teamInvitePage.clickOnAcceptInvite();
  await teamPage.waitFor();
});
