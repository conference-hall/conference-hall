import { expect, loginWith, test } from 'e2e/fixtures.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { TracksSettingsPage } from './tracks-settings.page.ts';

loginWith('clark-kent');

test('adds, edits and removes a format', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'] });
  const team = await teamFactory({ owners: [user] });
  const event = await eventFactory({ team, traits: ['conference-cfp-open'] });

  const tracksPage = new TracksSettingsPage(page);
  await tracksPage.goto(team.slug, event.slug);

  // New track format
  await tracksPage.newFormatButton.click();
  await tracksPage.formatModal.waitFor();
  await tracksPage.nameInput.fill('Quickie');
  await tracksPage.descriptionInput.fill('A short talk');
  await tracksPage.saveFormatButton.click();

  // Check the new track format
  await expect(tracksPage.formatsList).toHaveCount(1);
  const format = tracksPage.formatsList.first();
  await expect(format).toContainText('Quickie');
  await expect(format).toContainText('A short talk');

  // Edit the track format
  await format.getByRole('button', { name: 'Edit' }).click();
  await tracksPage.formatModal.waitFor();
  expect(tracksPage.nameInput).toHaveValue('Quickie');
  expect(tracksPage.descriptionInput).toHaveValue('A short talk');
  await tracksPage.nameInput.fill('Conference');
  await tracksPage.descriptionInput.fill('A long talk');
  await tracksPage.saveFormatButton.click();

  // Change the format settings
  await tracksPage.formatsRequiredSwitch.click();
  await expect(tracksPage.toast).toContainText('Track setting updated.');
  await tracksPage.formatsAllowMultipleSwitch.click();
  await expect(tracksPage.toast).toContainText('Track setting updated.');

  // Check the updated format settings
  await expect(tracksPage.formatsList).toHaveCount(1);
  await expect(format).toContainText('Conference');
  await expect(format).toContainText('A long talk');
  await expect(tracksPage.formatsRequiredSwitch).toBeChecked();
  await expect(tracksPage.formatsAllowMultipleSwitch).toBeChecked();

  // Delete a format
  await format.getByRole('button', { name: 'Remove' }).click();
  await expect(tracksPage.toast).toContainText('Track setting updated.');
  await expect(tracksPage.formatsList).toHaveCount(0);
});

test('adds, edits and removes a category', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'] });
  const team = await teamFactory({ owners: [user] });
  const event = await eventFactory({ team, traits: ['conference-cfp-open'] });

  const tracksPage = new TracksSettingsPage(page);
  await tracksPage.goto(team.slug, event.slug);

  // New track category
  await tracksPage.newCategoryButton.click();
  await tracksPage.categoryModal.waitFor();
  await tracksPage.nameInput.fill('Beginner');
  await tracksPage.descriptionInput.fill('For beginners');
  await tracksPage.saveCategoryButton.click();

  // Check the new track category
  await expect(tracksPage.categoriesList).toHaveCount(1);
  const category = tracksPage.categoriesList.first();
  await expect(category).toContainText('Beginner');
  await expect(category).toContainText('For beginners');

  // Edit the track category
  await category.getByRole('button', { name: 'Edit' }).click();
  await tracksPage.categoryModal.waitFor();
  expect(tracksPage.nameInput).toHaveValue('Beginner');
  expect(tracksPage.descriptionInput).toHaveValue('For beginners');
  await tracksPage.nameInput.fill('Intermediate');
  await tracksPage.descriptionInput.fill('For intermediates');
  await tracksPage.saveCategoryButton.click();

  // Change the category settings
  await tracksPage.categoriesRequiredSwitch.click();
  await expect(tracksPage.toast).toContainText('Track setting updated.');
  await tracksPage.categoriesAllowMultipleSwitch.click();
  await expect(tracksPage.toast).toContainText('Track setting updated.');

  // Check the updated category settings
  await expect(tracksPage.categoriesList).toHaveCount(1);
  await expect(category).toContainText('Intermediate');
  await expect(category).toContainText('For intermediates');
  await expect(tracksPage.categoriesRequiredSwitch).toBeChecked();
  await expect(tracksPage.categoriesAllowMultipleSwitch).toBeChecked();

  // Delete a category
  await category.getByRole('button', { name: 'Remove' }).click();
  await expect(tracksPage.toast).toContainText('Track setting updated.');
  await expect(tracksPage.formatsList).toHaveCount(0);
});
