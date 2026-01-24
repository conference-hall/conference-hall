import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, test } from '../../fixtures.ts';
import { userLoggedFactory } from '../../helpers.ts';
import { TalkInvitePage } from './talk-invite.page.ts';

test('accepts invite to a talk', async ({ page, context }) => {
  const user = await userLoggedFactory(context);
  const speaker = await userFactory();
  const talk = await talkFactory({ speakers: [speaker] });

  const talkInvitePage = new TalkInvitePage(page);
  await talkInvitePage.goto(talk.invitationCode);

  const talkPage = await talkInvitePage.clickOnAcceptInvite();
  await talkPage.waitFor();

  expect(await talkPage.speakers).toHaveCount(3);
  await expect(talkPage.speaker(speaker.name)).toBeVisible();
  await expect(talkPage.speaker(user.name)).toBeVisible();
});
