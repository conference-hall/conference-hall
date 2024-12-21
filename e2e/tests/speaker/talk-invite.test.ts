import type { Talk } from '@prisma/client';
import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, loginWith, test } from '../../fixtures.ts';
import { TalkInvitePage } from './talk-invite.page.ts';

let talk: Talk;

test.beforeEach(async () => {
  await userFactory({ traits: ['bruce-wayne'] });
  const user1 = await userFactory({ traits: ['clark-kent'] });
  talk = await talkFactory({ speakers: [user1], attributes: { title: 'My talk 1' } });
});

loginWith('bruce-wayne');

test('displays the talks', async ({ page }) => {
  const talkInvitePage = new TalkInvitePage(page);
  await talkInvitePage.goto(talk.invitationCode);

  const talkPage = await talkInvitePage.acceptInvite();
  await talkPage.waitFor();

  expect(await talkPage.speakers).toHaveCount(3);
  await expect(talkPage.speaker('Clark Kent')).toBeVisible();
  await expect(talkPage.speaker('Bruce Wayne')).toBeVisible();
});
