import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { useLoginSession, test } from '../../fixtures.ts';
import { TeamInvitePage } from './team-invite.page.ts';

useLoginSession();

test('accepts invite to a team', async ({ page }) => {
  await userFactory({ withPasswordAccount: true, withAuthSession: true });
  const team = await teamFactory();

  const teamInvitePage = new TeamInvitePage(page);
  await teamInvitePage.goto(team.invitationCode, team.name);

  const teamPage = await teamInvitePage.clickOnAcceptInvite();
  await teamPage.waitFor();
});
