import type { Proposal } from '@conference-hall/database';
import { eventFactory } from '@conference-hall/database/tests/factories/events.ts';
import { proposalFactory } from '@conference-hall/database/tests/factories/proposals.ts';
import { talkFactory } from '@conference-hall/database/tests/factories/talks.ts';
import { userFactory } from '@conference-hall/database/tests/factories/users.ts';
import { expect, loginWith, test } from '../../helpers/fixtures.ts';
import { ProposalInvitePage } from './proposal-invite.page.ts';

let proposal: Proposal;

test.beforeEach(async () => {
  await userFactory({ traits: ['bruce-wayne'] });
  const user1 = await userFactory({ traits: ['clark-kent'] });
  const talk = await talkFactory({ speakers: [user1] });
  const event = await eventFactory({ traits: ['conference-cfp-open'] });
  proposal = await proposalFactory({ event, talk });
});

loginWith('bruce-wayne');

test('accepts invite to a proposal', async ({ page }) => {
  const proposalInvitePage = new ProposalInvitePage(page);
  await proposalInvitePage.goto(proposal.invitationCode);

  const proposalPage = await proposalInvitePage.clickOnAcceptInvite();
  await proposalPage.waitFor();

  expect(await proposalPage.speakers).toHaveCount(3);
  await expect(proposalPage.speaker('Clark Kent')).toBeVisible();
  await expect(proposalPage.speaker('Bruce Wayne')).toBeVisible();
});
