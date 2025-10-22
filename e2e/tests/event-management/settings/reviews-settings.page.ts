import { PageObject } from 'e2e/page-object.ts';

export class ReviewsSettingsPage extends PageObject {
  readonly heading = this.page.getByRole('heading', { name: 'Reviews' });
  readonly enableReviewSwitch = this.page.getByRole('switch', { name: 'Enable proposal reviews' });
  readonly displayReviewsSwitch = this.page.getByRole('switch', { name: 'Show all team reviews' });
  readonly displaySpeakersSwitch = this.page.getByRole('switch', { name: 'Show speaker details' });
  readonly speakerConversationsSwitch = this.page.getByRole('switch', { name: 'Enable speaker conversations' });

  async goto(team: string, event: string) {
    await this.page.goto(`/team/${team}/${event}/settings/review`);
    await this.waitFor();
  }

  async waitFor() {
    await this.heading.waitFor();
  }
}
