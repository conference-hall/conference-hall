import { eventFactory } from 'tests/factories/events.ts';
import { proposalFactory } from 'tests/factories/proposals.ts';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import type { Proposal, User } from '../../../prisma/generated/client.ts';
import { expect, useLoginSession, test } from '../../fixtures.ts';
import { ProposalInvitePage } from './proposal-invite.page.ts';

let user: User;
let speaker: User;
let proposal: Proposal;

useLoginSession();

test.beforeEach(async () => {
  user = await userFactory({ withPasswordAccount: true, withAuthSession: true });
  speaker = await userFactory();
  const talk = await talkFactory({ speakers: [speaker] });
  const event = await eventFactory({ traits: ['conference-cfp-open'] });
  proposal = await proposalFactory({ event, talk });
});

test('accepts invite to a proposal', async ({ page }) => {
  const proposalInvitePage = new ProposalInvitePage(page);
  await proposalInvitePage.goto(proposal.invitationCode);

  const proposalPage = await proposalInvitePage.clickOnAcceptInvite();
  await proposalPage.waitFor();

  expect(await proposalPage.speakers).toHaveCount(3);
  await expect(proposalPage.speaker(speaker.name)).toBeVisible();
  await expect(proposalPage.speaker(user.name)).toBeVisible();
});
