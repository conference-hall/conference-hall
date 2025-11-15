import { eventFactory } from '@conference-hall/database/tests/factories/events.ts';
import { teamFactory } from '@conference-hall/database/tests/factories/team.ts';
import { userFactory } from '@conference-hall/database/tests/factories/users.ts';
import { flags } from '~/shared/feature-flags/flags.server.ts';
import { expect, loginWith, test } from '../../../helpers/fixtures.ts';
import { ReviewsSettingsPage } from './reviews-settings.page.ts';

loginWith('clark-kent');

test('updates reviews settings', async ({ page }) => {
  await flags.set('speakersCommunication', true);

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

  // Disable speaker conversations
  await reviewsPage.speakerConversationsSwitch.click();
  await expect(reviewsPage.toast).toHaveText('Review setting saved.');

  await reviewsPage.goto(team.slug, event.slug);
  await expect(reviewsPage.speakerConversationsSwitch).not.toBeChecked();
});
