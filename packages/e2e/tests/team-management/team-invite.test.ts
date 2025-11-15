import { teamFactory } from '@conference-hall/database/tests/factories/team.ts';
import { userFactory } from '@conference-hall/database/tests/factories/users.ts';
import { loginWith, test } from '../../helpers/fixtures.ts';
import { TeamInvitePage } from './team-invite.page.ts';

loginWith('clark-kent');

test('accepts invite to a team', async ({ page }) => {
  await userFactory({ traits: ['clark-kent'] });
  const team = await teamFactory();

  const teamInvitePage = new TeamInvitePage(page);
  await teamInvitePage.goto(team.invitationCode, team.name);

  const teamPage = await teamInvitePage.clickOnAcceptInvite();
  await teamPage.waitFor();
});
