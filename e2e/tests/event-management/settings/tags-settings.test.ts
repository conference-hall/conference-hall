import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { expect, loginWith, test } from '../../../fixtures.ts';
import { TagsSettingsPage } from './tags-settings.page.ts';

loginWith('clark-kent');

test('adds, edits and removes a tag', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'] });
  const team = await teamFactory({ owners: [user] });
  const event = await eventFactory({ team, traits: ['conference-cfp-open'] });

  const tagsPage = new TagsSettingsPage(page);
  await tagsPage.goto(team.slug, event.slug);
  await expect(tagsPage.noTagsMessage).toBeVisible();

  // New tags
  await tagsPage.newTagButton.click();
  await tagsPage.fill(tagsPage.nameInput, 'Foo');
  await tagsPage.createTagButton.click();
  await expect(tagsPage.toast).toContainText('Tag saved.');

  await tagsPage.newTagButton.click();
  await tagsPage.fill(tagsPage.nameInput, 'Bar');
  await tagsPage.createTagButton.click();
  await expect(tagsPage.toast).toContainText('Tag saved.');

  await expect(tagsPage.tagsList).toHaveCount(2);

  // Search tags
  await tagsPage.fill(tagsPage.searchTagsInput, 'Bar');
  await page.keyboard.press('Enter');
  await expect(tagsPage.tagsList).toHaveCount(1);
  await expect(tagsPage.tagsList.first()).toContainText('Bar');

  // Edit tag
  const tag = tagsPage.tagsList.first();
  await tag.getByRole('button', { name: 'Edit' }).click();
  await tagsPage.fill(tagsPage.nameInput, 'BarBaz');
  await tagsPage.saveTagButton.click();
  await expect(tagsPage.toast).toContainText('Tag saved.');
  await expect(tagsPage.tagsList.first()).toContainText('BarBaz');

  // Delete tag
  page.on('dialog', (dialog) => dialog.accept());
  await tag.getByRole('button', { name: 'Delete' }).click();
  await expect(tagsPage.toast).toContainText('Tag deleted.');
  await expect(tagsPage.noTagsMessage).toBeVisible();
});
