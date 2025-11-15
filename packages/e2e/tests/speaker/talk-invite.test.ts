import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, loginWith, test } from '../../helpers/fixtures.ts';
import { TalkInvitePage } from './talk-invite.page.ts';

loginWith('bruce-wayne');

test('accepts invite to a talk', async ({ page }) => {
  await userFactory({ traits: ['bruce-wayne'] });
  const speaker = await userFactory({ traits: ['clark-kent'] });
  const talk = await talkFactory({ speakers: [speaker] });

  const talkInvitePage = new TalkInvitePage(page);
  await talkInvitePage.goto(talk.invitationCode);

  const talkPage = await talkInvitePage.clickOnAcceptInvite();
  await talkPage.waitFor();

  expect(await talkPage.speakers).toHaveCount(3);
  await expect(talkPage.speaker('Clark Kent')).toBeVisible();
  await expect(talkPage.speaker('Bruce Wayne')).toBeVisible();
});
