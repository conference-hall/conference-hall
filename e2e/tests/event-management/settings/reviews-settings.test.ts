import { expect, loginWith, test } from 'e2e/fixtures.ts';
import { eventFactory } from 'tests/factories/events.ts';
import { teamFactory } from 'tests/factories/team.ts';
import { userFactory } from 'tests/factories/users.ts';
import { ReviewsSettingsPage } from './reviews-settings.page.ts';

loginWith('clark-kent');

test('updates reviews settings', async ({ page }) => {
  const user = await userFactory({ traits: ['clark-kent'] });
  const team = await teamFactory({ owners: [user] });
  const event = await eventFactory({ team, traits: ['conference-cfp-open'] });

  const reviewsPage = new ReviewsSettingsPage(page);
  await reviewsPage.goto(team.slug, event.slug);

  // Default values
  await expect(reviewsPage.enableReviewSwitch).toBeChecked();
  await expect(reviewsPage.displayReviewsSwitch).toBeChecked();
  await expect(reviewsPage.displaySpeakersSwitch).toBeChecked();

  // Disable reviews
  await reviewsPage.enableReviewSwitch.click();
  await expect(reviewsPage.toast).toHaveText('Review setting saved.');

  await reviewsPage.goto(team.slug, event.slug);
  await expect(reviewsPage.enableReviewSwitch).not.toBeChecked();

  // Display display other reviews
  await reviewsPage.displayReviewsSwitch.click();
  await expect(reviewsPage.toast).toHaveText('Review setting saved.');

  await reviewsPage.goto(team.slug, event.slug);
  await expect(reviewsPage.displayReviewsSwitch).not.toBeChecked();

  // Display speakers
  await reviewsPage.displaySpeakersSwitch.click();
  await expect(reviewsPage.toast).toHaveText('Review setting saved.');

  await reviewsPage.goto(team.slug, event.slug);
  await expect(reviewsPage.displaySpeakersSwitch).not.toBeChecked();
});
