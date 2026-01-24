import { expect, test } from '../../fixtures.ts';
import { userLoggedFactory } from '../../helpers.ts';
import { NewTalkPage } from './new-talk.page.ts';

test('create a new talk', async ({ page, context }) => {
  const user = await userLoggedFactory(context);

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
