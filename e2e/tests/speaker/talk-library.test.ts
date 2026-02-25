import { talkFactory } from 'tests/factories/talks.ts';
import { userFactory } from 'tests/factories/users.ts';
import type { Talk, User } from '../../../prisma/generated/client.ts';
import { expect, useLoginSession, test } from '../../fixtures.ts';
import { TalkLibraryPage } from './talk-library.page.ts';

let user: User;
let talk1: Talk;
let talk2: Talk;
let talk3: Talk;

useLoginSession();

test.describe('when user has talks in their library', () => {
  test.beforeEach(async () => {
    user = await userFactory({ withPasswordAccount: true, withAuthSession: true });
    talk1 = await talkFactory({ speakers: [user], attributes: { title: 'My talk 1' } });
    talk2 = await talkFactory({ speakers: [user], attributes: { title: 'My talk 2' } });
    talk3 = await talkFactory({ speakers: [user], attributes: { title: 'My talk 3' }, traits: ['archived'] });
  });

  test('displays the talks', async ({ page }) => {
    const talkLibraryPage = new TalkLibraryPage(page);
    await talkLibraryPage.goto();

    await expect(talkLibraryPage.talks).toHaveCount(2);
    await expect(talkLibraryPage.talkLink('My talk 1')).toHaveAttribute('href', `/speaker/talks/${talk1.id}`);
    await expect(talkLibraryPage.talkLink('My talk 2')).toHaveAttribute('href', `/speaker/talks/${talk2.id}`);

    await talkLibraryPage.clickOnArchivedTalks();
    await expect(talkLibraryPage.talks).toHaveCount(1);
    await expect(talkLibraryPage.talkLink('My talk 3')).toHaveAttribute('href', `/speaker/talks/${talk3.id}`);

    await talkLibraryPage.clickOnAllTalks();
    await expect(talkLibraryPage.talks).toHaveCount(3);

    const talkPage = await talkLibraryPage.clickOnTalk('My talk 1');
    await talkPage.waitFor();
    await expect(page.getByRole('heading', { name: 'My Talk 1' })).toBeVisible();
  });

  test('navigates to new talk page', async ({ page }) => {
    const talkLibraryPage = new TalkLibraryPage(page);
    await talkLibraryPage.goto();

    const newTalkPage = await talkLibraryPage.clickOnNewTalk();
    await newTalkPage.waitFor();
  });
});

test.describe('when user has no talks in their library', () => {
  test.beforeEach(async () => {
    await userFactory({ withPasswordAccount: true, withAuthSession: true });
  });

  test('displays a message', async ({ page }) => {
    const talkLibraryPage = new TalkLibraryPage(page);
    await talkLibraryPage.goto();

    await expect(talkLibraryPage.noTalks).toBeVisible();
  });
});
