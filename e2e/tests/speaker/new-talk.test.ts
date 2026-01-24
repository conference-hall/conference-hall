import { userFactory } from 'tests/factories/users.ts';
import { expect, useLoginSession, test } from '../../fixtures.ts';
import { NewTalkPage } from './new-talk.page.ts';

useLoginSession();

test('create a new talk', async ({ page }) => {
  const user = await userFactory({ withPasswordAccount: true, withAuthSession: true });

  const newTalkPage = new NewTalkPage(page);
  await newTalkPage.goto();

  const talkPage = await newTalkPage.fillForm(
    'Awesome title',
    'Awesome abstract',
    'Intermediate',
    'English',
    'Best talk ever!',
  );
  await expect(newTalkPage.toast).toHaveText('New talk created.');

  await talkPage.waitFor();
  await talkPage.clickOnReferences();

  await expect(talkPage.speaker(user.name)).toBeVisible();
  await expect(page.getByText('Awesome title')).toBeVisible();
  await expect(page.getByText('Awesome abstract')).toBeVisible();
  await expect(page.getByText('Intermediate')).toBeVisible();
  await expect(page.getByText('English')).toBeVisible();
  await expect(page.getByText('Best talk ever!')).toBeVisible();

  // TODO: Add component tests to test required fields (creation / edition)
});
